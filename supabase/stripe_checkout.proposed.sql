
BEGIN;

-- Required database permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles
    WHERE rolname = 'service_role' AND rolbypassrls
  )
  OR NOT has_schema_privilege('service_role', 'public', 'USAGE')
  OR NOT has_schema_privilege('authenticated', 'public', 'USAGE')
  THEN
    RAISE EXCEPTION 'Required service-role/RLS permissions are missing';
  END IF;
END $$;

GRANT SELECT (
  id, business_id, name, unit, price,
  is_available, stock_quantity
) ON public.products TO service_role;

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  account_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id text NOT NULL UNIQUE
    CHECK (
      stripe_session_id ~ '^cs_test_[A-Za-z0-9_]+$'
      AND length(stripe_session_id) <= 255
    ),
  stripe_event_id text NOT NULL UNIQUE
    CHECK (
      stripe_event_id ~ '^evt_[A-Za-z0-9]+$'
      AND length(stripe_event_id) <= 255
    ),
  status text NOT NULL DEFAULT 'paid'
    CHECK (status = 'paid'),
  currency text NOT NULL DEFAULT 'cad'
    CHECK (currency = 'cad'),
  total_cents integer NOT NULL
    CHECK (total_cents BETWEEN 50 AND 99999999),
  is_test boolean NOT NULL DEFAULT true
    CHECK (is_test)
);

CREATE INDEX orders_account_id_idx
  ON public.orders(account_id);

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL
    REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid
    REFERENCES public.products(id) ON DELETE SET NULL,
  original_product_id uuid NOT NULL
    CHECK (original_product_id <> '00000000-0000-0000-0000-000000000000'),
  business_id_snapshot uuid NOT NULL
    CHECK (business_id_snapshot <> '00000000-0000-0000-0000-000000000000'),
  product_name text NOT NULL
    CHECK (
      length(btrim(product_name)) BETWEEN 1 AND 200
      AND product_name = btrim(product_name)
      AND product_name !~ '[[:cntrl:]]'
    ),
  unit text NOT NULL
    CHECK (
      length(btrim(unit)) BETWEEN 1 AND 40
      AND unit = btrim(unit)
      AND unit !~ '[[:cntrl:]]'
    ),
  quantity integer NOT NULL
    CHECK (quantity BETWEEN 1 AND 99),
  unit_price_cents integer NOT NULL
    CHECK (unit_price_cents BETWEEN 0 AND 99999999),
  UNIQUE(order_id, original_product_id)
);

CREATE INDEX order_items_product_id_idx
  ON public.order_items(product_id);

-- RLS and grants
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.orders, public.order_items
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.orders, public.order_items
  TO authenticated;

REVOKE ALL ON public.orders, public.order_items
  FROM service_role;

GRANT SELECT, INSERT ON public.orders, public.order_items
  TO service_role;

CREATE POLICY orders_customer_read
  ON public.orders FOR SELECT TO authenticated
  USING (account_id = (SELECT auth.uid()));

CREATE POLICY order_items_customer_read
  ON public.order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND o.account_id = (SELECT auth.uid())
    )
  );

-- Atomic, idempotent test-order recording
CREATE FUNCTION public.hatti_record_test_order(
  p_session_id text,
  p_event_id text,
  p_account_id uuid,
  p_total integer,
  p_items jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  order_key uuid;
  item jsonb;
  calculated bigint := 0;
  normalized jsonb := '[]'::jsonb;
  existing_items jsonb;
  product_uuid uuid;
  business_uuid uuid;
  seen uuid[] := '{}'::uuid[];
  item_quantity integer;
  item_price integer;
  existing_order public.orders%ROWTYPE;
  uuid_pattern CONSTANT text :=
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
BEGIN
  IF p_account_id IS NULL
    OR p_account_id = '00000000-0000-0000-0000-000000000000'
    OR p_session_id IS NULL
    OR p_session_id !~ '^cs_test_[A-Za-z0-9_]+$'
    OR length(p_session_id) > 255
    OR p_event_id IS NULL
    OR p_event_id !~ '^evt_[A-Za-z0-9]+$'
    OR length(p_event_id) > 255
    OR p_total IS NULL
    OR p_total NOT BETWEEN 50 AND 99999999
    OR jsonb_typeof(p_items) IS DISTINCT FROM 'array'
  THEN
    RAISE EXCEPTION 'Invalid test order';
  END IF;

  IF jsonb_array_length(p_items) NOT BETWEEN 1 AND 50 THEN
    RAISE EXCEPTION 'Invalid items';
  END IF;

  -- Validate all items before inserting
  FOR item IN
    SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF jsonb_typeof(item) IS DISTINCT FROM 'object' THEN
      RAISE EXCEPTION 'Item must be an object';
    END IF;

    IF NOT (
      item ?& ARRAY[
        'product_id','business_id','name',
        'unit','quantity','unit_price'
      ]
    )
    OR (
      item - ARRAY[
        'product_id','business_id','name',
        'unit','quantity','unit_price'
      ]
    ) <> '{}'::jsonb
    THEN
      RAISE EXCEPTION 'Invalid item fields';
    END IF;

    IF jsonb_typeof(item->'quantity') IS DISTINCT FROM 'number'
      OR jsonb_typeof(item->'unit_price') IS DISTINCT FROM 'number'
      OR (item->>'quantity') !~ '^[1-9][0-9]?$'
      OR (item->>'unit_price') !~ '^(0|[1-9][0-9]{0,7})$'
    THEN
      RAISE EXCEPTION 'Invalid quantity or unit price';
    END IF;

    IF jsonb_typeof(item->'product_id') IS DISTINCT FROM 'string'
      OR jsonb_typeof(item->'business_id') IS DISTINCT FROM 'string'
      OR (item->>'product_id') !~ uuid_pattern
      OR (item->>'business_id') !~ uuid_pattern
    THEN
      RAISE EXCEPTION 'Invalid product or business UUID';
    END IF;

    product_uuid := (item->>'product_id')::uuid;
    business_uuid := (item->>'business_id')::uuid;

    IF product_uuid = '00000000-0000-0000-0000-000000000000'
      OR business_uuid = '00000000-0000-0000-0000-000000000000'
      OR product_uuid = ANY(seen)
    THEN
      RAISE EXCEPTION 'Nil or duplicate product/business UUID';
    END IF;

    IF jsonb_typeof(item->'name') IS DISTINCT FROM 'string'
      OR jsonb_typeof(item->'unit') IS DISTINCT FROM 'string'
      OR length(btrim(item->>'name')) NOT BETWEEN 1 AND 200
      OR length(btrim(item->>'unit')) NOT BETWEEN 1 AND 40
      OR (item->>'name') <> btrim(item->>'name')
      OR (item->>'unit') <> btrim(item->>'unit')
      OR (item->>'name') ~ '[[:cntrl:]]'
      OR (item->>'unit') ~ '[[:cntrl:]]'
    THEN
      RAISE EXCEPTION 'Invalid product name or unit';
    END IF;

    item_quantity := (item->>'quantity')::integer;
    item_price := (item->>'unit_price')::integer;

    seen := array_append(seen, product_uuid);
    calculated := calculated
      + item_quantity::bigint * item_price;

    normalized := normalized || jsonb_build_array(
      jsonb_build_object(
        'product_id', product_uuid,
        'business_id', business_uuid,
        'name', item->>'name',
        'unit', item->>'unit',
        'quantity', item_quantity,
        'unit_price', item_price
      )
    );
  END LOOP;

  IF calculated IS DISTINCT FROM p_total::bigint THEN
    RAISE EXCEPTION 'Total mismatch';
  END IF;

  SELECT jsonb_agg(value ORDER BY value->>'product_id')
    INTO normalized
  FROM jsonb_array_elements(normalized);

  INSERT INTO public.orders (
    account_id, stripe_session_id,
    stripe_event_id, total_cents
  )
  VALUES (
    p_account_id, p_session_id,
    p_event_id, p_total
  )
  ON CONFLICT (stripe_session_id) DO NOTHING
  RETURNING id INTO order_key;

  -- Handle webhook retries
  IF order_key IS NULL THEN
    SELECT * INTO existing_order
    FROM public.orders
    WHERE stripe_session_id = p_session_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Concurrent order not visible; retry';
    END IF;

    IF existing_order.account_id IS DISTINCT FROM p_account_id
      OR existing_order.total_cents <> p_total
      OR existing_order.currency <> 'cad'
      OR existing_order.status <> 'paid'
      OR NOT existing_order.is_test
    THEN
      RAISE EXCEPTION 'Conflicting session replay';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.orders
      WHERE stripe_event_id = p_event_id
        AND id <> existing_order.id
    ) THEN
      RAISE EXCEPTION 'Event belongs to another session';
    END IF;

    SELECT jsonb_agg(
      jsonb_build_object(
        'product_id', original_product_id,
        'business_id', business_id_snapshot,
        'name', product_name,
        'unit', unit,
        'quantity', quantity,
        'unit_price', unit_price_cents
      )
      ORDER BY original_product_id::text
    )
    INTO existing_items
    FROM public.order_items
    WHERE order_id = existing_order.id;

    IF existing_items IS DISTINCT FROM normalized THEN
      RAISE EXCEPTION 'Incomplete or conflicting order replay';
    END IF;

    RETURN existing_order.id;
  END IF;

  -- Record purchased items
  FOR item IN
    SELECT value FROM jsonb_array_elements(normalized)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      original_product_id,
      business_id_snapshot,
      product_name,
      unit,
      quantity,
      unit_price_cents
    )
    VALUES (
      order_key,
      (
        SELECT id FROM public.products
        WHERE id = (item->>'product_id')::uuid
      ),
      (item->>'product_id')::uuid,
      (item->>'business_id')::uuid,
      item->>'name',
      item->>'unit',
      (item->>'quantity')::integer,
      (item->>'unit_price')::integer
    );
  END LOOP;

  RETURN order_key;
END;
$$;

REVOKE ALL ON FUNCTION public.hatti_record_test_order(
  text, text, uuid, integer, jsonb
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.hatti_record_test_order(
  text, text, uuid, integer, jsonb
) TO service_role;

NOTIFY pgrst, 'reload schema';

COMMIT;
