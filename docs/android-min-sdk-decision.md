# Android minimum SDK decision

Audit date: 2026-07-18

## Current and proposed support

| Choice | Lowest Android | Effect |
|---|---|---|
| Keep API 24 | Android 7.0 | Preserves Android 7–9 users and current tested configuration |
| Raise to API 29 | Android 10 | Drops Android 7.0–9.0 devices; reduces legacy platform surface but does not encrypt app storage or replace runtime controls |

Expo SDK 54 supports Android 7 and compiles/targets SDK 36, so both API 24 and 29 are within the framework range ([Expo SDK 54 reference](https://docs.expo.dev/versions/v54.0.0/)). Clerk's current native floor is compatible with the existing API 24 build, and API 29 is above it. RevenueCat, notifications, and biometric APIs used here are also compatible with API 29; each still requires a real-device regression pass.

Android 10 introduced privacy changes including scoped storage and tighter platform behavior ([Android 10 privacy changes](https://developer.android.com/about/versions/10/privacy/changes)). DearDiary already targets API 36, disables backup, and avoids broad storage permissions, so raising the minimum chiefly removes legacy OS/device exposure. It does not make AsyncStorage encrypted and is not by itself a fix for an exploitable manifest issue.

## Compatibility proof

A temporary Expo prebuild outside the repository was generated and its app `minSdkVersion` was changed to 29. The first attempt's Metro step could not follow the temporary workspace's symlinked `node_modules`; after adding that existing directory as a temporary Metro watch folder, `:app:compileReleaseKotlin` completed successfully in release mode. The merged release manifest reports `android:minSdkVersion="29"`. The repository was not modified by this proof.

## Impact and exact future change

No Play Console/device analytics were available, so the number of affected DearDiary users cannot be estimated responsibly. Before raising the floor, inspect the Play device catalog and active-device distribution, choose an explicit support policy, notify testers, and test install/upgrade, Clerk auth, RevenueCat purchase/restore, notifications (including reboot), biometrics/App Lock, deep links, storage/export, and sync on Android 10 plus a current Android version.

If approved later, add the Expo-supported `expo-build-properties` configuration with `android.minSdkVersion: 29` (installing that package requires separate approval), regenerate native projects only in CI/build, confirm the merged manifest reports 29, and build/test a new higher-version-code candidate. Do not commit generated native folders.

## Recommendation

**Keep API 24.** MobSF's HIGH label reflects the breadth of supported legacy platforms, not a demonstrated DearDiary exploit. With no usage data or approval to drop Android 7–9, retaining compatibility is the safer product decision. Revisit API 29 as an explicit support-policy change after measuring affected users.
