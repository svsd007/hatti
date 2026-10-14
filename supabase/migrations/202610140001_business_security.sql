-- Phase 1 security migration: REVIEW supabase/audit.sql output first.
-- Requires existing UUID id/account_id and text name/description columns.
-- No existing business rows are changed or removed. Duplicate ownership aborts.
begin;

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public'
    and table_name = 'Businesses' and column_name = 'account_id' and data_type = 'uuid') then
    raise exception 'Expected Businesses.account_id UUID; review actual schema before migrating';
  end if;
  if exists (select 1 from public."Businesses" where account_id is not null
    group by account_id having count(*) > 1) then
    raise exception 'Multiple businesses exist for one account. Review ownership; migration will not delete records.';
  end if;
end $$;

create unique index if not exists hatti_business_one_per_account
  on public."Businesses" (account_id);

alter table public."Businesses" enable row level security;

-- Revoke table AND column grants: revoking the table grant alone is insufficient.
revoke all privileges on table public."Businesses" from public, anon, authenticated;
do $$
declare col record;
begin
  for col in select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'Businesses'
  loop
    execute format('revoke all privileges (%I) on table public."Businesses" from public, anon, authenticated', col.column_name);
  end loop;
end $$;

grant select (id, name, description) on public."Businesses" to anon, authenticated;
grant insert (id, name, description, account_id) on public."Businesses" to authenticated;
grant update (name, description) on public."Businesses" to authenticated;
grant delete on public."Businesses" to authenticated;

-- Replace existing policies so a permissive legacy policy cannot bypass ownership.
do $$
declare old_policy record;
begin
  for old_policy in select policyname from pg_policies
    where schemaname = 'public' and tablename = 'Businesses'
  loop
    execute format('drop policy %I on public."Businesses"', old_policy.policyname);
  end loop;
end $$;

create policy hatti_business_public_read on public."Businesses"
  for select to anon, authenticated using (true);
create policy hatti_business_owner_insert on public."Businesses"
  for insert to authenticated with check (account_id = (select auth.uid()));
create policy hatti_business_owner_update on public."Businesses"
  for update to authenticated using (account_id = (select auth.uid()))
  with check (account_id = (select auth.uid()));
create policy hatti_business_owner_delete on public."Businesses"
  for delete to authenticated using (account_id = (select auth.uid()));

-- Column privileges cannot vary per row. Private owner reads go through this
-- narrowly scoped RPC; it accepts no caller-supplied account ID.
create function public.hatti_my_business()
returns table (id uuid, name text, description text, account_id uuid)
language sql stable security definer set search_path = ''
as $$
  select b.id, b.name::text, b.description::text, b.account_id
  from public."Businesses" b
  where b.account_id = (select auth.uid()) and (select auth.uid()) is not null;
$$;
revoke all on function public.hatti_my_business() from public, anon, authenticated;
grant execute on function public.hatti_my_business() to authenticated;

-- Fail closed if inherited grants still expose private data.
do $$
begin
  if has_column_privilege('anon', 'public."Businesses"', 'account_id', 'SELECT')
    or has_column_privilege('authenticated', 'public."Businesses"', 'account_id', 'SELECT') then
    raise exception 'Inherited role grants still expose account_id; review role memberships before continuing';
  end if;
end $$;
notify pgrst, 'reload schema';
commit;
