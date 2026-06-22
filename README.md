# DearDiary

DearDiary is an Expo, React Native, TypeScript, Expo Router, NativeWind, Zustand, Clerk, and Supabase journaling app.

## Setup

```bash
npm install
```

Copy `.env.example` to your local environment file and fill the public Expo values. Keep server secrets out of the mobile app.

## Account Deletion

The app includes a production-readiness deletion flow:

- Profile action: **Delete My Data and Account**
- Supabase Edge Function: `delete-account`
- Database RPC: `delete_deardiary_user_data(target_user_id)`
- Local cleanup: `lib/account/clearLocalUserData.ts`

Required Edge Function secrets:

```txt
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CLERK_SECRET_KEY
```

Deploy the function and migration with your normal Supabase workflow. Do not put service-role or Clerk secret keys in `EXPO_PUBLIC_*` variables.

Related docs:

- `docs/user-data-inventory.md`
- `docs/database.md`
- `docs/privacy.md`
- `docs/play-store-account-deletion.md`

## Legal Drafts

Privacy Policy and Terms screens exist at:

- `/legal/privacy-policy`
- `/legal/terms`

They contain visible placeholders and require legal review before public release.
