alter table public.ai_insights
add column if not exists period_type text,
add column if not exists title text,
add column if not exists summary text,
add column if not exists mood_summary jsonb,
add column if not exists recurring_themes text[] default '{}';

update public.ai_insights
set
  period_type = coalesce(period_type, insight_type, 'weekly'),
  title = coalesce(title, 'Reflection Report'),
  summary = coalesce(summary, 'Open this report to view the full reflection.'),
  recurring_themes = coalesce(recurring_themes, '{}');

alter table public.ai_insights
alter column period_type set not null,
alter column period_type set default 'weekly',
alter column title set not null,
alter column title set default 'Reflection Report',
alter column summary set not null,
alter column summary set default '',
alter column recurring_themes set not null,
alter column recurring_themes set default '{}';

alter table public.ai_insights
drop constraint if exists ai_insights_period_type_check;

alter table public.ai_insights
add constraint ai_insights_period_type_check
check (period_type in ('weekly', 'monthly'));

drop policy if exists "Users can manage own AI insights"
on public.ai_insights;

create unique index if not exists ai_insights_user_period_unique_idx
on public.ai_insights(user_id, insight_type, period_start, period_end);
