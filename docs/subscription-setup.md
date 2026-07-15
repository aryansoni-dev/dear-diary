# Subscription Setup

DearDiary Pro uses RevenueCat on the client and server-side Supabase Edge Function checks for AI-costing features.

## Identifiers

- Entitlement: `DearDiary Pro`
- Offering: `default`
- Expected monthly product: `deardiary_pro_monthly`
- Expected yearly product: `deardiary_pro_yearly`

Use the actual store product IDs if App Store Connect, Google Play Console, or RevenueCat are configured differently. Do not hardcode display prices in the app. The paywall renders `package.product.priceString` from RevenueCat packages.

## RevenueCat Account Status

Last checked with RevenueCat MCP on 2026-07-12.

- Project: `DearDiary` (`proj11badf66`)
- Current offering: `default` (`ofrng0ecaeb85d3`)
- Monthly package: `$rc_monthly` (`pkge73858b426a`)
- Yearly package: `$rc_annual` (`pkgef61fa3ca89`)
- Test Store app: `Test Store` (`app4bec91040f`)
- Android app: `DearDiary Android` (`app43d78856cd`) with package `com.aryan.deardiary`
- Test Store monthly product: `deardiary_pro_monthly`
- Test Store yearly product: `deardiary_pro_yearly`
- Android monthly product record: `deardiary_pro_monthly:monthly`
- Android yearly product record: `deardiary_pro_yearly:yearly`

The app and Edge Functions intentionally use the active RevenueCat entitlement identifier `DearDiary Pro`. Do not rename it without updating `revenueCatEntitlementId` in the app and the shared Edge Function subscription helper.

Google Play Store state is not fully synced yet because RevenueCat reports missing store credentials for the Play Store app. Add Google Play service credentials in RevenueCat, create matching Play subscriptions/base plans, and verify store state before production testing.

## Environment

Client-safe Expo public variables:

```text
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
```

Server-only Supabase Edge Function secrets:

```text
REVENUECAT_SECRET_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Do not put RevenueCat secret keys, Supabase service-role keys, store credentials, or AI provider keys in Expo public variables.

## Server Enforcement

This implementation uses RevenueCat REST validation from AI Edge Functions, with `subscription_status` available as a future webhook mirror table. Edge Functions check:

1. Authenticated Clerk user from the JWT subject.
2. RevenueCat `DearDiary Pro` entitlement using the server-only RevenueCat secret, or an active mirrored `subscription_status` row.
3. Monthly usage quota through `increment_ai_usage_if_allowed`.
4. Provider call only after access is allowed.

Usage period is UTC calendar month with `YYYY-MM` keys. Requests denied before the provider call are not counted. Requests that pass quota and reach the provider count even if the provider later fails.

## Paywall Intent

When a user hits a premium gate, the app opens `/paywall` with a `feature` parameter. After successful purchase or restore, the app returns to the previous screen and asks the user to tap the action again. It does not automatically trigger a new expensive AI request after purchase.
