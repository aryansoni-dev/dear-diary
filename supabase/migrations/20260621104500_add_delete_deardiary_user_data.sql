create or replace function public.delete_deardiary_user_data(target_user_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_achievement_states integer := 0;
  deleted_ai_insights integer := 0;
  deleted_entry_ai_reflections integer := 0;
  deleted_journal_entries integer := 0;
  deleted_profiles integer := 0;
begin
  if target_user_id is null or length(trim(target_user_id)) = 0 then
    raise exception 'target_user_id is required' using errcode = '22023';
  end if;

  if to_regclass('public.achievement_states') is not null then
    execute 'delete from public.achievement_states where user_id = $1'
    using target_user_id;
    get diagnostics deleted_achievement_states = row_count;
  end if;

  if to_regclass('public.entry_ai_reflections') is not null then
    execute 'delete from public.entry_ai_reflections where user_id = $1'
    using target_user_id;
    get diagnostics deleted_entry_ai_reflections = row_count;
  end if;

  if to_regclass('public.ai_insights') is not null then
    execute 'delete from public.ai_insights where user_id = $1'
    using target_user_id;
    get diagnostics deleted_ai_insights = row_count;
  end if;

  if to_regclass('public.journal_entries') is not null then
    execute 'delete from public.journal_entries where user_id = $1'
    using target_user_id;
    get diagnostics deleted_journal_entries = row_count;
  end if;

  if to_regclass('public.profiles') is not null then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'user_id'
    ) then
      execute 'delete from public.profiles where id = $1 or user_id = $1'
      using target_user_id;
    else
      execute 'delete from public.profiles where id = $1'
      using target_user_id;
    end if;

    get diagnostics deleted_profiles = row_count;
  end if;

  return jsonb_build_object(
    'deletedAchievementStates', deleted_achievement_states,
    'deletedAIInsights', deleted_ai_insights,
    'deletedEntryAIReflections', deleted_entry_ai_reflections,
    'deletedJournalEntries', deleted_journal_entries,
    'deletedProfiles', deleted_profiles
  );
end;
$$;

revoke execute on function public.delete_deardiary_user_data(text) from public;
revoke execute on function public.delete_deardiary_user_data(text) from anon;
revoke execute on function public.delete_deardiary_user_data(text) from authenticated;
grant execute on function public.delete_deardiary_user_data(text) to service_role;
