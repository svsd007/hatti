-- APPROVAL REQUIRED. Not executed by the assistant.
-- Repairs only the malformed UUID pattern in the existing function.
-- Preserves the user's other edits, signature, grants, and all table data.
begin;
do $repair$
declare
  function_definition text;
  wrong_pattern constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
  right_pattern constant text := '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
begin
  select pg_get_functiondef('public.hatti_record_test_order(text,text,uuid,integer,jsonb)'::regprocedure)
    into function_definition;
  if strpos(function_definition, wrong_pattern) = 0 then
    raise exception 'Expected malformed pattern not found; inspect the current function before continuing';
  end if;
  if (length(function_definition) - length(replace(function_definition, wrong_pattern, ''))) <> length(wrong_pattern) then
    raise exception 'Expected exactly one malformed pattern; no changes made';
  end if;
  execute replace(function_definition, wrong_pattern, right_pattern);
end
$repair$;
notify pgrst, 'reload schema';
commit;
