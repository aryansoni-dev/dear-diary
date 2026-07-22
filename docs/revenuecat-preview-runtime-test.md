# RevenueCat Preview and Test Store runtime test

Audit date: 2026-07-22

Branch/commit baseline: `dev` at `8b4c5b26f93db6a845cbc458c779200f69fe3173`

Candidate: source version 1.0.9, Android version code 9, with uncommitted RevenueCat preparation changes

## Configuration split

| Profile | RevenueCat mode | Store key | Artifact | Status |
|---|---|---|---|---|
| `development` | `test-store` | Test Store public SDK key | Debug development-client APK | Configuration ready; build required |
| `preview` | `google-play` | Android public SDK key | Internal APK | Existing behavior preserved |
| `production` | `google-play` | Android public SDK key | AAB | Existing behavior preserved; Test Store rejected |

No key value is in `eas.json`, runtime logs, tests, or documentation. Dynamic Expo configuration selects one key before bundling and exposes only the selected mode/key through `extra.revenueCat`.

## Actual RevenueCat identifiers

| Item | Source value |
|---|---|
| Entitlement | `DearDiary Pro` |
| Offering | `default` |
| Monthly Google Play product | `deardiary_pro_monthly` |
| Yearly Google Play product | `deardiary_pro_yearly` |
| Monthly package | RevenueCat predefined monthly slot/type |
| Yearly package | RevenueCat predefined annual slot/type |

Live RevenueCat MCP identifiers:

| Item | Live resource |
|---|---|
| Project | `DearDiary` (`proj11badf66`) |
| Android app/provider | `DearDiary Android` (`app43d78856cd`), `com.aryan.deardiary` |
| Test Store app/provider | `Test Store` (`app4bec91040f`) |
| Entitlement | `DearDiary Pro` (`entleefa70a2be`) |
| Current offering | `default` (`ofrng0ecaeb85d3`) |
| Test monthly product | `deardiary_pro_monthly` (`proda9ff3d9aa1`), `P1M` |
| Test annual product | `deardiary_pro_yearly` (`prod1c44bca13c`), `P1Y` |
| Monthly package | `$rc_monthly` (`pkge73858b426a`) |
| Annual package | `$rc_annual` (`pkgef61fa3ca89`) |

The Test Store public SDK key exists for the Test Store app and its project association was verified. Its value remains redacted. The existing dashboard state already satisfied all supported requirements, so RevenueCat MCP performed no writes and created no duplicate resources. Both predefined packages retain their Google Play products and now-verified Test Store products, and all four active products remain attached to `DearDiary Pro`.

The product identifiers remain unchanged. Paywall selection prefers `offering.monthly` and `offering.annual`, then RevenueCat package type/subscription period. Prices continue to use RevenueCat’s localized `priceString`; Test Store product IDs do not need to match Google Play IDs when dashboard packages are mapped correctly.

## Source audit

| Check | Classification | Evidence |
|---|---|---|
| Installed SDK | Passed | `react-native-purchases@10.4.2`; current documented Test Store minimum is 9.5.4 |
| Dependency change | Passed | No SDK upgrade or dependency-lock change required |
| Configure location | Passed | `SubscriptionProvider` calls the module-level `configureRevenueCat()` helper after Clerk loads |
| Configure once | Passed | Module-level run-once guard plus provider mount guard allows one configure action per JS process |
| Release logging | Passed | `LOG_LEVEL.WARN` outside `__DEV__`; development remains `DEBUG` |
| API-key logging | Passed | No selected key or key payload is logged |
| Configuration unavailable | Passed | Provider exposes a safe unavailable state; core app remains mounted |
| Clerk mapping | Passed | Stable Clerk `userId` is the RevenueCat App User ID; no email or user-visible data is used |
| Repeated sign-in | Passed | Current RevenueCat App User ID is checked before `logIn()` |
| Anonymous sign-out | Passed | `isAnonymous()` is checked before `logOut()`; genuine synchronization errors reach the unavailable state |
| Account switching | Passed | Subscription state clears first; identified User A → User B calls `logIn(B)` directly and publishes only after ID confirmation |
| Stale identity results | Passed | Identity version, active Clerk ID, synchronized ID, and SDK App User ID gate state publication |
| CustomerInfo listener | Passed | One provider listener; removed on cleanup; each update confirms the active RevenueCat/Clerk identity |
| Offering deduplication | Passed | In-flight requests are shared per mode/user identity key; failures clear the request so explicit retry can recover |
| CustomerInfo deduplication | Passed | Concurrent same-mode/same-user refreshes share an in-flight request |
| Purchase success | Passed at source level | Purchase is followed by App User ID confirmation and fresh CustomerInfo; only active `DearDiary Pro` unlocks access |
| Purchase failure/cancel | Passed at source level | Safe messages, no CustomerInfo-based entitlement grant, retry remains available |
| Restore | Passed at source level | Restore is followed by identity confirmation and fresh CustomerInfo; inactive entitlement remains Free |
| Renewal/expiration | Passed at source level | Verified listener/refresh updates replace same-user CustomerInfo; inactive entitlement removes Plus only |
| Expo Go | Passed at source level | `storeClient` execution is explicitly non-authoritative for entitlement access |
| Server quotas | Preserved | Existing Supabase subscription lookup and AI usage ledger remain unchanged |
| Core journaling/App Lock/deletion | Preserved | These surfaces remain outside subscription feature gates |

These are source-level results, not a runtime purchase pass.

## Automated verification

| Check | Result |
|---|---|
| `npx expo-doctor` | Passed: 18/18 |
| `npx tsc --noEmit` | Passed |
| `npm run lint` | Passed |
| Existing scripted tests | Passed after implementation |
| Standalone analytics/text tests | Passed after temporary full-project compile with alias links in `/tmp` |
| `test:revenuecat-config` | Passed |
| `test:revenuecat-runtime` | Passed |
| `verify:revenuecat-config` | Passed with redacted metadata only |
| `test:environment` | Passed |
| `test:navigation-transitions` | Passed |
| `test:route-security` | Passed |

## Runtime matrix

| Check | Classification | Notes |
|---|---|---|
| Monthly Test Store package | Dashboard passed; runtime pending | `$rc_monthly` maps to the active `P1M` Test product and preserves Google Play; requires Development build |
| Yearly Test Store package | Dashboard passed; runtime pending | `$rc_annual` maps to the active `P1Y` Test product and preserves Google Play; requires Development build |
| Successful purchase | Pending manual verification | Select Test Store success simulation; verify entitlement/UI |
| Cancelled purchase | Pending manual verification | No Plus; non-fatal message; paywall remains usable |
| Failed purchase | Pending manual verification | No Plus, crash, stale entitlement, or raw payload |
| Restore/no restore | Pending manual verification | Verify active and inactive results for the same Clerk user |
| Restart persistence | Pending manual verification | Kill/restart after verified purchase |
| Renewal/expiration | Pending manual verification | Test Store accelerated lifecycle plus outbound refresh |
| User A Plus / User B Free | Pending manual verification | User B must never inherit User A state |
| Return from User B to User A | Pending manual verification | User A entitlement returns only after synchronization |
| Account deletion | Pending manual verification | Must remain available regardless of subscription |
| Offline behavior | Pending manual verification | Free journaling remains available; no unverified Plus grant |
| Logcat privacy | Pending manual verification | Capture only the app process and scan per privacy audit |
| Google Play Billing in sideload | Not applicable | Requires Google Play Internal Testing install |

## Remaining configuration actions

RevenueCat MCP verified the project, apps/providers, products, prices, entitlement attachments, offering/package relationships, current offering, and redacted Test Store public-key presence. It does not expose an operation to read or manage Sandbox Testing Access. Manually check that dashboard setting for the disposable Clerk test accounts; if an allowlist is required, use their stable Clerk `userId` values as RevenueCat App User IDs. This is the only manual RevenueCat dashboard action remaining.

The existing EAS `development` environment contains `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`. Development explicitly selects it through `EXPO_PUBLIC_REVENUECAT_MODE=test-store`. Preview and Production explicitly select their Android public SDK key through `google-play` mode.

## Verdict

**REVENUECAT TEST STORE DEVELOPMENT PROFILE READY**

This is not a runtime-passed verdict. Build only with:

```bash
eas build --platform android --profile development
npx expo start --dev-client --clear
```

Treat the artifact as **INTERNAL TEST STORE BUILD — NEVER SUBMIT TO GOOGLE PLAY**.
