# DearDiary Test PRD

## Product overview

DearDiary is a local-first AI-powered journaling application built with React Native, Expo Router, TypeScript, Clerk, Supabase, Zustand, and AsyncStorage.

The application enables users to create private journal entries, log moods, receive AI reflections, view AI-generated insights and reports, and synchronize their data across sessions.

## Critical privacy requirements

- Data must be isolated by authenticated Clerk user.
- One user must never see another user’s entries, moods, AI messages, reports, or settings.
- No private content may flash during authentication, account switching, or App Lock.
- Account deletion must remove the Clerk account, Supabase data, local storage, SecureStore data, and scheduled reminders.
- Tests must use disposable accounts and non-sensitive content.

## Critical user flows

1. First launch and onboarding
2. Sign up and verification
3. Login and session restoration
4. Home dashboard
5. Mood logging
6. Dynamic morning, afternoon, and evening reflection prompts
7. Journal creation, editing, autosave, deletion, and restoration
8. Entry tags and AI-generated themes
9. Journal History, search, filtering, and Calendar
10. AI Chat
11. Per-entry AI reflection
12. Weekly and monthly AI reports
13. Insights and achievements
14. Offline creation and reconnect synchronization
15. App Lock with PIN and biometrics
16. Local reminder creation, editing, and cancellation
17. Export, backup, and restore where implemented
18. Sign out and account switching
19. Complete account deletion
20. Privacy Policy and Terms

## AI content requirements

- Long AI responses must never be visually clipped.
- Markdown paragraphs, headings, lists, links, blockquotes, and code blocks must remain readable.
- Streaming must not drop or overwrite chunks.
- Failed generation must preserve previous successful content.
- AI-generated themes may become entry tags only when the entry still has no tags.
- Dynamic daily prompts must remain stable for the same user, date, and time period.

## Navigation requirements

- All Expo Router routes must remain reachable.
- Back navigation must work.
- Bottom-tab state must remain stable.
- Deep links must not bypass authentication or App Lock.
- Premium screen transitions must not duplicate routes or lose state.
- Transition behavior must not clip dynamic content or interfere with gestures.

## Reliability requirements

- Offline entries must persist locally.
- Reconnection must not create duplicate records.
- App restart must preserve data.
- Failed network requests must show sanitized errors.
- Loading, empty, partial, offline, and retry states must remain usable.
- No raw Clerk, Supabase, or AI-provider errors may be exposed.

## Accessibility requirements

- Large fonts must not clip text.
- Interactive controls must have accessible labels.
- AI text must remain readable by screen readers.
- Reduced-motion preferences must be respected.
- Core navigation must not depend only on gestures.

## Test restrictions

- Use Preview services only.
- Do not use production accounts or data.
- Do not expose or record secrets.
- Do not modify application code automatically before the initial report is reviewed.
