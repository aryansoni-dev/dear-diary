# Release logcat privacy audit

Audit date: 2026-07-19

Candidate: source version 1.0.7, Android version code 7

## Current status

| Check | Classification | Evidence / blocker |
|---|---|---|
| RevenueCat release log level | Passed | Non-development builds now use `LOG_LEVEL.WARN` |
| RevenueCat one-time configuration | Passed | Module-level and provider guards prevent repeated configuration during the app process |
| Manual subscription payload logging | Passed | No purchase token, customer information, entitlement payload, or package payload is logged by app code |
| App error reporting in release | Passed | `reportAppError` returns outside `__DEV__` |
| Generic notification content | Passed | Scheduled reminders contain no journal body, AI content, user ID, or private resource ID |
| Controlled current-candidate capture | Blocked by environment | The candidate was intentionally not built or installed |
| Sensitive-pattern scan of current capture | Blocked by environment | No current-candidate logcat file exists to scan |
| Raw logcat excluded from source control | Passed | `security-artifacts/` contains only `.gitkeep` |

Earlier limited logs from 1.0.6/code 6 are historical only and are not a pass for this candidate.

## Required controlled capture

Use a disposable device/profile where possible and capture only the DearDiary application process:

```bash
APP_PID=$(adb shell pidof -s com.aryan.deardiary | tr -d '\r')
adb logcat -c
```

After completing the two-user, deep-link/App Lock, notification, AI, purchase/restore, sign-out, and deletion flows:

```bash
adb logcat --pid="$APP_PID" -d \
  > security-artifacts/deardiary-preview-logcat.txt
```

Scan the captured file:

```bash
rg -ni \
  "authorization|bearer|access.?token|refresh.?token|session.?token|purchase.?token|password|pin|journal|entry.?body|openrouter|service.?role" \
  security-artifacts/deardiary-preview-logcat.txt
```

## Acceptance matrix

| Check | Classification |
|---|---|
| No authorization header or bearer/session/access/refresh token | Pending manual verification |
| No purchase token or customer/entitlement payload | Pending manual verification |
| No password or PIN | Pending manual verification |
| No journal title/body, AI content, or private resource ID | Pending manual verification |
| No OpenRouter or service-role secret | Pending manual verification |
| All matches manually classified; benign matches documented without private values | Pending manual verification |

Do not commit the raw logcat file. Redact sensitive values from any shared diagnostic, then remove the raw artifact after the audit if retention is unnecessary.
