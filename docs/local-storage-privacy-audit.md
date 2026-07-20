# Local-storage privacy audit

Audit date: 2026-07-18

## Data placement and isolation

| Data | Storage | Assessment |
|---|---|---|
| Clerk session tokens | `@clerk/expo` secure token cache | Intended secure mobile token cache is used; tokens are not copied into app AsyncStorage |
| App Lock configuration | Expo SecureStore, user-scoped key | Stores enabled/biometric settings plus salted PIN verifier; no plaintext PIN found |
| Journals, mood, chat, prompts, reflections, reports, achievements, preferences | Zustand persistence / AsyncStorage | User IDs and user-scoped selectors/clear methods are used; content is plaintext at the AsyncStorage layer |
| RevenueCat state | RevenueCat SDK-managed storage | App associates SDK state with the active Clerk user; two-user runtime proof remains pending |
| Notifications | OS scheduler plus preference state | Payloads are generic reminder text with no journal/AI content or user/resource ID |
| Export | User-selected directory through Android storage access | File intentionally persists where the user selects; the app cannot later guarantee deletion of that external copy |

**App Lock protects UI access, while AsyncStorage journal content is not cryptographically encrypted by AsyncStorage itself.** App Lock is therefore a presentation/access gate, not at-rest journal encryption. No end-to-end-encryption claim was found in current privacy documentation.

## Controls verified statically

- `android.allowBackup` is false in source and the final APK.
- The APK requests no broad read/write external-storage permission.
- The App Lock key includes a sanitized stable user ID. SecureStore failures keep the lock gate in a non-unlocked state.
- Stores filter/clear data by active user, and account cleanup clears journals, moods, chat, AI artifacts, reports, achievements, sync state, App Lock, onboarding, reminder preferences, and scheduled reminders.
- Supabase access is supplied from the active Clerk session. Local RLS migrations are present, but deployed remote RLS/grants still require an environment-side verification.
- Notification titles/bodies are generic and payloads contain no private route/resource data. There is no custom notification-response route that could expose another user's record.

## Limitations and follow-up

- Runtime switching between Users A and B and deletion cleanup were not tested because the connected account was not disposable.
- Exports written to a user-selected directory are deliberately durable. Cleanup only removes matching files in the app document directory; it cannot revoke or delete copies the user placed elsewhere.
- The app has export but no file import/backup-restore implementation, so scoped restore-file handling cannot be validated.
- The export uses Android's scoped directory picker rather than a broad storage permission. It does not create a temporary share URI; the user grants access to the selected destination.
- Raising min SDK does not encrypt AsyncStorage. If encrypted journal-at-rest storage becomes a product requirement, design and migrate it as a separate reviewed feature.

Current Supabase integration follows the first-class Clerk third-party access-token pattern described in the [Supabase Clerk integration guide](https://supabase.com/docs/guides/auth/third-party/clerk). Before wider distribution, verify the deployed project uses the intended asymmetric Clerk integration and RLS/grants for every private table.
