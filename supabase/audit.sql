-- READ ONLY: run in Supabase SQL Editor as the project administrator.
-- Save/review results before applying migrations. No user records are selected.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'Businesses'
order by ordinal_position;

select c.relname, c.relrowsecurity, c.relforcerowsecurity, c.relacl
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'Businesses';

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint where conrelid = 'public."Businesses"'::regclass;

select indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename = 'Businesses';

select grantee, privilege_type from information_schema.table_privileges
where table_schema = 'public' and table_name = 'Businesses';

select grantee, column_name, privilege_type from information_schema.column_privileges
where table_schema = 'public' and table_name = 'Businesses';

select policyname, roles, cmd, permissive, qual, with_check from pg_policies
where schemaname = 'public' and tablename = 'Businesses';

-- Include inherited/effective privileges, not just direct grant entries.
select role_name,
  has_table_privilege(role_name, 'public."Businesses"', 'SELECT') as table_select,
  has_column_privilege(role_name, 'public."Businesses"', 'id', 'SELECT') as public_id_select,
  has_column_privilege(role_name, 'public."Businesses"', 'account_id', 'SELECT') as private_owner_select,
  has_table_privilege(role_name, 'public."Businesses"', 'INSERT') as table_insert,
  has_table_privilege(role_name, 'public."Businesses"', 'UPDATE') as table_update
from (values ('anon'), ('authenticated')) roles(role_name);

-- Review views and SECURITY DEFINER functions for alternate exposure paths.
select schemaname, viewname, definition from pg_views where schemaname = 'public';
select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef, p.proconfig, p.proacl, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.prokind = 'f' and p.prosecdef;

-- Only counts; never deletes or exposes existing owner IDs.
select count(*) as accounts_with_multiple_businesses
from (select account_id from public."Businesses"
      where account_id is not null group by account_id having count(*) > 1) duplicates;
