create table if not exists public.entry_ai_reflections (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  entry_id text not null references public.journal_entries(id) on delete cascade,

  summary text not null,
  emotions text[] not null default '{}',
  themes text[] not null default '{}',
  observation text,
  follow_up_question text,
  suggestion text,

  model text,
  source_entry_updated_at timestamptz not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique(user_id, entry_id)
);

create index if not exists entry_ai_reflections_user_id_idx
on public.entry_ai_reflections(user_id);

create index if not exists entry_ai_reflections_entry_id_idx
on public.entry_ai_reflections(entry_id);

alter table public.entry_ai_reflections enable row level security;

grant select, insert, update, delete
on table public.entry_ai_reflections
to authenticated;

drop policy if exists "Users can select own entry AI reflections"
on public.entry_ai_reflections;

create policy "Users can select own entry AI reflections"
on public.entry_ai_reflections
for select
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can insert own entry AI reflections"
on public.entry_ai_reflections;

create policy "Users can insert own entry AI reflections"
on public.entry_ai_reflections
for insert
to authenticated
with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can update own entry AI reflections"
on public.entry_ai_reflections;

create policy "Users can update own entry AI reflections"
on public.entry_ai_reflections
for update
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'))
with check (user_id = (select auth.jwt() ->> 'sub'));

drop policy if exists "Users can delete own entry AI reflections"
on public.entry_ai_reflections;

create policy "Users can delete own entry AI reflections"
on public.entry_ai_reflections
for delete
to authenticated
using (user_id = (select auth.jwt() ->> 'sub'));
