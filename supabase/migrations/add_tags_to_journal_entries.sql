alter table journal_entries
add column if not exists tags text[] not null default '{}';

create or replace function public.merge_journal_entries(entries jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
perform 1
from jsonb_to_recordset(entries) as incoming (
user_id text
)
where incoming.user_id is null
or incoming.user_id is distinct from (select auth.jwt() ->> 'sub')
limit 1;

if found then
raise exception 'Journal entry user_id does not match authenticated user'
using errcode = '42501';
end if;

insert into public.journal_entries as existing (
id,
user_id,
title,
content,
mood,
type,
prompt,
tags,
created_at,
updated_at,
deleted_at
)
select
incoming.id,
incoming.user_id,
incoming.title,
incoming.content,
incoming.mood,
incoming.type,
incoming.prompt,
coalesce(array_remove(incoming.tags, null), '{}'),
incoming.created_at,
incoming.updated_at,
incoming.deleted_at
from jsonb_to_recordset(entries) as incoming (
id text,
user_id text,
title text,
content text,
mood text,
type text,
prompt text,
tags text[],
created_at timestamptz,
updated_at timestamptz,
deleted_at timestamptz
)
where incoming.user_id = (select auth.jwt() ->> 'sub')
on conflict (id) do update
set
title = excluded.title,
content = excluded.content,
mood = excluded.mood,
type = excluded.type,
prompt = excluded.prompt,
tags = excluded.tags,
updated_at = excluded.updated_at,
deleted_at = excluded.deleted_at
where excluded.updated_at > existing.updated_at;

end;
$$
;

revoke execute on function public.merge_journal_entries(jsonb) from public;
revoke execute on function public.merge_journal_entries(jsonb) from anon;
grant execute on function public.merge_journal_entries(jsonb) to authenticated;
