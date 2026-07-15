create or replace function public.release_ai_usage_reservation(
  p_user_id text,
  p_period_key text,
  p_feature text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_count integer;
begin
  if p_user_id is null or length(trim(p_user_id)) = 0 then
    return jsonb_build_object(
      'released', false,
      'code', 'INVALID_USAGE_RELEASE',
      'feature', p_feature,
      'period', 'monthly'
    );
  end if;

  if p_period_key !~ '^[0-9]{4}-[0-9]{2}$' then
    return jsonb_build_object(
      'released', false,
      'code', 'INVALID_USAGE_RELEASE',
      'feature', p_feature,
      'period', 'monthly'
    );
  end if;

  update public.ai_usage_ledger
  set
    count = greatest(count - 1, 0),
    updated_at = now()
  where user_id = p_user_id
    and period_key = p_period_key
    and feature = p_feature
    and count > 0
  returning count into next_count;

  return jsonb_build_object(
    'released', next_count is not null,
    'code',
      case when next_count is null
        then 'USAGE_RESERVATION_NOT_FOUND'
        else 'USAGE_RESERVATION_RELEASED'
      end,
    'count', coalesce(next_count, 0),
    'feature', p_feature,
    'period', 'monthly'
  );
end;
$$;

revoke execute on function public.release_ai_usage_reservation(
  text,
  text,
  text
) from public;
revoke execute on function public.release_ai_usage_reservation(
  text,
  text,
  text
) from anon;
revoke execute on function public.release_ai_usage_reservation(
  text,
  text,
  text
) from authenticated;
grant execute on function public.release_ai_usage_reservation(
  text,
  text,
  text
) to service_role;
