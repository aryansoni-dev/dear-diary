# Privacy And Legal Draft Notes

The in-app Privacy Policy and Terms are draft foundations that require legal review before public release.

Visible placeholders are intentionally used:

- `[Developer/Company Name]`
- `[Support Email]`
- `[Privacy Policy Effective Date]`
- `[Terms Effective Date]`
- `[Website URL]`

The current drafts avoid unsupported claims such as end-to-end encryption, zero-knowledge encryption, HIPAA compliance, medical treatment, therapist-client confidentiality, or third-party-free processing.

## Deletion Architecture

1. User starts deletion from Profile with **Delete My Data and Account**.
2. User reviews consequences.
3. User types `DELETE`.
4. Client sets the deletion guard and stops sync/write operations.
5. `supabase/functions/delete-account` derives the Clerk user ID from the authenticated token.
6. The function deletes user-scoped storage objects where configured.
7. The function calls `delete_deardiary_user_data(target_user_id)`.
8. The function deletes the Clerk user with `CLERK_SECRET_KEY`.
9. The app clears local user-scoped stores, SecureStore App Lock data, reminders, and export files.
10. The app returns to the public auth flow.

Required Edge Function secrets:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CLERK_SECRET_KEY
```

`SUPABASE_ANON_KEY` or `SUPABASE_PUBLISHABLE_KEY` must also be available for the user-token auth probe.

The current Clerk Expo SDK in this project does not expose a mobile reverification helper in the installed package. Clerk dashboard/session reverification requirements should be reviewed before public release.
