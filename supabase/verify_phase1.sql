-- Run AFTER the security migration in SQL Editor. All actions here are read only.
-- This proves direct-role privileges. Use the two-account checks in docs/phase-1.md
-- for ownership operations; grants alone do not prove RLS correctness.
begin;
do $$
declare role_name text;
begin
  foreach role_name in array array['anon', 'authenticated'] loop
    if not has_column_privilege(role_name, 'public."Businesses"', 'id', 'SELECT')
      or not has_column_privilege(role_name, 'public."Businesses"', 'name', 'SELECT')
      or not has_column_privilege(role_name, 'public."Businesses"', 'description', 'SELECT') then
      raise exception '% cannot read public business fields', role_name;
    end if;
    if has_column_privilege(role_name, 'public."Businesses"', 'account_id', 'SELECT') then
      raise exception '% can read private owner IDs', role_name;
    end if;
  end loop;
  if has_any_column_privilege('anon', 'public."Businesses"', 'INSERT')
    or has_any_column_privilege('anon', 'public."Businesses"', 'UPDATE')
    or has_table_privilege('anon', 'public."Businesses"', 'DELETE') then
    raise exception 'Anonymous business writes are permitted';
  end if;
  if has_column_privilege('authenticated', 'public."Businesses"', 'account_id', 'UPDATE') then
    raise exception 'Owner reassignment is permitted';
  end if;
  if has_function_privilege('anon', 'public.hatti_my_business()', 'EXECUTE') then
    raise exception 'Anonymous access to owner RPC is permitted';
  end if;
  if not has_function_privilege('authenticated', 'public.hatti_my_business()', 'EXECUTE') then
    raise exception 'Owner RPC is unavailable';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public."Businesses"'::regclass) then
    raise exception 'RLS is disabled';
  end if;
end $$;
set local role anon;
select id, name, description from public."Businesses" limit 1;
rollback;
