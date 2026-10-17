-- PROPOSED: not applied. Allows public browsing of existing catalog data.
-- Does not grant writes or access to Businesses.account_id.
begin;

grant usage on schema public to anon, authenticated;
grant select (id, name, description, location)
  on public."Businesses" to anon, authenticated;
grant select (id, created_at, business_id, name, description, is_available,
  price, unit, category, stock_quantity, image_path)
  on public.products to anon, authenticated;

-- Businesses already has a SELECT policy using (true).
-- Products needs its own read policy; unavailable items remain visible but unbuyable.
create policy "hatti_catalog_public_read"
  on public.products for select to anon, authenticated using (true);

commit;
