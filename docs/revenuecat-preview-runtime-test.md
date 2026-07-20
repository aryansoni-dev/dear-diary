# RevenueCat Preview runtime test

Audit date: 2026-07-19

Candidate: source version 1.0.7, Android version code 7

Store environment: RevenueCat Test Store or authorized sandbox only

## Source audit

| Check | Classification | Evidence |
|---|---|---|
| Development logging | Passed | `LOG_LEVEL.DEBUG` is selected only when `__DEV__` is true |
| Preview/Production logging | Passed | Non-development builds select `LOG_LEVEL.WARN` |
| Configure once | Passed | A module-level guard allows one `Purchases.configure` call per app process; the provider retains a mount guard |
| Active Clerk identity | Passed | `Purchases.logIn(userId)` follows the loaded signed-in user |
| Signed-out identity | Passed | `Purchases.logOut()` runs for the signed-out state and customer state is cleared before the result is accepted |
| Stale async identity result | Passed | Results are ignored when the active user changes before completion |
| Sensitive manual logging | Passed | No purchase token, `CustomerInfo`, entitlement payload, package payload, or journal content is manually logged |
| Core journaling remains free | Passed | Source feature gates do not wrap journal CRUD |
| App Lock remains free | Passed | Source feature gates do not wrap App Lock |
| Account deletion remains free | Passed | Source feature gates do not wrap account deletion |

These are source-level results. Identity and entitlement isolation still require the runtime matrix below.

## Runtime matrix

| Check | Classification | Notes |
|---|---|---|
| Monthly package | Blocked by environment | Requires Test Store or authorized sandbox configuration on the current artifact |
| Yearly package | Blocked by environment | Requires Test Store or authorized sandbox configuration on the current artifact |
| Successful purchase | Pending manual verification | Do not use a live charge |
| Cancelled purchase | Pending manual verification | App must remain usable and show safe feedback |
| Failed purchase | Pending manual verification | No crash, stale entitlement, or sensitive logging |
| Restore | Pending manual verification | Restore only in the authorized test environment |
| Restart persistence | Pending manual verification | Entitlement survives process kill/restart correctly |
| Entitlement expiration | Pending manual verification | Plus access is removed while core free features remain available |
| User A Plus / User B Free | Pending manual verification | User B must not inherit User A's entitlement |
| Return from User B to User A | Pending manual verification | User A entitlement restores without exposing User B state |
| Core journaling free | Pending manual verification | Confirm runtime access without Plus |
| App Lock free | Pending manual verification | Confirm runtime access without Plus |
| Account deletion free | Pending manual verification | Confirm runtime access without Plus |
| Google Play Billing in sideloaded APK | Not applicable | A sideload must not be claimed as Google Play Billing validation |

Runtime execution is currently **blocked by environment** because the 1.0.7/code 7 candidate was not built or installed and no authorized Test Store/Internal Testing context was used.

Do not print purchase tokens or customer/entitlement payloads. Claim Google Play Billing validation only for an APK installed through Google Play Internal Testing.
