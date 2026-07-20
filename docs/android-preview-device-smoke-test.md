# Android Preview physical-device smoke test

Audit date: 2026-07-19

Candidate: source version 1.0.7, Android version code 7

Required runtime: standalone Preview APK, no Metro

## Environment status

The current candidate was not built or installed, following the explicit instruction not to run a build command. Runtime execution and the existing Maestro flows are therefore **blocked by environment** for this candidate. Results previously collected from the 1.0.6/code 6 APK are historical and are not carried forward as 1.0.7/code 7 passes.

Use only disposable users and non-sensitive fixture journal text for the identity-changing, deletion, AI, export, and purchase flows.

## Smoke-test matrix

| Area | Classification | Required verification |
|---|---|---|
| Onboarding | Pending manual verification | Fresh install/cleared disposable state completes and restores correctly |
| Authentication | Pending manual verification | Sign-up, verification, valid/invalid sign-in, sign-out, and callback failures |
| Session restoration | Pending manual verification | Valid session restores without Metro or private-content flash |
| App Lock | Pending manual verification | Enable, lock delays, cold start, background/foreground, and immediate lock |
| Biometrics | Pending manual verification | Success, cancel, failure, unavailable hardware, and PIN fallback |
| Journal CRUD | Pending manual verification | Create, read, edit, delete, and missing-entry handling |
| Autosave / draft behavior | Pending manual verification | Draft survives intended lifecycle and never crosses users or survives sign-out incorrectly |
| Mood | Pending manual verification | Create/update/history and per-user isolation |
| Manual and AI tags | Pending manual verification | Add/remove/persist and no cross-user leakage |
| History, search, and calendar | Pending manual verification | Correct filtering, dates, empty states, and account isolation |
| AI Chat | Pending manual verification | Normal/error/offline/quota flows with only the active user's context |
| AI reflection | Pending manual verification | Generate/regenerate/error/quota and current-entry isolation |
| Reports | Pending manual verification | Weekly/monthly generation, caching, refresh, and account isolation |
| Offline/reconnect | Pending manual verification | Local changes persist and reconcile without duplication or cross-user sync |
| Export | Pending manual verification | Export completes intentionally and contains only the active user's data |
| Backup/restore | Not applicable | No user-file import/restore implementation is present in this candidate; cloud sync is not file restore |
| Notifications | Pending manual verification | Permission, create/update/delete, delivery, routing, reboot, lock, sign-out, and switching |
| RevenueCat | Blocked by environment | Requires RevenueCat Test Store or authorized sandbox on the exact candidate |
| Account switching | Pending manual verification | No previous-user content flash or retained transient state |
| Account deletion | Pending manual verification | User B deletion removes only B; User A remains intact locally and remotely |
| Large text | Pending manual verification | No clipping or inaccessible controls at supported accessibility sizes |
| Reduced motion | Pending manual verification | Motion preference is respected without broken state changes |
| Process kill/restart | Pending manual verification | State, lock, auth, sync, and entitlement recover safely |
| Existing Maestro flows | Blocked by environment | Run `.maestro/00-launch.yaml` and `.maestro/00-smoke-launch.yaml` only after installing 1.0.7/code 7 |

## Device pass requirements

Before distribution, complete every Pending row without Metro on the exact Preview APK. Record each as Passed or Failed. Do not promote a source review, an older APK result, or a sideloaded Play Billing failure to a runtime pass.
