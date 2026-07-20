# Android deep-link runtime security

Audit date: 2026-07-20

Candidate: source version 1.0.8, Android version code 8

Preview build: `01fcbd6d-35d5-49ab-927e-df5b6d82e82e` (finished)

Downloaded artifact SHA-256: `3592b52ec96e06dc7b03691b29afbd92dcc79baaa6be475513425ea6c54025ce`

## Confirmed pre-fix failure

The signed-out `deardiary://settings` probe on the previous code-7 Preview APK visibly rendered the complete Privacy & Security screen, including the account-specific App Lock control. The evidence file is `Screenshot_20260720-092257_DearDiary.png`; it remains ignored and must not be committed because runtime screenshots can contain private information.

This was a confirmed authentication bypass, not merely successful Android intent delivery.

## Verified root cause

The settings route is outside the protected tab and journal route groups. `app/settings/_layout.tsx` had no Clerk guard, while the root navigator registered `settings` directly. At signed-out startup, `AppLockProvider` correctly resolved App Lock as disabled because no Clerk user existed, after which the former `AppLockGate` rendered the unrestricted root stack. Auth redirects existed only in selected layouts and route components, so a direct settings deep link bypassed them.

The former locked-state branch could also keep protected children mounted behind an App Lock overlay after private content had previously opened. The launch gate waited only for onboarding hydration, not all user-scoped persisted stores.

Affected direct-entry surfaces included settings, paywall, and any root detail route without its own guard. Fragmented checks in tabs, journal, achievements, and report routes reduced exposure on those surfaces but did not provide a complete root security boundary.

## Central guard behavior

`components/app-lock/AppLockGate.tsx` is now the single root security gate around the navigator and protected background managers. Its decision order is:

1. Clerk initialization
2. signed-in state
3. resolved Clerk user matching the auth user ID
4. hydration of all persisted user-data stores
5. App Lock configuration resolution
6. App Lock unlock state
7. active local user matching the Clerk user
8. route validity
9. journal resource ownership for `/journal/[id]`

Protected children are not mounted for loading, signed-out, locked, invalid-route, or failed-ownership decisions. Loading uses an opaque privacy cover. Locked state renders only App Lock, so taps, scrolling, and Back cannot reach an underlying protected tree.

Only the intended root, onboarding, auth, legal-document, and Clerk callback surfaces are public. Known settings, tabs, journal, report, achievements, notification settings, and paywall paths are protected. Unknown paths default to protected and redirect to Home only after all security state resolves.

Journal IDs are decoded defensively and constrained to one safe path segment. Existing entries must belong to the active Clerk user and must not be deleted; otherwise the route falls back to Journal History without mounting the editor or creating an entry.

## Pending-route and identity behavior

The fix intentionally retains no pending protected deep link. A signed-out protected route is replaced by Auth, and successful authentication follows the existing safe Home navigation. This avoids retaining an unverified journal ID and eliminates pending-route replay across sign-out, cancelled authentication, account switching, account deletion, App Lock reset, and Clerk identity changes.

During an account switch, a Clerk-user/local-active-user mismatch remains behind the opaque gate. A journal route is re-authorized against the new user's entries only after App Lock and hydration resolve.

## Files changed for this fix

- `.gitignore`
- `app.json`
- `components/app-lock/AppLockGate.tsx`
- `components/navigation/route-security-boundary.ts`
- `hooks/useUserScopedStorageHydration.ts`
- `lib/navigation/route-security.ts`
- `package.json`
- `tests/route-security.test.mjs`
- `docs/android-deep-link-runtime-security.md`
- `docs/preview-release-readiness.md`

## Regression coverage

`npm run test:route-security` covers:

- signed out + Settings -> Auth
- signed out + journal -> Auth
- unresolved Clerk -> opaque loading gate
- signed in, hydrated, unlocked + Settings -> allow
- locked + Settings -> App Lock
- locked + journal -> App Lock before resource lookup
- invalid, deleted, or other-user journal IDs -> safe fallback
- Clerk/local identity mismatch during account switch -> loading gate
- sign-out/account deletion state -> Auth with no retained route
- callback and legal routes remain intentionally public
- protected screen functions are not rendered behind loading, Auth, App Lock, or redirect fallbacks

The callback unit assertion proves the pure route resolver cannot create or change a session. Actual malformed Clerk callback behavior remains a device-runtime gate.

## Automated verification

All checks passed after the fix:

| Check | Result |
|---|---|
| `npx expo-doctor` | 18/18 passed |
| `npx tsc --noEmit` | Passed |
| `npm run lint` | Passed |
| `test:reflection-prompts` | Passed |
| `test:environment` | Passed |
| `test:entry-reflection-theme-tags` | Passed |
| `test:navigation-transitions` | Passed |
| `test:route-security` | Passed |
| `report-source-snapshot.test.mjs` | Passed |
| `preferred-mood.test.ts` | Passed after temporary compile |
| `report-analytics.test.ts` | Passed after temporary compile |
| `report-narrative-parser.test.ts` | Passed after temporary compile |
| `ai-text-rendering.test.ts` | Passed after temporary compile |

## Preview APK verification

The Preview build finished successfully with version name 1.0.8 and code 8. Local `aapt` inspection of the exact downloaded APK verified:

- package `com.aryan.deardiary`
- `versionName='1.0.8'`
- `versionCode='8'`
- `deardiary` deep-link scheme retained
- Clerk callback hosts retained for `com.aryan.deardiary.callback` and `com.aryan.deardiary.oauth`
- no generated `exp+dear-diary` scheme in the manifest

The APK could not be installed because `adb devices -l` returned no connected devices. Installed-package metadata is therefore not yet verified.

## Required post-fix commands

Run against the exact code-8 APK without clearing app data:

```bash
adb install -r /path/to/deardiary-preview-1.0.8-8.apk

adb shell dumpsys package com.aryan.deardiary |
  grep -E "versionName|versionCode"

adb shell am force-stop com.aryan.deardiary
adb shell am start -W -a android.intent.action.VIEW -d 'deardiary://settings'

adb shell am force-stop com.aryan.deardiary
adb shell am start -W -a android.intent.action.VIEW -d 'deardiary://journal/nonexistent'

adb shell am start -W -a android.intent.action.VIEW \
  -d 'clerk://com.aryan.deardiary.callback?code=invalid'

adb shell am start -W -a android.intent.action.VIEW -d 'exp+dear-diary://'
```

Capture ignored evidence under `security-artifacts/deep-link-post-fix/` as:

- `signed-out-settings.png`
- `signed-out-journal.png`
- `unlocked-settings.png`
- `locked-settings.png`
- `locked-settings-after-interaction.png`
- `locked-journal.png`
- `cold-start-immediate.png`
- `cold-start-settled.png`
- `after-account-switch.png`

## Post-fix runtime matrix

No Android device was connected after the build, so screenshot and interaction results must remain pending.

| State | Expected visible screen | Actual visible screen | Protected controls interactable? | Private flash? | Verdict |
|---|---|---|---:|---:|---|
| Signed out + Settings | Auth | Not run | Not tested | Not tested | Pending device test |
| Signed out + journal | Auth | Not run | Not tested | Not tested | Pending device test |
| Unlocked + Settings | Settings | Not run | Not tested | Not tested | Pending device test |
| Locked + Settings | App Lock | Not run | Not tested | Not tested | Pending device test |
| Locked + journal | App Lock | Not run | Not tested | Not tested | Pending device test |
| Cold start | Auth/App Lock gate | Not run | Not tested | Not tested | Pending device test |
| After account switch | Active-user guard | Not run | Not tested | Not tested | Pending device test |
| Invalid Clerk callback | No session change/crash | Not run | Not tested | Not tested | Pending device test |
| Removed dev scheme | Unable to resolve intent | Manifest absent; intent not run | N/A | N/A | Pending device test |

## Current verdict

**DEEP-LINK SECURITY INCONCLUSIVE — NEW APK TEST REQUIRED**

The source regression is fixed and the new Preview APK exists, but the release blocker cannot be cleared until the exact code-8 artifact passes the complete screenshot-based runtime matrix on a device.
