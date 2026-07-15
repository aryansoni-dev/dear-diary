create extension if not exists "pgcrypto";

create table if not exists public.subscription_status (
  user_id text not null references public.profiles(id) on delete cascade,
  entitlement_id text not null,
  is_active boolean not null default false,
  product_id text,
  store text,
  expires_at timestamptz,
  will_renew boolean,
  last_event_at timestamptz,
  updated_at timestamptz not null default now(),

  primary key (user_id, entitlement_id)
);

create index if not exists subscription_status_active_idx
on public.subscription_status(user_id, entitlement_id, is_active);

alter table public.subscription_status enable row level security;

grant select on table public.subscription_status to authenticated;

drop policy if exists "Users can select own subscription status"
on public.subscription_status;

create policy "Users can select own subscription status"
on public.subscription_status
for select
to authenticated
using (user_id = requesting_user_id());

create table if not exists public.ai_usage_ledger (
  id text primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  period_key text not null,
  feature text not null,
  count integer not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, period_key, feature)
);

create index if not exists ai_usage_ledger_user_period_idx
on public.ai_usage_ledger(user_id, period_key);

alter table public.ai_usage_ledger enable row level security;

grant select on table public.ai_usage_ledger to authenticated;

drop policy if exists "Users can select own AI usage"
on public.ai_usage_ledger;

create policy "Users can select own AI usage"
on public.ai_usage_ledger
for select
to authenticated
using (user_id = requesting_user_id());

create or replace function public.increment_ai_usage_if_allowed(
  p_user_id text,
  p_period_key text,
  p_feature text,
  p_is_pro boolean,
  p_free_limit integer,
  p_pro_limit integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_limit integer;
  next_count integer;
  current_count integer;
  ledger_id text;
begin
  if p_user_id is null or length(trim(p_user_id)) = 0 then
    return jsonb_build_object(
      'allowed', false,
      'code', 'INVALID_USAGE_REQUEST',
      'feature', p_feature,
      'limit', 0,
      'period', 'monthly'
    );
  end if;

  if p_period_key !~ '^[0-9]{4}-[0-9]{2}$' then
    return jsonb_build_object(
      'allowed', false,
      'code', 'INVALID_USAGE_REQUEST',
      'feature', p_feature,
      'limit', 0,
      'period', 'monthly'
    );
  end if;

  selected_limit := case
    when p_is_pro then p_pro_limit
    else p_free_limit
  end;

  select coalesce(count, 0)
  into current_count
  from public.ai_usage_ledger
  where user_id = p_user_id
    and period_key = p_period_key
    and feature = p_feature;

  current_count := coalesce(current_count, 0);

  if selected_limit is not null and selected_limit <= 0 then
    return jsonb_build_object(
      'allowed', false,
      'code', 'QUOTA_EXHAUSTED',
      'count', current_count,
      'feature', p_feature,
      'limit', selected_limit,
      'period', 'monthly'
    );
  end if;

  if selected_limit is not null and current_count >= selected_limit then
    return jsonb_build_object(
      'allowed', false,
      'code',
        case when p_is_pro
          then 'PRO_FAIR_USE_EXHAUSTED'
          else 'QUOTA_EXHAUSTED'
        end,
      'count', current_count,
      'feature', p_feature,
      'limit', selected_limit,
      'period', 'monthly'
    );
  end if;

  ledger_id := 'usage_' ||
    encode(sha256((p_user_id || ':' || p_period_key || ':' || p_feature)::bytea), 'hex');

  insert into public.ai_usage_ledger as ledger (
    id,
    user_id,
    period_key,
    feature,
    count,
    created_at,
    updated_at
  )
  values (
    ledger_id,
    p_user_id,
    p_period_key,
    p_feature,
    1,
    now(),
    now()
  )
  on conflict (user_id, period_key, feature)
  do update
  set
    count = ledger.count + 1,
    updated_at = now()
  where selected_limit is null or ledger.count < selected_limit
  returning count into next_count;

  if next_count is null then
    select count
    into current_count
    from public.ai_usage_ledger
    where user_id = p_user_id
      and period_key = p_period_key
      and feature = p_feature;

    return jsonb_build_object(
      'allowed', false,
      'code',
        case when p_is_pro
          then 'PRO_FAIR_USE_EXHAUSTED'
          else 'QUOTA_EXHAUSTED'
        end,
      'count', coalesce(current_count, 0),
      'feature', p_feature,
      'limit', selected_limit,
      'period', 'monthly'
    );
  end if;

  return jsonb_build_object(
    'allowed', true,
    'code', 'USAGE_RECORDED',
    'count', next_count,
    'feature', p_feature,
    'limit', selected_limit,
    'period', 'monthly'
  );
end;
$$;

revoke execute on function public.increment_ai_usage_if_allowed(
  text,
  text,
  text,
  boolean,
  integer,
  integer
) from public;
revoke execute on function public.increment_ai_usage_if_allowed(
  text,
  text,
  text,
  boolean,
  integer,
  integer
) from anon;
revoke execute on function public.increment_ai_usage_if_allowed(
  text,
  text,
  text,
  boolean,
  integer,
  integer
) from authenticated;
grant execute on function public.increment_ai_usage_if_allowed(
  text,
  text,
  text,
  boolean,
  integer,
  integer
) to service_role;
