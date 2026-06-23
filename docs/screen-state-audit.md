# DearDiary Screen State Audit

Audit date: 2026-06-22

This audit records the current local-first state signals used by the major
DearDiary screens. Local content should render after the correct user store is
hydrated, while remote refreshes must keep cached content visible.

| Screen | Hydration | First Empty | Filtered Empty | Refreshing | Offline | Error | Retry |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | `journal-store.hasHydrated` | Recent entries show "Your journal begins here" | N/A | N/A - no refresh UI; parent auto-sync does not block local content | N/A - local-only screen with no offline UI | Pending - root error boundary only | Parent auto-sync only; no screen retry |
| Reflect | `journal-store.hasHydrated` for existing prompt lookup | Normal prompt cards remain available | N/A | N/A | Manual prompts remain; AI Chat explains internet need | AI Chat handles request failure | AI Chat send/retry path |
| Journal History | `journal-store.hasHydrated` | "Write your first entry and it will appear here." | "No entries match your search" + Clear filters | N/A - no refresh UI; parent auto-sync does not block local content | N/A - local-only screen with no offline UI | Pending - root error boundary only | Clear filters only; no screen sync retry |
| Calendar | `journal-store.hasHydrated` | Grid remains visible with first-use copy | N/A | Grid remains visible during sync | Fully local | Sync errors do not hide calendar | Sync retry outside calendar |
| Journal Editor | `journal-store.hasHydrated` before entry lookup | New editor is normal state | N/A | Local save UI remains in place | Editing remains local; AI generation requires internet | Local save dialog preserves draft | Save again; AI reflection retry |
| Entry AI Reflection | reflection cache hydration + remote refresh | Generate Reflection CTA | N/A | Existing reflection remains visible | Existing reflection remains; generation blocked by editor dialog | Inline safe error copy | Generate/regenerate operation |
| Insights | `journal-store.hasHydrated` and report-cache hydration | "Your insights will grow with your journal" | N/A | Charts stay visible; report cards keep cache | Local charts remain; report generation explains internet need | AI report errors are normalized | Report refresh/generate |
| Weekly Report | journal + report-cache hydration | "No report yet" / insufficient entries | N/A | Existing report remains + updating banner | Cached report remains; generation blocked | Safe retryable banner | Refresh current weekly period |
| Monthly Report | journal + report-cache hydration | "No report yet" / insufficient entries | N/A | Existing report remains + updating banner | Cached report remains; generation blocked | Safe retryable banner | Refresh current monthly period |
| AI Chat | `chat-store.hasHydrated` | Starter prompt after hydration only | N/A | Existing messages remain while sending | Existing messages remain; send is blocked with internet-required copy | Remote failure falls back locally | Send operation is single-flight |
| Achievements | `journal-store.hasHydrated` | Locked achievements show normally | Unlocked filter shows "No achievements unlocked yet" | Local calculation remains visible | Fully local | Sync failure does not hide unlocks | Sync retry from profile |
| Notifications | `notification-preferences-store.hasHydrated` | "No reminders yet" when disabled | N/A | Existing settings remain while saving | Scheduling may fail through existing notification errors | Dialog keeps selected settings visible | Toggle/time change again |
| Export | `journal-store.hasHydrated` | "Nothing to export yet" | N/A | Export row shows busy/disabled state | Local export can proceed if sharing is available | Safe export failure dialog | Export action can be retried |
| Backup & Sync | journal, achievement, and sync stores hydrate | No changes waiting | N/A | Existing profile content remains | Waiting-for-internet state | Safe sync failure copy | `requestSync` single operation |
| Profile | journal + achievement + sync hydration | Loading stats until hydrated | N/A | Profile remains while sync/export/delete run | Local stats and settings remain | Dialogs use user-safe messages | Sync/export/delete operation |
| Legal | Static local constants | Development fallback if constants missing | N/A | N/A | Available signed out/offline | Fallback content prevents blank screen | N/A |

## Existing Signals

- Authentication gate: Clerk `isLoaded`, `isSignedIn`, and `userId`.
- Privacy gate: `AppLockGate` waits for App Lock `status` before private content.
- User-scoped journal hydration: `useJournalStore().hasHydrated` plus `activeUserId`.
- Sync metadata hydration: `useSyncStore().hasHydrated`.
- Achievement notification hydration: `useAchievementStore().hasHydrated`.
- Notification preference hydration: `useNotificationPreferencesStore().hasHydrated`.
- Chat hydration: `useChatStore().hasHydrated`.
- Entry reflection cache hydration: `useEntryReflectionStore().hasHydrated`.
- AI report cache hydration: `useAIInsightReportStore().hasHydrated`.
- Connectivity: `useConnectivity()`.
- Normalized errors: `normalizeAppError()` and `AppError.userMessage`.

## Retry Operations

- History and Calendar do not fetch remotely; retry belongs to sync status.
- Sync retry calls `requestSync()` through the profile Data & Sync row.
- Entry reflection retry calls `generate()` or `regenerate()` for the current entry.
- Report retry calls `refresh()` for the selected weekly/monthly period.
- Export retry repeats the selected export format.
- Notification retry repeats the toggle or time-change operation.
- AI Chat send is single-flight and preserves existing messages.

## Remaining Manual Verification

- Physical Android verification is still required.
- Force-slow AsyncStorage hydration should confirm delayed loaders avoid flicker.
- Force report/reflection failures should confirm cached content remains visible.
- User switching should confirm user-scoped journal, chat, reflection, and report
  data never flashes across accounts.
