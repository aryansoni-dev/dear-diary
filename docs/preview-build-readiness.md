# Preview Build Readiness

Audit date: 2026-07-02

## Build identity

| Field | Value | Status |
| --- | --- | --- |
| Expo project | `@aryansoni-dev/dear-diary` | Ready |
| EAS project ID | Matches `app.json` and remote project | Ready |
| Android package | `com.aryan.deardiary` | Ready |
| App version | `1.0.0` | Ready |
| Android version code | `1` | Ready for the first deliberate build |
| Git source | Baseline `dev` / `48c3c5b`; audit changes uncommitted | Manual verification required |

## Environment

Status: **Blocked**

The Preview profile selects the EAS `preview` environment, but that environment currently has no variables. The current local Clerk key is a test key; the Supabase URL is HTTPS and its key is a client-safe legacy anonymous key. Neither backend has been formally designated as the Preview backend.

## Backend services

Status: **Manual verification required**

- Confirm the Clerk instance is non-production and contains no production users.
- Confirm the Supabase project is non-production.
- Verify Clerk third-party auth, remote RLS, grants, and deployed migrations.
- Verify the four Edge Functions and their server-only variables.
- Confirm an external OpenRouter spend cap or monitoring plan.
- Run two-account isolation and account-deletion tests using disposable accounts.

## EAS profile

Status: **Ready**

- `development`: development client, internal distribution, Development environment
- `preview`: explicitly not a development client, internal distribution, Preview environment, Android APK
- `production`: Production environment, Android app bundle, no submission profile

The Development profile is configuration-only until `expo-dev-client` is approved and installed. This does not affect the Preview release APK profile.

## Versioning

Status: **Ready**

Local versioning is explicit. `1.0.0` and Android version code `1` are preserved. Future builds must increment the numeric version code intentionally.

## Secrets audit

Status: **Ready**

No server secret is referenced by mobile code. OpenRouter, Clerk secret, and Supabase service-role/secret keys remain in Edge Function code paths only. Private env and signing files are ignored. No secret value was printed or committed.

## Native features

Status: **Manual verification required**

- CNG config is internally consistent.
- Broad storage and overlay permissions are blocked.
- Android Auto Backup is disabled for private local journal data.
- Local notifications create their channel before requesting permission.
- App Lock, biometrics, sharing, splash, launcher icon, notification reboot behavior, and deep links require the release APK.

## Development-only code

Status: **Ready**

Fault injection requires `__DEV__`, and the deterministic local AI fallback is no longer part of the AI Chat runtime path. No in-app debug controls, seeded data, dummy users, paywall, or subscription placeholders were added.

## Smoke-test status

Status: **Blocked**

Static config, TypeScript, lint, Expo Doctor, and the release-mode Android JavaScript export pass. The existing TypeScript tests cannot run with plain Node and no runner is configured. No APK exists, ADB cannot start in this environment, and no physical-device or no-Metro test was performed. See `docs/preview-smoke-test.md`.

## Blockers

1. Approve non-production Clerk and Supabase services.
2. Populate the EAS Preview public variables.
3. Verify remote RLS, grants, functions, secrets, and AI spend controls.
4. Verify or reuse the existing Android keystore without rotating it unnecessarily.
5. Replace legal placeholders before inviting external testers to enter sensitive content.
6. Run the Preview build:

   ```bash
   eas build --platform android --profile preview
   ```

7. Install the APK on a physical Android device and complete every required smoke test without Metro or USB.
8. Decide how to communicate the existing restore/import and autosave limitations; do not claim those paths passed.

## Final recommendation

**Not ready** to create or share Preview Build 1 due to missing EAS Preview variables, unverified backend isolation, no APK, and no physical-device smoke test.

The repository configuration is prepared for the next build attempt after those external blockers are resolved.
