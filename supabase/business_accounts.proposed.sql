-- PROPOSAL ONLY: review and approve before running as project administrator.
-- Supersedes 202610150001_business_listings.sql. Do not run both files.
-- No table/column/index changes and no existing row changes.
begin;

-- Abort if the reviewed RLS configuration has changed; never silently expose writes.
do $
begin
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname in ('Businesses','products') and not c.relrowsecurity)
  then raise exception 'RLS must already be enabled on Businesses and products'; end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename in ('Businesses','products')
    and cmd <> 'SELECT' and policyname not in ('hatti_business_registration','hatti_product_publish','hatti_product_edit','hatti_product_delete'))
  then raise exception 'Unexpected write policy: review it before applying this proposal'; end if;
end $;
-- Reset table privileges, then explicitly allow only the operations below.
revoke all on public."Businesses", public.products from public, anon, authenticated;
-- Column grants survive table-level revocation. Protect immutable identifiers too.
revoke insert (id,created_at), update (id,created_at,name,description,account_id,location)
  on public."Businesses" from public, anon, authenticated;
revoke insert (created_at), update (id,created_at,business_id)
  on public.products from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select (id,name,description,location) on public."Businesses" to anon, authenticated;
grant select (id,created_at,business_id,name,description,is_available,price,unit,category,stock_quantity,image_path,further_description)
  on public.products to anon, authenticated;
grant insert (name,description,location,account_id) on public."Businesses" to authenticated;
grant insert (id,business_id,name,description,further_description,is_available,price,unit,category,stock_quantity,image_path)
  on public.products to authenticated;

grant update (name,description,further_description,is_available,price,unit,category,stock_quantity,image_path)
  on public.products to authenticated;
grant delete on public.products to authenticated;

-- Private ownership is checked on the server, never exposed as a public column.
create or replace function public.hatti_my_business()
returns table (id uuid, name text, description text, location text)
language sql stable security definer set search_path = ''
as $$
  select b.id,b.name,b.description,b.location from public."Businesses" b
  where b.account_id = (select auth.uid()) and (select auth.uid()) is not null;
$$;
revoke all on function public.hatti_my_business() from public, anon;
grant execute on function public.hatti_my_business() to authenticated;

create or replace function public.hatti_owns_business(business uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public."Businesses" b
    where b.id = business and b.account_id = (select auth.uid())
      and (select auth.uid()) is not null);
$$;
revoke all on function public.hatti_owns_business(uuid) from public, anon;
grant execute on function public.hatti_owns_business(uuid) to authenticated;

-- Only policies introduced by this migration are replaced on reruns.
drop policy if exists hatti_business_registration on public."Businesses";
create policy hatti_business_registration on public."Businesses"
  for insert to authenticated with check (
    account_id = (select auth.uid()) and length(trim(name)) between 1 and 150
    and length(trim(location)) between 1 and 200
  );
drop policy if exists hatti_business_listing_read on public."Businesses";
create policy hatti_business_listing_read on public."Businesses" for select to anon, authenticated using (true);
drop policy if exists hatti_product_listing_read on public.products;
create policy hatti_product_listing_read on public.products for select to anon, authenticated using (true);
drop policy if exists hatti_product_publish on public.products;
create policy hatti_product_publish on public.products for insert to authenticated with check (
  public.hatti_owns_business(business_id)
  and price between 0 and 100000000
  and (stock_quantity is null or stock_quantity >= 0)
  and length(trim(name)) between 1 and 150
  and length(trim(unit)) between 1 and 40
  and (description is null or length(description) <= 150)
  and (further_description is null or length(further_description) <= 20000)
  and (image_path is null or split_part(image_path, '/', 1) = (select auth.uid()::text))
);

drop policy if exists hatti_product_edit on public.products;
create policy hatti_product_edit on public.products for update to authenticated
  using (public.hatti_owns_business(business_id))
  with check (
    public.hatti_owns_business(business_id)
    and price between 0 and 100000000
    and (stock_quantity is null or stock_quantity >= 0)
    and length(trim(name)) between 1 and 150
    and length(trim(unit)) between 1 and 40
    and (description is null or length(description) <= 150)
    and (further_description is null or length(further_description) <= 20000)
    and (image_path is null or split_part(image_path, '/', 1) = (select auth.uid()::text))
  );
drop policy if exists hatti_product_delete on public.products;
create policy hatti_product_delete on public.products for delete to authenticated
  using (public.hatti_owns_business(business_id));

-- Existing public bucket: objects are placed under the uploader's UUID folder.
drop policy if exists hatti_product_image_upload on storage.objects;
create policy hatti_product_image_upload on storage.objects for insert to authenticated with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (select 1 from public.hatti_my_business())
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
);
drop policy if exists hatti_product_image_owner_read on storage.objects;
create policy hatti_product_image_owner_read on storage.objects for select to authenticated using (
  bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text)
);
drop policy if exists hatti_product_image_cleanup on storage.objects;
create policy hatti_product_image_cleanup on storage.objects for delete to authenticated using (
  bucket_id = 'product-images' and (storage.foldername(name))[1] = (select auth.uid()::text)
  and not exists (select 1 from public.products p where p.image_path = storage.objects.name
    or p.image_path = 'product-images/' || storage.objects.name)
);

notify pgrst, 'reload schema';
commit;
