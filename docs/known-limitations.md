# DearDiary Known Limitations

Audit date: 2026-06-25

- Destructive Supabase and Clerk tests were not run because this workspace does not prove the configured project is non-production.
- Physical-device testing remains required for App Lock, biometrics, app-switcher privacy, notification scheduling, share sheet behavior, app termination, low-memory recreation, and Android back behavior.
- Full backup/restore import is not implemented in the current codebase. Export exists; restore safety must be audited when an import flow is added.
- The journal editor currently has explicit save behavior. A debounce autosave/draft recovery service was not found in the current editor implementation.
- SecureStore/App Lock read failures fail closed for privacy. A physical-device recovery-path test is still required to confirm the user is not left permanently stuck.
- AI chat, entry reflections, and insight reports require internet for remote AI. Existing local/cached content remains available where implemented.
- Local-only unsynced changes are device-dependent until Supabase sync succeeds.
- Notification reminders require a development or release build on Android; Expo Go is explicitly unsupported for this path.
- No automated unit-test runner is configured in `package.json`; this audit used `npx tsc --noEmit` and `npm run lint` for automated verification.

