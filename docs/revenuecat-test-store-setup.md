# RevenueCat Test Store setup

Audit date: 2026-07-22

Code candidate: source version 1.0.9, Android version code 9

Profile status: **REVENUECAT TEST STORE DEVELOPMENT PROFILE READY**

No Test Store APK was built or installed during this preparation. The live RevenueCat project was reconciled through RevenueCat MCP. Its existing Test Store configuration already matched the application contract, so the idempotent result was zero dashboard writes.

## RevenueCat MCP reconciliation

Connection and project selection:

- RevenueCat MCP: connected
- project: `DearDiary` (`proj11badf66`)
- Android app/provider: `DearDiary Android` (`app43d78856cd`), Play Store package `com.aryan.deardiary`
- Test Store app/provider: `Test Store` (`app4bec91040f`)
- Test Store public key present: yes
- key category: Test Store public SDK key
- project/app association: verified

The key value was not printed, stored, logged, or documented.

Pre-change reads found the complete intended configuration already in place. The MCP operations performed were project/app listing, product listing and resource reads, Test Store price reads, entitlement and entitlement-product reads, offering/package/product relationship reads, current-offering verification, and redacted public-key metadata checks for the Test Store and Google Play apps. Fresh resource reads were then used for the final verification. No create, update, attach, detach, archive, or delete operation was needed.

| Resource | Live identifier | Verified relationship |
|---|---|---|
| Test Store monthly product | `proda9ff3d9aa1` / `deardiary_pro_monthly` | Active `P1M`; $4.99 USD; entitlement and monthly package attached |
| Test Store annual product | `prod1c44bca13c` / `deardiary_pro_yearly` | Active `P1Y`; $39.99 USD; entitlement and annual package attached |
| Entitlement | `entleefa70a2be` / `DearDiary Pro` | Both Test Store and both Google Play products attached |
| Current offering | `ofrng0ecaeb85d3` / `default` | Active and current |
| Monthly package | `pkge73858b426a` / `$rc_monthly` | Test Store monthly plus Google Play monthly preserved |
| Annual package | `pkgef61fa3ca89` / `$rc_annual` | Test Store annual plus Google Play annual preserved |
| Google Play monthly | `prod98665bc767` / `deardiary_pro_monthly:monthly` | Active and unchanged |
| Google Play annual | `prod3d5ea64d72` / `deardiary_pro_yearly:yearly` | Active and unchanged |

Two inactive Test Store defaults (`monthly`, `yearly`) also exist. They were auto-created/legacy resources, are not attached to the intended entitlement or packages, and were left untouched. There is exactly one active intended Test Store monthly/annual pair and exactly one Test Store app.

### Final redacted verification matrix

| Resource | Expected | Actual | Status |
|---|---|---|---|
| Project | DearDiary | `DearDiary` (`proj11badf66`) | Passed |
| Android app | `com.aryan.deardiary` | `DearDiary Android` (`app43d78856cd`), Play Store | Passed |
| Test Store | Present | `Test Store` (`app4bec91040f`) | Passed |
| Test Store public key | Present, redacted | Present; value withheld | Passed |
| Entitlement | `DearDiary Pro` | `DearDiary Pro` (`entleefa70a2be`) | Passed |
| Default offering | Current | `default` (`ofrng0ecaeb85d3`), current | Passed |
| Monthly Test product | Present | `proda9ff3d9aa1`, `P1M`, active | Passed |
| Annual Test product | Present | `prod1c44bca13c`, `P1Y`, active | Passed |
| Monthly entitlement attachment | `DearDiary Pro` | Attached; Google Play monthly also attached | Passed |
| Annual entitlement attachment | `DearDiary Pro` | Attached; Google Play annual also attached | Passed |
| Monthly package | Test + Google products preserved | `$rc_monthly` contains both intended products | Passed |
| Annual package | Test + Google products preserved | `$rc_annual` contains both intended products | Passed |
| Sandbox Testing Access | Allows intended internal test | State is not exposed by RevenueCat MCP | Manual verification required |

### Unsupported RevenueCat MCP operation

The connected RevenueCat MCP exposes no read or write operation for Sandbox Testing Access. This is the only remaining manual RevenueCat dashboard action: inspect Sandbox Testing Access and grant the minimum sandbox-only access needed for the disposable test accounts. If the dashboard mode requires an allowlist, enter the stable disposable Clerk `userId` values—the same values the app sends as RevenueCat App User IDs. Do not use email addresses or fabricate identifiers. Production entitlement behavior must remain unchanged.

## Build isolation

| EAS profile | EAS environment | RevenueCat mode | Selected key | Android artifact | Distribution |
|---|---|---|---|---|---|
| `development` | `development` | `test-store` | `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` | Debug development-client APK | Internal |
| `preview` | `preview` | `google-play` | `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | APK | Internal |
| `production` | `production` | `google-play` | `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | AAB | Store |

Development is the only Test Store path. It uses the existing Development EAS environment and produces a debuggable Expo development client with the generated dev-client scheme enabled. Preview and Production remain Google Play release builds with that generated scheme disabled.

The matrix describes the requested Android builds. Existing iOS EAS builds continue to select `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` when `EAS_BUILD_PLATFORM=ios`; an Android build never places that iOS key in `extra.revenueCat`.

`app.config.js` resolves exactly one client-safe RevenueCat public SDK key from the explicit mode and places only `{ mode, apiKey }` in Expo runtime `extra`. Development, Preview, and Production fail configuration when their selected key is absent. Development requires Test Store mode; Preview and Production require Google Play mode. Production also rejects a Test Store-looking selected key and rejects the presence of `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` in the Production environment. Errors never contain key values.

## Required EAS environment variables

Set these in Expo project settings under **Environment variables**. Client-side `EXPO_PUBLIC_` variables must be readable while resolving and bundling the app, so use `sensitive` or `plaintext` visibility, not `secret` visibility.

Development environment:

- `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` (already configured in EAS)

Preview environment:

- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`

Production environment:

- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- no `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`

Do not put values in `eas.json`, source files, documentation, terminal history, screenshots, or logs. The Test Store key is a public SDK key, not a RevenueCat REST secret.

The safer setup path is the EAS dashboard because it avoids placing a value in shell history. If the Development Test Store key ever needs to be recreated, an interactive CLI alternative that prompts for the value is:

```bash
eas env:create --environment development --name EXPO_PUBLIC_REVENUECAT_TEST_API_KEY --visibility sensitive
```

Do not configure any of these in the mobile app:

- `REVENUECAT_SECRET_KEY`
- a RevenueCat REST API secret (`sk_…`)
- webhook authorization secrets
- Google service-account credentials

## Verified RevenueCat dashboard state

The Test Store app, redacted public-key presence, active monthly/yearly products, entitlement attachments, predefined package relationships, preserved Google Play relationships, and current offering were all verified through fresh RevenueCat MCP reads. The app selects RevenueCat offering package slots/types and localized product metadata, so no Test Store product identifier needs to be hardcoded in the mobile UI.

## SDK compatibility

Installed package:

- `react-native-purchases@10.4.2`
- `react-native-purchases-ui` is not installed or used

RevenueCat currently documents React Native 9.5.4 as the Test Store minimum. The installed 10.4.2 package is compatible, so no dependency file or native dependency changed. A fresh native APK is still required because the existing APK was built with the Google Play configuration. If RevenueCat native dependencies change later, create a fresh APK and complete a new MobSF scan before broader distribution.

References:

- [RevenueCat Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store)
- [RevenueCat customer identity](https://www.revenuecat.com/docs/customers/identifying-customers)
- [RevenueCat CustomerInfo](https://www.revenuecat.com/docs/customers/customer-info)
- [Expo EAS environment variables](https://docs.expo.dev/eas/environment-variables/manage/)

## Pre-build verification

Run:

```bash
npm run verify:revenuecat-config
npm run test:revenuecat-config
npm run test:revenuecat-runtime
npx expo-doctor
npx tsc --noEmit
npm run lint
```

The config verification reports only the profile, mode, key presence/category, development-client flag, distribution, build type, and EAS environment. It uses non-secret placeholders and never prints configured EAS values.

## Build command

After Sandbox Testing Access is checked, build the existing Development profile:

```bash
eas build --platform android --profile development
npx expo start --dev-client --clear
```

Label and handle the artifact as:

> INTERNAL TEST STORE BUILD — NEVER SUBMIT TO GOOGLE PLAY

Do not submit it, promote it to a public link, reuse it as a Preview/Production candidate, or treat Expo Go as purchase proof.

## Post-build runtime matrix

Use disposable Clerk users and a dedicated device/profile. Do not use a real charge.

| Check | Expected result |
|---|---|
| Monthly package | RevenueCat monthly package displays Test Store localized metadata |
| Yearly package | RevenueCat annual package displays Test Store localized metadata |
| Success | Test Store success activates `DearDiary Pro` and updates the UI without restart |
| Failure | No Plus access; safe retryable message; paywall remains usable |
| Cancellation | No Plus access; cancellation is non-fatal; paywall remains usable |
| Restore | Plus activates only when refreshed `CustomerInfo` has the entitlement |
| No restore | Safe “No active subscription” result; no Plus access |
| Restart | Verified entitlement reloads for the same Clerk user |
| Renewal | Outbound RevenueCat refresh updates `CustomerInfo`; Plus remains active |
| Expiration | `DearDiary Pro` becomes inactive; core journal data remains intact |
| User A Plus → User B Free | User B never displays User A’s entitlement, even briefly |
| User B → User A | User A’s own entitlement returns only after identity synchronization |
| Account deletion | Remains available and clears the existing user-scoped data paths |
| Offline | Last verified same-user state follows the existing in-memory policy; no unverified Plus grant; free journaling remains usable |
| Expo Go | Layout/mock flow only; mock `CustomerInfo` never proves entitlement |
| Logcat privacy | No API key, purchase token, CustomerInfo payload, entitlement payload, journal content, auth token, password, or PIN |

RevenueCat Test Store should display simulation choices for successful purchase, failed purchase, and cancellation. Test renewals/expiration on RevenueCat’s accelerated Test Store schedule and trigger outbound SDK work (foreground/refresh) because CustomerInfo listener updates are not server pushes.

## Remaining boundaries

- Mobile `CustomerInfo` controls immediate UI access only after Clerk/RevenueCat identity synchronization.
- Server-side AI quotas continue to use the existing Supabase Edge Function subscription checks and usage ledger; this change does not weaken them or grant server access from a local toggle.
- Journal CRUD, App Lock, biometrics, account deletion, navigation guards, notifications, and Supabase sync remain outside the subscription gate.
- Google Play Billing still requires an authorized Google Play test install. A sideloaded Google Play-key APK cannot validate Play products.
