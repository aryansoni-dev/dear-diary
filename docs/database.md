# Database Notes

## Account Deletion

The migration `supabase/migrations/20260621104500_add_delete_deardiary_user_data.sql` adds `public.delete_deardiary_user_data(target_user_id text)`.

The function deletes current known user-owned tables in this order:

1. `achievement_states`, when present
2. `entry_ai_reflections`, when present
3. `ai_insights`, when present
4. `journal_entries`, when present
5. `profiles`, when present

The function includes soft-deleted journal entries because it deletes by `user_id` without filtering `deleted_at`.

Execution is revoked from `public`, `anon`, and `authenticated`, then granted to `service_role`. It is intended to be called only by the `delete-account` Edge Function using server-side credentials.

## Verification Checklist

- Create data for two users across every listed table.
- Delete User A through the app.
- Confirm no User A rows remain.
- Confirm User B rows remain unchanged.
- Retry deletion for User A and confirm idempotency.
