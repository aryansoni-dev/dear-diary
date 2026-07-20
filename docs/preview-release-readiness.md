# DearDiary Preview release readiness

Audit date: 2026-07-20

Branch/commit: `dev` at `2c6d79e623425cfe5af5a9db9b30757f7c21ffef`

Candidate: source version 1.0.8, Android version code 8

Preview build: `01fcbd6d-35d5-49ab-927e-df5b6d82e82e` (finished)

## Scope

This audit now includes the central deep-link security fix and a newly created Preview APK. No dependency versions, Production AAB, or Google Play release were changed. The exact code-8 APK was downloaded and inspected locally, but could not be installed because no Android device was connected. Runtime evidence from older APKs is historical only and is not treated as evidence for this candidate.

## Automated validation

| Check | Classification | Result |
|---|---|---|
| `npx expo-doctor` | Passed | 18/18 checks passed |
| `npx tsc --noEmit` | Passed | No TypeScript errors |
| `npm run lint` | Passed | No lint errors |
| `test:reflection-prompts` | Passed | Completed successfully |
| `test:environment` | Passed | Completed successfully |
| `test:entry-reflection-theme-tags` | Passed | Completed successfully |
| `test:navigation-transitions` | Passed | Completed successfully |
| `test:route-security` | Passed | Covers auth, hydration, App Lock, route validity, journal ownership, identity changes, and no-render fallbacks |
| `report-source-snapshot.test.mjs` | Passed | Completed successfully |
| `preferred-mood.test.ts` | Passed | Compiled and executed from a temporary directory |
| `report-analytics.test.ts` | Passed | Compiled and executed from a temporary directory |
| `report-narrative-parser.test.ts` | Passed | Compiled and executed from a temporary directory |
| `ai-text-rendering.test.ts` | Passed | Compiled and executed from a temporary directory |

## RevenueCat release logging

| Check | Classification | Evidence |
|---|---|---|
| Development logging | Passed | `__DEV__` uses `LOG_LEVEL.DEBUG` |
| Preview/Production logging | Passed | Non-development builds use `LOG_LEVEL.WARN` |
| One-time configuration | Passed | A module-level guard prevents more than one `Purchases.configure` call per app process; the provider also retains its mount guard |
| Manual sensitive purchase logging | Passed | No purchase token, customer information, journal content, or entitlement payload is manually logged by the subscription/paywall source |

## Build preparation

| Required value | Classification | Verified value |
|---|---|---|
| Version | Passed | 1.0.8 |
| Android version code | Passed | 8 |
| Profile | Passed | `preview` |
| Environment | Passed | `preview` |
| Development client | Passed | `false` |
| Artifact | Passed | APK (`android.buildType: apk`) |
| App version source | Passed | Local |
| Preview dev-client scheme | Passed | Generated development scheme disabled |
| Signing credentials | Passed | Existing remote Android credentials were used without modification |
| Preview build execution | Passed | Build `01fcbd6d-35d5-49ab-927e-df5b6d82e82e` finished successfully |
| Downloaded artifact metadata | Passed | `com.aryan.deardiary`, version 1.0.8, code 8 |
| Artifact SHA-256 | Passed | `3592b52ec96e06dc7b03691b29afbd92dcc79baaa6be475513425ea6c54025ce` |

The Preview build command used was:

```bash
eas build --platform android --profile preview
```

## Runtime release gates

| Gate | Classification | Reason / next action |
|---|---|---|
| Two-user privacy and account deletion | Pending manual verification | Requires disposable Preview Users A and B on the 1.0.8/code 8 artifact |
| Deep-link and App Lock state matrix | Blocked by environment | The code-8 APK exists, but `adb devices -l` returned no connected device |
| Notification lifecycle and privacy | Pending manual verification | Requires permission, scheduling, delivery, reboot, locked-tap, sign-out, and account-switch checks on device |
| RevenueCat Test Store / authorized sandbox | Blocked by environment | The APK exists, but no connected device or authorized Test Store/Internal Testing install was available |
| Controlled app-process logcat audit | Blocked by environment | The code-8 APK was not installed; no raw logcat was captured |
| Full standalone smoke test | Pending manual verification | Must be completed without Metro on the code-8 candidate |
| Existing Maestro flows | Blocked by environment | No Android device was connected for the code-8 artifact |
| Google Play Billing validation | Not applicable | Must not be claimed for a sideload; requires Google Play Internal Testing |
| Production AAB / Play publication | Not applicable | Explicitly outside this task |

Static review continues to show per-user journal/mood/chat/report data selection, per-user App Lock SecureStore keys, active journal visibility cleared during identity changes, generic notification content, and targeted account-deletion cleanup. These checks support build readiness but do not promote the runtime rows above to Passed.

## Build-readiness decision

The source fix passes all available static checks and focused regression coverage, and the Preview configuration/build matches 1.0.8/code 8. The artifact is not ready for trusted Preview distribution until the confirmed signed-out deep-link bypass is retested on this exact APK with screenshot and interaction evidence.

## Final verdict

**NOT READY — DEEP-LINK DEVICE RETEST REQUIRED**
