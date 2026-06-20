create index concurrently if not exists ai_insights_user_id_idx
on public.ai_insights(user_id);

create index concurrently if not exists ai_insights_period_idx
on public.ai_insights(insight_type, period_start, period_end);
