# DearDiary Screen State Audit

Audit date: 2026-06-24

This audit records the user-visible loading, empty, filtered-empty, refresh,
offline, partial-data, and retry behavior for the major DearDiary screens. The
primary rule is that local hydration failure is never treated as an empty data
set, and remote refresh failure must preserve any usable cached/local content.

| Screen | Data source | Local or remote | Hydration flag | Initial loading condition | Empty condition | Filtered-empty condition | Refreshing condition | Offline behavior | Error source | Retry action | Stale content can remain visible | Current layout container | Existing state components |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | `journal-store.entries` | Local persisted | `journal-store.hasHydrated`, `hydrationError` | Shows delayed recent-entry loader only while journal store hydrates | Recent entries show first-entry CTA after hydrated empty store | N/A | Auto-sync never clears home content | Fully usable from local data | Local hydration error | `useJournalStore.persist.rehydrate()` | Yes | Existing root `ScrollView` | `ScreenErrorState`, local recent-entry empty card |
| Reflect | Hardcoded prompts plus journal context | Local, AI route via chat | Journal store for contextual prompt data | Static prompt UI renders; AI Chat owns chat hydration | Prompt cards remain available | N/A | N/A | Manual prompts remain; AI Chat blocks sends | AI Chat request failure | Chat send again after connectivity/session recovery | Yes | Existing `ScrollView` | Feature-level chat state |
| Journal History List | `journal-store.entries` | Local persisted | `journal-store.hasHydrated`, `hydrationError` | Delayed `ScreenLoadingState` | "Your journal begins here" CTA after hydrated empty store | Search/filter empty copy with clear action | Auto-sync does not clear list | Fully usable from local data | Local hydration error | `useJournalStore.persist.rehydrate()` | Yes | Existing root `ScrollView` plus horizontal filter scrollers | `ScreenLoadingState`, `ScreenEmptyState`, `FilteredEmptyState`, `ScreenErrorState` |
| Journal Calendar | `journal-store.entries`, derived calendar month | Local persisted + derived | `journal-store.hasHydrated`, `hydrationError` | Delayed calendar loading card | User-history empty message below preserved grid | N/A | Grid remains visible during sync | Fully usable from local data | Local hydration or derivation boundary | `useJournalStore.persist.rehydrate()` | Yes | Existing calendar view inside history `ScrollView` | `ScreenLoadingState`, `ScreenErrorState`, local calendar empty card |
| Journal Editor | `journal-store.entries`, route `entryId` | Local persisted, sync remote side effect | `journal-store.hasHydrated`, `hydrationError` | Existing-entry routes show loading before lookup | New entry is normal state | N/A | Save controls remain; sync status reflected in button label | Local editing and saving remain available | Local hydration, local save, missing entry, AI reflection | Hydration retry; save again; return to History for missing entry | Yes | Existing `KeyboardAvoidingView` + `ScrollView` | `ScreenLoadingState`, `ScreenErrorState`, app dialog |
| Entry AI Reflection | Reflection cache, Supabase Edge Function | Cached local + remote AI | `entry-reflection-store.hasHydrated`, `hydrationError` via `useEntryReflection` | Section-level loading while cache/remote reflection checks | Generate CTA when no reflection | N/A | Previous reflection stays visible while regenerating | Existing reflection remains; generation blocked before request | Cache hydration, remote AI, sync prerequisite | Generate/regenerate again when eligible | Yes | Existing editor section card | Existing reflection card states |
| Insights | Journal entries, local derived analytics, cached reports | Local persisted + remote report cache | `journal-store.hasHydrated`, `hydrationError`; report cache hydration in hook | Delayed `ScreenLoadingState` | "Your insights will grow with your journal" CTA after hydrated empty journal | Periods with limited data show section-specific chart copy | Report card status changes; local charts remain | Local charts remain; remote generation explains internet need | Journal hydration, AI report fetch/generation | Journal hydration retry; report refresh/generate | Yes | Existing root `ScrollView` | `ScreenLoadingState`, `ScreenEmptyState`, `ScreenErrorState`, report cards |
| Weekly Report | `useAIInsightReport(weekly)` | Cached local + remote report | Report cache `hasHydrated`, `hydrationError`; journal hydration in hook | Full report loading only when no cached report exists | No-report state only when no error is active | N/A | Existing report remains with updating banner | Existing report remains; generation requires internet | Cache hydration, remote fetch/generation, insufficient entries | Refresh/generate/regenerate exact period | Yes | Existing report `ScrollView` in `ReportShell` | `LoadingState`, `UpdatingBanner`, `ErrorBanner`, `EmptyReportState`, `OlderFormatState` |
| Monthly Report | `useAIInsightReport(monthly)` | Cached local + remote report | Report cache `hasHydrated`, `hydrationError`; journal hydration in hook | Full report loading only when no cached report exists | No-report state only when no error is active | N/A | Existing report remains with updating banner | Existing report remains; generation requires internet | Cache hydration, remote fetch/generation, insufficient entries | Refresh/generate/regenerate exact period | Yes | Existing report `ScrollView` in `ReportShell` | `LoadingState`, `UpdatingBanner`, `ErrorBanner`, `EmptyReportState`, `OlderFormatState` |
| AI Chat | `chat-store.messages`, journal entries for local fallback, remote AI | Cached local + remote AI | `chat-store.hasHydrated`, `hydrationError` | Inline "Preparing your conversation..." after delay | Welcome assistant message only after successful chat hydration | N/A | Existing messages remain while thinking | Existing messages remain; send disabled/intercepted | Chat cache hydration, remote AI, session/connectivity | Chat cache hydration retry; send again | Yes | Existing `KeyboardAvoidingView` + chat `ScrollView` | `ScreenErrorState`, inline offline notice, thinking state |
| Achievements | `journal-store.entries`, derived achievements | Local derived | `journal-store.hasHydrated`, `hydrationError` | Delayed `ScreenLoadingState` | Locked achievements normally remain; unlocked filter has specific empty copy | Filtered empty copy for unlocked/locked views | N/A | Fully usable from local data | Journal hydration | `useJournalStore.persist.rehydrate()` | Yes | Existing root `ScrollView` | `ScreenLoadingState`, `ScreenEmptyState`, `ScreenErrorState` |
| Notifications | Notification preference store, `expo-notifications` | Local persisted + native API | `notification-preferences-store.hasHydrated`, `hydrationError` | Toggle disabled with loading copy | Disabled reminders show "No reminders yet" | N/A | Switch row shows spinner while scheduling | Existing settings visible; native scheduling may be unavailable | Preference hydration, permission denied, unsupported environment, scheduling failure | Preference hydration retry; repeat toggle/time change | Yes | Existing root `ScrollView`, modal time picker | `ScreenErrorState`, app dialog |
| Export | `journal-store.entries` via Profile | Local persisted, native share sheet | `journal-store.hasHydrated`, `hydrationError` | Export action blocked until journal store hydrates | Dialog explains no entries to export | N/A | Menu item disabled/spinner while export prepares | Local export can proceed if sharing is available | Journal hydration, share unavailable, export file creation | Repeat export action | Yes | Existing Profile account section | App dialog, menu loading row |
| Backup and Sync | Journal, achievement, sync stores, Supabase sync | Local metadata + remote sync | Journal, achievement, sync `hasHydrated`; sync `hydrationError` tracked | Sync row reports idle while metadata hydrates | "No changes waiting" after hydration and no pending data | N/A | Existing profile content remains; Sync row shows syncing | Pending changes wait for internet | Sync metadata hydration, session, connectivity, Supabase | `requestSync()` from Data & Sync row | Yes | Existing Profile `ScrollView` | `SyncStatusRow`, `SyncStatusIndicator`, app dialog |
| Profile | Clerk user, journal entries, achievements, sync status | Clerk remote auth + local persisted data | Clerk `useUser`, journal `hasHydrated`/`hydrationError`, achievement/sync hydration | Journal-derived stats show loading placeholders until data ready | First-time copy for journal stats after hydrated empty journal | N/A | Export/sync/delete rows show operation busy states | Local settings remain; remote actions explain internet/session needs | Clerk metadata, journal hydration, export, sync, deletion | Journal hydration retry; exact export/sync/delete action retry | Yes | Existing root `ScrollView` | `ScreenErrorState`, `SyncStatusRow`, app dialog |
| App Lock | SecureStore-backed lock settings and lifecycle state | Local secure storage/native biometric | App lock provider status | Private screens remain behind existing gate | N/A | N/A | Unlock attempts keep lock UI visible | App switcher cover and local lock remain active | SecureStore/biometric/PIN errors | Existing unlock/setup retry flows | N/A | Existing App Lock gate components | Existing app-lock screens/dialogs |
| Legal | Bundled legal constants | Static local | N/A | No spinner for static content | Development fallback only if bundled text missing | N/A | N/A | Available offline/signed out | Missing bundled content | N/A | N/A | Existing legal document screen | Existing static fallback |

## Existing Signals

- Authentication gate: Clerk `isLoaded`, `isSignedIn`, and `userId`.
- Privacy gate: `AppLockGate` protects private content before screen states render.
- Journal hydration: `useJournalStore().hasHydrated` and `hydrationError`.
- Chat hydration: `useChatStore().hasHydrated` and `hydrationError`.
- Entry reflection cache hydration: `useEntryReflectionStore().hasHydrated` and `hydrationError`.
- AI report cache hydration: `useAIInsightReportStore().hasHydrated` and `hydrationError`.
- Achievement notification hydration: `useAchievementStore().hasHydrated` and `hydrationError`.
- Notification preference hydration: `useNotificationPreferencesStore().hasHydrated` and `hydrationError`.
- Sync metadata hydration: `useSyncStore().hasHydrated` and `hydrationError`.
- Connectivity: `useConnectivity()`.
- Normalized errors: `normalizeAppError()` and `AppError.userMessage`.

## Retry Operations

- Journal hydration retry calls `useJournalStore.persist.rehydrate()`.
- Chat hydration retry calls `useChatStore.persist.rehydrate()`.
- Notification preference hydration retry calls `useNotificationPreferencesStore.persist.rehydrate()`.
- Sync retry calls `requestSync()` through the existing Data & Sync row.
- Entry reflection retry calls `generate()` or `regenerate()` for the current entry.
- Report retry calls `refresh()`, `generate()`, or `regenerate()` for the selected period.
- Export retry repeats the selected export format.
- AI Chat retry is a new send after the remote/local response flow is eligible.

## Remaining Manual Verification

- Physical Android verification is still required.
- Force-failed AsyncStorage hydration should confirm the recovery states appear
  instead of first-time empty states.
- Force report/reflection failures should confirm cached content remains visible.
- Offline testing should confirm local screens remain usable and only remote
  actions are blocked.
- User switching should confirm user-scoped journal, chat, reflection, report,
  sync, and achievement data never flashes across accounts.
