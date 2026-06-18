create table if not exists public.ai_insights (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  insight_type text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  report_data jsonb not null default '{"formatVersion": 2, "analytics": {}, "narrative": {}}'::jsonb,
  related_entry_ids text[] not null default '{}',
  source_entry_count integer not null default 0,
  source_latest_updated_at timestamptz,
  source_snapshot_hash text not null default '',
  format_version integer not null default 2,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_insights
add column if not exists user_id text,
add column if not exists insight_type text,
add column if not exists period_start timestamptz,
add column if not exists period_end timestamptz,
add column if not exists report_data jsonb,
add column if not exists related_entry_ids text[] default '{}',
add column if not exists source_entry_count integer default 0,
add column if not exists source_latest_updated_at timestamptz,
add column if not exists source_snapshot_hash text default '',
add column if not exists format_version integer default 2,
add column if not exists model text,
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now();

update public.ai_insights
set
  report_data = coalesce(report_data, '{"formatVersion": 1}'::jsonb),
  related_entry_ids = coalesce(related_entry_ids, '{}'),
  source_entry_count = coalesce(source_entry_count, 0),
  source_snapshot_hash = coalesce(source_snapshot_hash, ''),
  format_version = coalesce(format_version, 1),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.ai_insights
alter column user_id set not null,
alter column insight_type set not null,
alter column period_start set not null,
alter column period_end set not null,
alter column report_data set not null,
alter column report_data set default '{"formatVersion": 2, "analytics": {}, "narrative": {}}'::jsonb,
alter column related_entry_ids set not null,
alter column related_entry_ids set default '{}',
alter column source_entry_count set not null,
alter column source_entry_count set default 0,
alter column source_snapshot_hash set not null,
alter column source_snapshot_hash set default '',
alter column format_version set not null,
alter column format_version set default 2,
alter column created_at set not null,
alter column created_at set default now(),
alter column updated_at set not null,
alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ai_insights_user_id_fkey'
      and conrelid = 'public.ai_insights'::regclass
  ) then
    alter table public.ai_insights
    add constraint ai_insights_user_id_fkey
    foreign key (user_id)
    references public.profiles(id)
    on delete cascade;
  end if;
end $$;

create unique index if not exists ai_insights_user_period_unique_idx
on public.ai_insights(user_id, insight_type, period_start, period_end);

create index if not exists ai_insights_user_id_idx
on public.ai_insights(user_id);

create index if not exists ai_insights_period_idx
on public.ai_insights(insight_type, period_start, period_end);

alter table public.ai_insights enable row level security;

grant select, insert, update, delete
on table public.ai_insights
to authenticated;

drop policy if exists "Users can select own AI insights"
on public.ai_insights;

create policy "Users can select own AI insights"
on public.ai_insights
for select
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can insert own AI insights"
on public.ai_insights;

create policy "Users can insert own AI insights"
on public.ai_insights
for insert
to authenticated
with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can update own AI insights"
on public.ai_insights;

create policy "Users can update own AI insights"
on public.ai_insights
for update
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'))
with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can delete own AI insights"
on public.ai_insights;

create policy "Users can delete own AI insights"
on public.ai_insights
for delete
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'));
