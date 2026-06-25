# DearDiary Release Blockers

Audit date: 2026-06-25

Do not proceed to release validation while an unresolved P0 or P1 remains. Blocked items below require a verified non-production Supabase/Clerk environment and disposable test accounts before destructive testing.

## P0

- [x] RB-001: AI insight report cache could accept a report under the wrong user bucket
  - Area: User isolation, local hydration, AI reports
  - Reproduction: Seed `dear-diary-ai-insight-reports` with `reportsByUser["UserA"][cacheKey]` containing a structurally valid report whose `userId` is `UserB`.
  - Risk: User B report can be displayed while User A is active if local persisted data is malformed.
  - Fix: `getSanitizedReportsByUser` now keeps only reports whose `report.userId` matches the enclosing user key. `setCachedReport` also rejects mismatched writes.
  - Retest status: Static verification passed with `npx tsc --noEmit` and `npm run lint`; seeded AsyncStorage device retest still recommended.

- [x] RB-002: Remote AI report response was not locally checked against the active user before caching
  - Area: User isolation, AI reports
  - Reproduction: A bad or misconfigured backend response returns a valid report for a different `userId`.
  - Risk: Cross-user report content could be cached/displayed under the active user if backend isolation regresses.
  - Fix: `useAIInsightReport` now caches fetched/generated reports only when `report.userId === userId`.
  - Retest status: Static verification passed; remote fault-injection/manual backend retest blocked until a non-production backend is confirmed.

- [x] RB-003: Mood-log hydration deduped by ID without user scope
  - Area: User isolation, local hydration, mood logs
  - Reproduction: Seed two valid mood logs for different users with the same `id`.
  - Risk: One user's mood log can be dropped during hydration.
  - Fix: Mood-log dedupe now uses `userId:id`.
  - Retest status: Static verification passed; seeded AsyncStorage device retest still recommended.

- [x] RB-004: Achievement sync could merge stale notification state after account switch
  - Area: Sync, account switching
  - Reproduction: Start achievement sync for User A, switch to User B while the remote achievement request is pending.
  - Risk: Late User A achievement state could be merged after the active user changes.
  - Fix: `syncAchievements` now checks the active user after the remote call and before merging pulled notification IDs.
  - Retest status: Static verification passed; disposable-account remote retest blocked.

## P1

- [ ] RB-005: Destructive remote tests are blocked until the active Clerk/Supabase environment is confirmed non-production
  - Area: Environment safety
  - Reproduction: `.env` contains public Clerk/Supabase keys, but no project label or disposable test accounts are available in this workspace.
  - Risk: Account deletion, sync tombstone, and remote conflict tests could affect real data if run blindly.
  - Fix: Do not run destructive remote tests here. Confirm test project, create disposable users, and only then run the blocked matrix rows.
  - Retest status: Blocked.

## P2

- [ ] RB-006: Physical-device lifecycle tests are not executed
  - Area: App termination, App Lock, biometrics, notifications, share sheet, low-memory recreation
  - Reproduction: Requires Android/iOS development or release build on a device.
  - Risk: Device-only lifecycle defects may remain undiscovered.
  - Fix: Run the blocked rows in `docs/edge-case-test-matrix.md` on a non-production build.
  - Retest status: Blocked.

- [ ] RB-007: Full backup/restore import flow is not present in the current codebase
  - Area: Backup/restore
  - Reproduction: Search found export and sync backup wording, but no restore/import UI or service.
  - Risk: Restore-specific destructive tests cannot be completed.
  - Fix: Treat restore as out of current implemented surface; add a restore validation audit before implementing import.
  - Retest status: Blocked by missing feature.

## P3

- [ ] RB-008: Journal editor currently behaves as manual save rather than debounce autosave
  - Area: Journal editor
  - Reproduction: Code path saves through explicit `handleSave`; no draft debounce/autosave service was found.
  - Risk: Users can still navigate away from unsaved manual edits.
  - Fix: Out of scope for this sprint unless product confirms autosave is required now.
  - Retest status: Documented limitation.

