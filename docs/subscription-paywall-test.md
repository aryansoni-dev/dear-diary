# Subscription Paywall Test Matrix

Do not mark store purchase tests passed unless tested with sandbox/internal billing in a native build.

| ID  | Scenario | User type | Expected result | Actual | Status |
| --- | -------- | --------- | --------------- | ------ | ------ |
| 1 | App launches without RevenueCat configured in development with safe error. | Free | Core app works; paywall says subscriptions unavailable. | Not run on device. | Not tested |
| 2 | App launches with RevenueCat configured. | Free | Core app works; offerings can load. | Not run with real keys. | Not tested |
| 3 | Offerings load. | Free | Monthly/yearly packages render from RevenueCat. | Not run with real offerings. | Not tested |
| 4 | Missing offerings show safe fallback. | Free | Paywall does not crash. | Source implemented. | Not tested |
| 5 | Missing product does not crash paywall. | Free | Available package renders; missing package is hidden. | Source implemented. | Not tested |
| 6 | Customer info loads after sign in. | Free/Pro | Clerk user ID is RevenueCat app user ID. | Not run with real keys. | Not tested |
| 7 | Customer info clears after sign out. | Free/Pro | Previous entitlement is cleared. | Source implemented. | Not tested |
| 8 | Monthly purchase success. | Free | Purchase completes and Pro unlocks. | Not run in sandbox/internal billing. | Not tested |
| 9 | Yearly purchase success. | Free | Purchase completes and Pro unlocks. | Not run in sandbox/internal billing. | Not tested |
| 10 | Purchase cancellation. | Free | Friendly cancellation message. | Not run in sandbox/internal billing. | Not tested |
| 11 | Purchase failure. | Free | Friendly failure message. | Not run in sandbox/internal billing. | Not tested |
| 12 | Restore active subscription. | Pro | Restore succeeds only if `DearDiary Pro` is active. | Not run in sandbox/internal billing. | Not tested |
| 13 | Restore with no subscription. | Free | Shows no active subscription found. | Not run in sandbox/internal billing. | Not tested |
| 14 | Already subscribed behavior. | Pro | Friendly state; Pro remains active. | Not run in sandbox/internal billing. | Not tested |
| 15 | Manage subscription link. | Pro | Opens `customerInfo.managementURL` or store guidance. | Not run on device. | Not tested |
| 16 | Pro entitlement unlocks. | Pro | `DearDiary Pro` active entitlement sets `isPro=true`. | Not run with real entitlement. | Not tested |
| 17 | Expired entitlement locks. | Expired | Premium gates return to free behavior. | Not run with real entitlement. | Not tested |
| 18 | User A Pro / User B Free account switching. | Mixed | No Pro state flash for User B. | Source resets customer info on auth change. | Not tested |
| 19 | No entitlement flash during auth load. | Mixed | Subscription state clears while identifying. | Source implemented. | Not tested |
| 20 | App restart preserves correct entitlement after refresh. | Mixed | RevenueCat refresh controls state. | Not run on device. | Not tested |
| 21 | Free AI Chat first 10 messages allowed. | Free | Provider-backed messages allowed. | Not run against deployed function. | Not tested |
| 22 | Free AI Chat 11th message shows paywall. | Free | Client/server deny and paywall opens. | Not run against deployed function. | Not tested |
| 23 | Free first 3 reflections allowed. | Free | Reflections generate. | Not run against deployed function. | Not tested |
| 24 | Free 4th reflection shows paywall. | Free | Client/server deny and paywall opens. | Not run against deployed function. | Not tested |
| 25 | Free weekly report preview allowed. | Free | First monthly weekly report generation allowed. | Not run against deployed function. | Not tested |
| 26 | Free monthly report locked. | Free | Monthly report opens Pro lock/paywall. | Source implemented. | Not tested |
| 27 | Pro AI Chat allowed within fair use. | Pro | Up to 300 provider-backed messages/month. | Not run with real entitlement. | Not tested |
| 28 | Pro reflections allowed within fair use. | Pro | Up to 100 reflections/month. | Not run with real entitlement. | Not tested |
| 29 | Pro monthly report allowed. | Pro | Monthly report generation allowed for valid month. | Not run with real entitlement. | Not tested |
| 30 | Pro advanced insights allowed. | Pro | Advanced AI cards render from reports. | Not run with real entitlement. | Not tested |
| 31 | AI Chat function rejects over-quota free user. | Free | `QUOTA_EXHAUSTED`; no provider call. | Not run against deployed function. | Not tested |
| 32 | Reflection function rejects over-quota free user. | Free | `QUOTA_EXHAUSTED`; no provider call. | Not run against deployed function. | Not tested |
| 33 | Monthly report rejects free user. | Free | `QUOTA_EXHAUSTED`; no provider call. | Not run against deployed function. | Not tested |
| 34 | Server does not trust client-sent `isPro`. | Free | Client cannot pass entitlement to AI functions. | Source implemented. | Not tested |
| 35 | Missing/invalid auth token rejected. | Free | 401. | Existing auth path, not rerun. | Not tested |
| 36 | Cross-user request rejected. | Mixed | RLS/JWT subject scope enforced. | Existing auth path, not rerun. | Not tested |
| 37 | Quota race condition tested with rapid requests. | Free/Pro | Atomic RPC prevents over-limit increments. | Not load tested. | Not tested |
| 38 | Free journaling works offline. | Free | Core journaling remains local-first. | Not run on device. | Not tested |
| 39 | Paywall handles offline gracefully. | Free | Purchase unavailable/friendly error. | Not run on device. | Not tested |
| 40 | AI action offline shows existing offline error. | Free/Pro | No server quota bypass. | Not run on device. | Not tested |
| 41 | Cached Pro does not bypass server AI enforcement. | Pro offline | AI requires server access. | Source implemented. | Not tested |
| 42 | Journal CRUD. | Any | No regression. | Static checks pending after implementation. | Not tested |
| 43 | Manual tags. | Any | No regression. | Static checks pending after implementation. | Not tested |
| 44 | AI-generated tags. | Any | Generated only with allowed reflection. | Static checks pending after implementation. | Not tested |
| 45 | Dynamic Home prompts. | Any | Remain free. | Static checks pending after implementation. | Not tested |
| 46 | AI Chat rendering. | Any | No regression. | Static checks pending after implementation. | Not tested |
| 47 | Reports rendering. | Any | No regression. | Static checks pending after implementation. | Not tested |
| 48 | App Lock. | Any | Paywall does not bypass lock. | Not run on device. | Not tested |
| 49 | Account deletion. | Any | Still available and not subscription-gated. | Static source checked. | Not tested |
| 50 | Screen transitions. | Any | No regression. | Not run on device. | Not tested |
