# Release Configuration Audit

Audit date: 2026-07-02

## Project identity

- App display name: `DearDiary`
- Expo owner: `aryansoni-dev`
- Expo slug: `dear-diary`
- Android package: `com.aryan.deardiary`
- User-facing version: `1.0.0`
- Android version code: `1`
- URI scheme: `deardiary`
- Baseline Git branch and commit: `dev` at `48c3c5b`
- Pre-existing working-tree change: `app/(auth)/login.tsx`; it was not modified by this audit.
- Onboarding and Home had no uncommitted changes at the checkpoint.
- Expo SDK: `~54.0.34`
- React Native: `0.81.5`
- Node: `22.22.3`
- Java: OpenJDK `17.0.19`
- `android/` tracked files: `0`; the directory is absent and ignored.
- Baseline TypeScript and lint checks both passed before editing.
- The app was not launched before editing because AGENTS.md prohibits starting Expo autonomously and ADB cannot start in this sandbox. This is recorded as not tested, not passed.

| Area | Current state | Required preview state | Risk | Action | Status |
| --- | --- | --- | --- | --- | --- |
| Android package | `com.aryan.deardiary` | Stable valid package | High | Preserve | Valid |
| Expo project | `@aryansoni-dev/dear-diary` resolves to the configured project ID | Correct owner, slug, and ID | High | Corrected local slug and verified remotely | Changed |
| Preview EAS environment | No variables configured | All required public Preview variables | Critical | Configure in EAS after confirming non-production services | Blocked |
| Clerk key | Local ignored env contains a test publishable key | Non-production publishable key in EAS Preview | Critical | Explicitly designate and add the approved Preview key | Manual verification required |
| Supabase project | Local ignored env has an HTTPS URL and legacy anonymous client key | Explicitly approved non-production project with RLS | Critical | Confirm project classification and remote RLS before adding EAS variables | Blocked |
| OpenRouter key | Referenced only by Supabase Edge Functions | Server-only | Critical | Keep in backend secret storage | Valid |
| Android native project | `android/` is absent and ignored | Reproducible CNG output | High | Preserve CNG; do not generate or delete native files blindly | Valid |
| Android permissions | Storage and overlay permissions were emitted by base plugins | No broad storage or development overlay access | High | Added manifest-merger removal directives | Changed |
| Android backup | Enabled by default | Do not back up private AsyncStorage journal data through Android Auto Backup | High | Disabled `allowBackup` | Changed |
| AI fallback | Deterministic local fallback could run after a backend error | Remote AI only in Preview; friendly failure otherwise | High | Removed the fallback from the AI Chat runtime path | Changed |
| Notifications | Android channel was created after requesting permission | Channel exists before Android 13 permission request | High | Reordered setup | Changed |
| APK and device test | No artifact and no usable ADB device | Installed release APK working without Metro | Critical | Build and test after environment approval | Blocked |

## Expo configuration

`app.json` is the only Expo app-config file and is the active source of truth. There is no `app.config.js` or `app.config.ts` conflict. Effective Expo config inspection succeeded after the changes.

Configured plugins:

- `expo-router`
- `expo-splash-screen`
- `@clerk/expo`
- `expo-notifications`
- `expo-secure-store`
- `expo-local-authentication`

Every configured package is installed. No EAS Update runtime or channel is configured, and this audit did not add one.

## EAS project linkage

- Project ID: `e0a55a7c-da6d-40f8-afb7-cd5399caa416`
- Resolved project: `@aryansoni-dev/dear-diary`
- Authenticated Expo owner: `aryansoni-dev`
- The original mixed-case slug did not match the linked EAS project and was corrected.
- No build link is stored in the repository.
- Whether the eventual internal-build URL is accessible without an Expo account must be checked on the build page before sharing.

## Android native configuration

The repository uses Expo Continuous Native Generation in practice: `/android` and `/ios` are ignored and no native project is present. There are no tracked native customizations to overwrite. `npx expo prebuild --clean` was not run.

Effective Android config inspection confirmed:

- Package: `com.aryan.deardiary`
- Version code: `1`
- App label: `DearDiary`
- `allowBackup=false`
- Deep-link scheme: `deardiary`
- No `usesCleartextTraffic` or custom cleartext network policy
- Manifest removal directives for `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, and `SYSTEM_ALERT_WINDOW`
- No camera, microphone, or media-library permission was introduced

Final Gradle manifest merging still requires verification in the APK.

| Permission | Classification | Reason |
| --- | --- | --- |
| `INTERNET` | Required | Clerk, Supabase sync, Edge Functions, and AI |
| `USE_BIOMETRIC` | Required | App Lock biometric unlock |
| `USE_FINGERPRINT` | Conditionally required | Backward-compatible biometric support |
| `POST_NOTIFICATIONS` | Conditionally required | Android 13+ local reminder permission; contributed by `expo-notifications` |
| `RECEIVE_BOOT_COMPLETED` | Conditionally required | Restore scheduled local reminders after reboot; contributed by `expo-notifications` |
| `VIBRATE` | Conditionally required | Local notification behavior |
| `READ_EXTERNAL_STORAGE` | Blocked | Export uses app-local files and the Android share sheet |
| `WRITE_EXTERNAL_STORAGE` | Blocked | Export uses app-local files and the Android share sheet |
| `SYSTEM_ALERT_WINDOW` | Blocked | Development overlay permission is not needed in Preview |
| `SCHEDULE_EXACT_ALARM` | Not added | Exact-alarm behavior is not yet proven necessary; verify reminder timing on-device before requesting it |

## Environment variables

The mobile bundle reads only:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_ACCOUNT_DELETION_URL` (optional)

`.env`, `.env.local`, `.env.*.local`, `.env.preview`, and `.env.production` are ignored. Example files remain tracked. All three EAS environments currently report no variables.

## Client-safe values

- App environment label
- Clerk publishable key
- Supabase project URL
- Supabase anonymous/publishable client key
- Public account-deletion page URL
- EAS project ID

Client-safe means the value is expected to be readable from the compiled APK. It does not grant authorization by itself.

## Server-only secrets

The following identifiers are server-only and are not referenced by React Native application code:

- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `OPENROUTER_API_KEY`
- Database passwords and connection URLs
- Webhook, cron, admin, signing, and submission credentials

Server-only references are limited to Supabase Edge Functions, migrations, or documentation. No exposed secret value was found in tracked mobile code. No secret was rotated because no exposure was confirmed.

## Clerk configuration

The app uses `@clerk/expo` 3.3.1 with the package token cache and a custom email/password plus SSO flow. The config plugin is registered. The local ignored environment uses a Clerk test publishable key, but that Clerk instance has not been formally approved as Preview or checked for real production users.

Unknown non-Clerk errors are now mapped to a generic user-facing message instead of displaying raw exception text. Sign-up, sign-in, verification, SSO callback, session restoration, switching, and deletion require standalone manual testing.

## Supabase configuration

The app uses `@supabase/supabase-js` 2.108.1 and supplies the active Clerk session token through `accessToken`. Client sync requests are scoped by user ID in application code.

Local migrations enable owner-scoped RLS for `entry_ai_reflections` and `ai_insights`. The account-deletion function is restricted to `service_role`, and the journal merge function is `security invoker`. The repository does not contain the full original schema or every policy for profiles, journal entries, mood logs, and achievements. Remote RLS, grants, Clerk third-party auth, and deployed migration state were not queried and remain blocking manual checks.

The configured local key is a legacy anonymous JWT, which is client-safe only when RLS and grants are correct. Service-role and database credentials are not used by the client.

## AI backend configuration

AI Chat, entry reflections, and reports invoke Supabase Edge Functions. OpenRouter credentials are read only inside Edge Functions. The functions require a bearer token and perform authenticated Supabase queries. Timeouts and duplicate-request guards exist.

The AI Chat runtime no longer imports or produces the deterministic local fallback after a remote failure. The provider account spend cap, deployed Edge Function variables, deployed versions, and operational monitoring were not verified.

## Notifications

Only local morning and evening reminders are implemented. No push-token registration or Google services file is present or required for the current feature. The app now creates the Android channel before requesting permission. Permission denial, scheduling, cancellation, reboot restoration, timezone behavior, notification opening, and App Lock interaction require APK testing.

## App Lock and biometrics

App Lock data is stored in SecureStore per Clerk user. The root gate renders an opaque privacy surface while checking or locked, and lifecycle handling covers background/inactive transitions. Static review found no PIN or biometric-result logging in release paths. Cold start, process kill, app switcher, biometric behavior, notification/deep-link opening, sign-out, and account switching remain physical-device tests.

## Deep linking

The scheme is `deardiary`. Clerk SSO uses `AuthSession.makeRedirectUri({ path: "sso" })`, and Expo Router has `/sso` and `/sso-callback` routes. Effective config contains a browsable `deardiary` intent filter. Standalone OAuth and unknown/deleted route behavior remain manual tests.

Manual Android examples after installation:

```bash
adb shell am start -W -a android.intent.action.VIEW -d "deardiary://sso" com.aryan.deardiary
adb shell am start -W -a android.intent.action.VIEW -d "deardiary://unknown-route" com.aryan.deardiary
```

## Icons and splash

The configured `assets/images/icon.png` exists, is a 2000×2000 RGBA PNG, and visually contains the DearDiary brand rather than the Expo placeholder. The same brand asset is used for the current adaptive foreground and native splash. Dedicated Android and splash template assets exist but are not configured; several are old Expo placeholder guides and were intentionally not substituted.

The required native launch surface now renders the existing custom splash logo at one pixel over `#F4EFFA`, matching the opening color of the custom gradient and making the native bridge effectively invisible. It contains no white background or competing visible logo, so the animated custom JavaScript screen is the only branded splash users see. No stuck `preventAutoHideAsync()` path exists. Adaptive cropping, launcher rendering, the seamless native-to-custom transition, and splash behavior must be checked in the APK.

## Versioning

Versioning is explicitly local:

- `cli.appVersionSource`: `local`
- User-facing version: `1.0.0`
- Android version code: `1`
- Auto-increment: disabled

Future builds must intentionally increment `android.versionCode`. No version was incremented during this audit.

## Development-only code

- Fault injection returns false whenever `__DEV__` is false; its enabled set is empty.
- The local AI fallback module is no longer imported by the app runtime.
- Client console diagnostics are guarded by `__DEV__` or an early `!__DEV__` return.
- No developer screen, RLS bypass, seed control, mock account, paywall, RevenueCat SDK, or subscription control was found.
- Backend function logs use request IDs and sanitized metadata; no mobile secret logging was found.

## Preview blockers

1. EAS Preview has no required public variables.
2. The intended Clerk and Supabase projects have not been explicitly designated non-production and checked for production users/data.
3. Remote RLS, grants, deployed migrations, and Clerk third-party auth are not verified.
4. Deployed Edge Function configuration and the AI provider spend cap are not verified.
5. Android signing credentials are not verified; no credentials were created or rotated.
6. No Preview APK has been built or installed.
7. No release-mode physical-device smoke test has been performed.
8. Privacy Policy and Terms still contain documented legal placeholders.
9. Existing TypeScript test files have no configured runner and fail under plain Node because extensionless TypeScript imports are unresolved.
10. Existing project documentation reports that restore/import and debounce autosave are not implemented; this audit did not add out-of-scope product features.
11. Local journal payloads use AsyncStorage and are not represented as end-to-end encrypted in current code or legal copy; testers should not be promised encryption that is not implemented.

## Production-only pending work

- Production Clerk and Supabase projects and variables
- Production backend secrets and AI limits
- Remote versioning decision or deliberate local version increments
- Play Store AAB build, submission credentials, listing, and review
- RevenueCat, products, paywall, and subscriptions in a later sprint
- Legal review and replacement of placeholders
- Store-grade data retention and preview-data migration policy

No production backend, billing feature, dummy user, or seeded data was added.
