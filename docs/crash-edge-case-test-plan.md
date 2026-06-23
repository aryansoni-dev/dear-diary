# Crash and Edge-Case Test Plan

This plan avoids private journal text, email addresses, full user IDs, and backup contents. Use synthetic entries only.

## Audit Snapshot

| Area | Current Finding | Sprint Action |
| --- | --- | --- |
| Persisted stores | Journal, chat, sync, achievement, entry reflection, AI report, notification preferences, and onboarding persist through Zustand and AsyncStorage. | Added shared fault-injectable storage and stricter hydration sanitizers for malformed records and preferences. |
| SecureStore | App Lock config is stored per sanitized user key. | Keep App Lock as the privacy gate; no route structure change. |
| Sync | `requestSync` is the single-flight sync entry point. | Added active-user checks before applying late sync results. |
| AI | Entry reflection, report generation, and AI Chat already use service boundaries. | Added development-only AI fault flags and stale request guards where missing. |
| Navigation | Private routes are behind auth and App Lock providers. | Added route ID validation for journal detail links. |
| Tests | No automated test script exists; `lint` is available. | Use this manual matrix; validation helpers are pure and can be unit-tested later if a test runner is approved. |

## Fault Injection Usage

Fault injection is code-controlled and development-only. Edit `enabledFaults` in `lib/dev/faultInjection.ts` while testing, then remove the key before committing or building. Production always returns `false` for every flag.

Supported flags:

```txt
async_storage_read_failure
async_storage_write_failure
sync_network_failure
sync_remote_failure
sync_timeout
ai_timeout
ai_empty_response
ai_invalid_response
backup_failure
restore_failure
expired_session
malformed_local_record
```

## Manual Matrix

| ID | Area | Scenario | Preconditions | Steps | Expected | Actual | Status | Fix |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CE-001 | App Lifecycle | App killed during journal save | Signed in; app lock resolved; one draft open | Edit entry, save, kill app before returning to history, reopen | Last confirmed local entry remains; editor is not locked; retry is possible | Not run on physical device | Not Tested | Manual device test required |
| CE-002 | App Lifecycle | Foreground triggers sync while another sync is active | Signed in with pending changes | Background/foreground while manual sync is running | One sync run applies; no permanent syncing state | Code audit found single-flight guard | Pass | Existing `requestSync` guard |
| CE-003 | Authentication | Sign out during sync | Signed in with pending local entry | Start sync, sign out immediately | User A data remains namespaced; late sync does not update current user state | Code audit found late mutation risk | Fixed | Active-user checks in `requestSync` |
| CE-004 | User Switching | User A to User B while AI Chat response is pending | User A sends AI Chat message | Switch accounts before response returns | User A response is ignored for User B | Code audit found user-change request gap | Fixed | AI Chat request generation bump on `userId` change |
| CE-005 | Local Persistence | AsyncStorage read failure | Enable `async_storage_read_failure` in dev | Cold launch app | App does not crash; persisted store uses safe default state; no cloud overwrite should be started from unhydrated data | Not run on physical device | Not Tested | Fault wrapper added |
| CE-006 | Local Persistence | AsyncStorage write failure | Enable `async_storage_write_failure` in dev | Create/update entry | UI should surface local-save failure where existing flow can observe it; text remains in memory until retry | Not run on physical device | Not Tested | Fault wrapper added; editor-specific persistence status remains a follow-up |
| CE-007 | Corrupted Data | One malformed journal record | Seed AsyncStorage with one invalid record and one valid record | Cold launch | Valid record loads; invalid record is excluded; no crash | Code path verified by sanitizer | Fixed | `normalizePersistedJournalEntries` |
| CE-008 | Corrupted Data | Duplicate local journal IDs | Seed two records with same user and ID | Cold launch history | No duplicate React keys; deterministic latest-updated record is shown | Code path verified by sanitizer | Fixed | Duplicate scoped-ID normalization |
| CE-009 | Corrupted Data | Invalid journal date | Seed record with invalid `createdAt` | Cold launch history/calendar | Store remains usable; invalid record excluded from normal UI | Code path verified by sanitizer | Fixed | Timestamp validation in hydration |
| CE-010 | Corrupted Data | Invalid chat message date | Seed chat message with invalid `createdAt` | Open AI Chat | Chat screen does not crash sorting messages | Code path verified by sanitizer | Fixed | Chat hydration validator |
| CE-011 | Notifications | Invalid reminder time in storage | Seed `99:99` reminder time | Open notification settings | Default reminder time is used; scheduling state remains safe | Code path verified by sanitizer | Fixed | Notification preference merge sanitizer |
| CE-012 | Synchronization | Remote push succeeds before local status update | Pending entry exists; interrupt after push | Retry sync | Stable entry ID prevents duplicate remote record; pending entry remains retryable | Not run against Supabase | Not Tested | Existing deterministic IDs and RPC merge; manual remote test required |
| CE-013 | Synchronization | Pull returns malformed row | Supabase has malformed/incompatible row | Run sync | Sync failure is retryable; local entries remain preserved | Code audit found pull throws before merge | Pass | Existing row parser and catch path |
| CE-014 | Synchronization | Concurrent triggers | Pending entry; reconnect, foreground, manual retry | Trigger all within one second | Only one active sync run executes | Code audit found single-flight guard | Pass | Existing `activeSync` |
| CE-015 | AI | Entry reflection response after leaving screen | Open entry; start reflection; leave screen | Wait for response | No setState after unmount; stale response ignored | Code audit found missing guard | Fixed | Generation guard in `useEntryReflection` |
| CE-016 | AI | Empty AI response | Enable `ai_empty_response` | Generate chat/reflection/report | Previous valid content remains; retry is available | Not run on device | Not Tested | Service fault flags added |
| CE-017 | AI | Repeated generate taps | Report or reflection can generate | Tap generate repeatedly | Duplicate requests do not overwrite newer result | Code audit partially verified | Pass | Existing `isGenerating`/in-flight guards; entry hook now ignores stale work |
| CE-018 | Navigation | Malformed journal deep link | App signed in and unlocked | Open `/journal/%2Fbad` | Redirects safely to journal history; no private data preview behind lock | Code path verified | Fixed | `getSafeRouteId` |
| CE-019 | Navigation | Invalid report period | App signed in and unlocked | Open invalid report period route | Safe "Reflection not found" state | Code audit verified | Pass | Existing period validator |
| CE-020 | App Lock | Deep link while locked | App Lock enabled | Lock app, open private deep link | Auth resolves, App Lock resolves, then private content renders only after unlock | Not run on physical device | Not Tested | Existing root `AppLockGate`; manual test required |
| CE-021 | Dates | Local midnight grouping | Entries at 11:59 PM and 12:01 AM local time | Open calendar/history/streaks | Entries group by local day, not UTC day | Code audit partially verified | Pass | Existing local date key helpers; physical timezone test required |
| CE-022 | Backup/Export | File write/share failure | Device with sharing unavailable or storage issue | Export JSON/Markdown | Export failure dialog appears; app does not crash | Code audit verified | Pass | Existing `JournalExportError` path |
| CE-023 | Restore | Invalid backup JSON | Restore UI unavailable in current codebase | N/A | N/A | No restore implementation found | Blocked | Out of current implemented surface |
| CE-024 | Account Deletion | Double-tap delete | Account deletion dialog open | Confirm twice quickly | Duplicate deletion request is blocked | Code audit verified | Pass | Existing deletion guard |
| CE-025 | Large Content | 10,000+ character journal entry | Signed in | Create long entry, reopen, export | No render crash; export contains full content | Not run on physical device | Not Tested | Manual device test required |
| CE-026 | Privacy | Error logging safety | Trigger sync/AI/export errors | Inspect development logs | Logs contain sanitized codes/context only, no journal content or tokens | Code audit partially verified | Pass | Existing `reportAppError`; no full-store logs added |

## Regression Checklist

| Feature | Status | Notes |
| --- | --- | --- |
| Clerk authentication | Not Tested | Verify login, sign-up, sign-out, expired session. |
| Onboarding | Not Tested | Hydration now sanitizes invalid persisted value to default. |
| App Lock | Not Tested | Test PIN, biometrics, background/foreground, locked deep links. |
| Journal CRUD and autosave | Not Tested | Verify create, edit, delete, reopen, and sync status. |
| Journal History, search, tags, calendar | Not Tested | Verify malformed records are not visible and valid records remain. |
| Mood tracking | Not Tested | Verify mood save and filtering. |
| Home and Reflect | Not Tested | Verify routes still open editor and AI Chat. |
| AI Chat | Not Tested | Verify remote response, local fallback, user switch guard. |
| Entry AI reflections | Not Tested | Verify generate, regenerate, stale-entry warning. |
| Weekly/monthly reports | Not Tested | Verify generate, refresh, invalid period route. |
| Achievements | Not Tested | Verify unlock notifications and sync. |
| Notifications | Not Tested | Verify permission denied, scheduling failure, cancel. |
| Export | Not Tested | Verify JSON and Markdown. |
| Account deletion | Not Tested | Verify guarded deletion sequence. |

