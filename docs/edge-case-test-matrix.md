# DearDiary Edge-Case Reliability Test Matrix

Audit date: 2026-06-25

Scope: crash prevention, data safety, privacy isolation, false-success prevention, and recovery paths. This audit used code inspection plus local static verification. Physical-device destructive tests and remote destructive tests were not run because the active Supabase/Clerk environment could not be confirmed as non-production from this workspace.

## Environment Snapshot

| Item | Value |
|---|---|
| App version | `1.0.0` from `app.json` and `package.json` |
| Expo SDK | `~54.0.34` |
| React Native | `0.81.5` |
| Clerk SDK | `@clerk/expo` `^3.3.1` |
| Supabase client | `@supabase/supabase-js` `^2.108.1` |
| Android package/version | `com.aryan.deardiary`, `versionCode` 1 |
| Test device | Not available in this workspace |
| Active env files | `.env`, `.env.example` |
| Env safety | Blocked: public Clerk/Supabase keys exist, but no non-production label is available |
| Git checkpoint | Started from clean `git status --short`; audit changes are uncommitted |

## Reliability Inventory

| Boundary | Current implementation |
|---|---|
| Local persistence | Zustand + AsyncStorage via `createPersistStorage()` for journal, mood logs, chat, reports, reflections, achievements, sync metadata, notifications, and onboarding |
| User-scoped AsyncStorage keys | `dear-diary-journal`, `dear-diary-mood-logs`, `deardiary-chat-store-v1`, `deardiary-entry-reflections-v1`, `dear-diary-ai-insight-reports`, `deardiary-achievement-store-v1`, `deardiary-sync-store-v1` |
| Device-level AsyncStorage keys | `dear-diary-onboarding`, `dear-diary-notification-preferences` |
| SecureStore keys | Per-user App Lock key `deardiary.app-lock.v1.<sanitized user id>` |
| Remote writes | Journal RPC `merge_journal_entries`, mood-log upsert/RPC paths, profile sync, achievement state upsert, AI reflection/report Edge Functions, delete-account Edge Function |
| Concurrent operations | Sync triggers, report/reflection generation, AI chat send, export, account deletion, App Lock unlock attempts, notification scheduling |
| Stale-result guards | Sync active-user checks, AI chat request IDs, entry reflection generation IDs, report request context versioning, App Lock user refs |
| Retry behavior | Sync retry, hydration retry, report/reflection retry, export repeat action, account deletion retry after partial failure |
| Timeout handling | Account deletion client timeout; AI/sync fault hooks exist. General Supabase calls rely on SDK/network behavior |
| AppState listeners | App Lock lifecycle cover/lock behavior; auto-sync foreground handling through sync manager |
| Deep-link guards | Journal route ID validator; report period validator |
| Backup/restore | Export exists. Full backup/restore import flow is not implemented in current codebase |
| Error boundaries | Root error fallback plus feature boundaries and state components |
| Development test hooks | `lib/dev/faultInjection.ts`, gated by `__DEV__` |

## Matrix

| ID | Area | Scenario | Preconditions | Steps | Expected | Actual | Severity | Status | Regression coverage |
|---|---|---|---|---|---|---|---|---|---|
| EC-001 | Environment | Confirm destructive test environment is non-production | `.env` present | Inspect env keys and config | Non-production project is identified before destructive tests | Env has public Clerk/Supabase keys but no non-production marker | P1 | Blocked | Documented blocker; no destructive remote tests run |
| EC-002 | Journal | Create entry while offline | Signed in, unlocked, offline | Save a non-empty entry | Local save succeeds; sync can fail without data loss | Code path saves locally before sync; offline sync dialog preserves local data | P0 | Passed | `JournalEditorScreen.handleSave`, `requestSync` offline branch |
| EC-003 | Journal | Empty draft | Signed in, unlocked | Attempt save with no prompt/title/content | Empty entry is not saved; no false success | Save disabled by `canSave` | P3 | Passed | UI guard |
| EC-004 | Journal | Title-only entry | Signed in, unlocked | Save title without content | Entry persists locally with empty content | Code path permits title-only save | P2 | Passed | Manual device retest required |
| EC-005 | Journal | Very long entry 10,000 chars | Physical device | Save/reopen/export long Unicode entry | No crash; content preserved | Not executed on device | P2 | Blocked | Requires physical-device run |
| EC-006 | Journal | Delete while sync/autosave pending | Existing entry with pending sync | Delete then trigger sync | Deleted entry remains tombstoned and is not resurrected | Code marks `deletedAt` and pending sync; no debounce autosave exists in current editor | P1 | Passed | Manual remote tombstone retest required |
| EC-007 | Journal | Missing entry route | Open `/journal/[missing]` | Navigate directly to missing ID | Safe not-found state; no crash | Code shows safe missing-entry state | P2 | Passed | `JournalEditorScreen` missing-entry branch |
| EC-008 | Journal | Malformed journal persisted record | Corrupted AsyncStorage | Hydrate one invalid and one valid entry | Valid entry remains; invalid record isolated | Sanitizer excludes invalid records and dedupes scoped IDs | P1 | Passed | `normalizePersistedJournalEntries` |
| EC-009 | Mood logs | Same mood-log ID under two users | Corrupted AsyncStorage | Hydrate User A and User B records with same ID | Both users' valid records survive | Previously deduped by ID only; fixed to dedupe by `userId:id` | P0 | Fixed | `store/useMoodLogStore.ts` |
| EC-010 | Reports | Report stored under wrong user bucket | Corrupted AsyncStorage | Hydrate `reportsByUser[A]` containing report for B | Report must not display under User A | Previously accepted valid report under wrong bucket; fixed to require `report.userId === userId` | P0 | Fixed | `store/useAIInsightReportStore.ts` |
| EC-011 | Reports | Remote fetched report belongs to wrong user | Bad/misconfigured backend response | Refresh report | Do not cache or display mismatched report | Added local user check before caching fetched report | P0 | Fixed | `hooks/useAIInsightReport.ts` |
| EC-012 | Reports | Generated report belongs to wrong user | Bad/misconfigured backend response | Generate report | Reject mismatched report; preserve old content | Added local user check and error message | P0 | Fixed | `hooks/useAIInsightReport.ts` |
| EC-013 | Reports | Navigate away during report request | Report request in flight | Leave screen before response | No stale setState/cache update | Added unmount request-version invalidation | P2 | Fixed | `hooks/useAIInsightReport.ts` |
| EC-014 | Sync | Concurrent sync triggers | Pending changes | Trigger foreground/reconnect/manual together | One active sync run at a time | `activeSync` single-flight guard verified | P1 | Passed | `requestSync` |
| EC-015 | Sync | User switch during sync | User A sync in flight | Switch to User B before response | User A result must not mutate active User B state | Journal/mood/profile paths guarded; achievement merge now guards active user after remote call | P0 | Fixed | `lib/sync/requestSync.ts` |
| EC-016 | Sync | Cloud push fails after local save | Supabase unavailable | Save entry then sync | Local data preserved; pending/failed sync status remains retryable | Code marks failed IDs without deleting local entries | P0 | Passed | `requestSync`, `journalTwoWaySync` |
| EC-017 | Sync | Pull malformed journal row | Malformed remote row | Pull from cloud | Sync fails retryably; local entries preserved | Parser throws, caught by two-way sync as pull failure | P1 | Passed | `journalSync`, `journalTwoWaySync` |
| EC-018 | Sync | Equal timestamp conflict | Same local/remote update time | Merge remote | Matching data marks synced; mismatched local wins and remains retryable | Code policy verified | P2 | Passed | `mergeJournalEntries`; see sync conflict policy |
| EC-019 | Auth | Cold start signed out | Clerk loaded signed out | Launch app | No private data flash | Root index waits for Clerk/onboarding; tabs redirect signed-out users | P0 | Passed | Code audit |
| EC-020 | Auth | User A to User B same device | Two disposable accounts | Switch accounts | A data never appears under B | Code paths are mostly scoped; destructive account-switch device test not run | P0 | Blocked | Requires disposable Clerk users |
| EC-021 | App Lock | SecureStore read failure | Fault/native failure | Launch locked app | Fail closed; provide recovery path | Fails closed behind privacy cover, but recovery path needs physical validation | P1 | Blocked | Manual SecureStore fault/device test required |
| EC-022 | App Lock | Deep link while locked | App Lock enabled | Open private deep link | Private content never flashes | Gate renders lock/cover before private navigator | P0 | Passed | Code audit; device retest required |
| EC-023 | App Lock | App switcher preview | App unlocked, background app | Open app switcher | Privacy cover appears | Lifecycle shows cover on background/blur | P0 | Passed | Device retest required |
| EC-024 | AI Chat | Offline send | Offline | Send message | No request; journal data unchanged | Send is disabled/offline dialog shown | P2 | Passed | `AiChatScreen` |
| EC-025 | AI Chat | User switch during response | User A request in flight | Switch to User B | Response not appended to B | Request ID invalidated on `userId` change | P0 | Passed | `AiChatScreen` |
| EC-026 | Entry reflection | Regeneration fails with old reflection | Cached reflection exists | Regenerate with AI failure | Old reflection remains | Hook only upserts on valid success | P2 | Passed | `useEntryReflection` |
| EC-027 | Entry reflection | Entry deleted during generation | Request in flight | Delete entry before response | Stale response ignored or not shown | Hook checks request generation/user; physical retest not run | P2 | Passed | Code audit |
| EC-028 | Export | Export current user only | Signed in | Export from Profile | Export contains active user's entries only | Profile passes active `entries`, already scoped by App Lock active user; no remote test | P0 | Passed | `ProfileScreen`, `exportJournal` |
| EC-029 | Export | Share cancellation | Device share sheet | Cancel share | Neutral result, no data mutation | Not executed on device | P3 | Blocked | Requires device |
| EC-030 | Backup/restore | Invalid backup restore | Restore UI | Import malformed file | Current data must not be destroyed | Restore/import is not implemented in current codebase | P1 | Blocked | Out of implemented surface |
| EC-031 | Notifications | Android Expo Go scheduling | Android Expo Go | Enable reminders | No crash; truthful unsupported message | Code throws explicit development-build error | P2 | Passed | `lib/notifications.ts` |
| EC-032 | Notifications | Duplicate scheduling | Reminders enabled twice | Toggle/edit reminders | Old IDs canceled before scheduling new ones | Code cancels fixed IDs before scheduling | P2 | Passed | `scheduleJournalReminders` |
| EC-033 | Account deletion | Duplicate delete taps | Confirmation visible | Tap confirm repeatedly | One deletion request; no false success | Store blocks duplicate in-flight deletion | P1 | Passed | `deleteCurrentAccount`, Profile guard |
| EC-034 | Account deletion | Clerk deletion fails after remote data deleted | Edge Function returns partial failure | Delete account | Sync stays blocked; local cleanup attempted; recovery shown | Client keeps guard active for auth failure after remote deletion | P0 | Passed | Code audit |
| EC-035 | Account deletion | Sync during deletion | Deletion in progress | Trigger sync/save | No new sync/write work | Stores and sync check deletion guard | P0 | Passed | Code audit |
| EC-036 | Navigation | Invalid journal ID deep link | Malformed route param | Open route | Safe redirect/no crash | Route ID validator rejects slash/empty/oversized IDs | P2 | Passed | `routeValidators` |
| EC-037 | Date/time | Local day grouping | Entries near midnight | Open calendar/streaks | Local day, not UTC slice | Streak helper uses local date components | P2 | Passed | Code audit; timezone device retest needed |
| EC-038 | Error privacy | Error logs | Trigger failures | Inspect logs/UI | No journal body, email, JWT, PIN, full rows | New code adds no private logs; existing AI function error readers log code/requestId only | P0 | Passed | Code audit |
| EC-039 | Static checks | Strict TypeScript | Local workspace | Run `npx tsc --noEmit` | No type errors | Passed | P1 | Passed | Executed locally |
| EC-040 | Static checks | Lint | Local workspace | Run `npm run lint` | No lint errors | Passed | P1 | Passed | Executed locally |

