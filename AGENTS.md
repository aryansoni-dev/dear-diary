You are an expert React Native and Expo engineer helping me build
DearDiary.
Write clean, simple, maintainable code. Prioritize clarity over
unnecessary abstraction.
Think like a senior mobile developer.

---

## Project Overview

We are building DearDiary, an AI-powered journaling companion that helps users reflect, understand their emotions, and build a mindful self-awareness practice through intelligent insights and guided reflection.

The app includes:

1. ✍️ Smart Journaling - Create daily journal entries - Rich text editor with mood tagging - Auto-save drafts - Add titles, tags, and categories - Journal history and search - Streak tracking
2. 🤖 AI Reflection Assistant : - AI-generated reflection prompts - Follow-up questions based on entries - Writing guidance when users feel stuck - End-of-entry reflection summaries - Personalized journaling suggestions
3. 😊 Mood Tracking : - Mood selection before/after journaling - Daily emotional check-ins - Emotion intensity tracking - Mood timeline visualization - Emotional pattern detection
4. 📊 AI Insights : - Weekly emotional summaries - Monthly reflection reports - Frequently occurring emotions - Recurring themes and topics - Positive vs negative sentiment trends - Growth and habit insights
5. 💬 AI Journal Chat : - Chat with your journal history - Ask questions like: - "What stressed me most this month?" - "When was I happiest?" - "What goals do I keep mentioning?" - AI-powered memory retrieval - Context-aware conversations
6. 📅 Reflection Calendar : - Daily view - Weekly view - Monthly view - Mood heatmap calendar - Journal activity overview
7. 🎯 Guided Reflection : - Gratitude journaling - Goal reflection - Weekly review templates - Monthly review templates - Self-discovery exercises
8. 🔍 Search & Discover - Full-text search - Filter by mood - Filter by tags - Filter by date range - AI-powered semantic search
9. 🔥 Streaks & Habit Building : - Daily journaling streaks - Weekly consistency score - Reflection milestones - Journaling achievements
10. 👤 Personal Profile : - Reflection statistics - Mood statistics - Journal count - Streak information - Personalized AI recommendations
11. 🔐 Privacy & Security : - Local-first architecture - End-to-end encrypted journal entries - Biometric authentication - PIN protection - Export journal data

Keep the implementation simple and readable.

---

## Tech Stack

- Expo

- React Native

- TypeScript

- Expo Router

- NativeWind

- Zustand

- AsyncStorage

- Clerk for authentication
  Do not introduce new major libraries unless there is a strong reason.
  Ask before installing anything new.

---

## Development Philosophy

Build feature by feature.
For every feature:

1. Read this file first.

2. Keep the implementation simple.

3. Avoid overengineering.

4. Prefer readable code over clever code.

5. Build the smallest useful version first.

6. Refactor only when repetition appears.

---

## Decision Making

If something is unclear or could be improved, suggest a better
approach. If a new library would significantly help, recommend it,
explain why, and ask before adding it.
Do not install new libraries without approval.

---

## Architecture

Use this folder structure:

```
aapp/
  (onboarding)/
  (auth)/
  (tabs)/
components/
constants/
data/
hooks/
lib/
store/
types/
assets/
```

**(tabs)/** is for all the main screens (Home, Reflect, Journal)
**UI/** contains the designs for all the screens both in png and exported code.
**app/** is for routes and screens only. Screens compose components and
call hooks or stores. They should not contain large reusable UI blocks
or business logic.
**components/** is for reusable UI. Create a component when it is
reused in multiple places, when it makes a screen easier to read, or
when it represents a clear UI concept. Examples for this app:
MoodSelector, JournalCard, GradientBackground, PromptCard, InsightCard,
CalendarDay, EmptyState, PrimaryButton, ScreenHeader, BottomSheetModal, etc. Do not create components too early.
**data/** holds hardcoded content. Keep it typed.
**store/** holds Zustand stores. Examples of state to keep here:
journalEntries, selectedMood, draftEntry, userPreferences, streakCount,
themeMode, onboardingCompleted, etc. Persist with AsyncStorage when needed.
**lib/** holds external service helpers (clerk.ts, api.ts, cn.ts).
Never expose secret keys here.

---

## UI Rules

When implementing UI from screenshots or generated designs:

- First identify reusable spacing, colors, gradients, and typography.
- Add them to constants or global styles.
- Do not hardcode random color values repeatedly.
- Match layout, spacing, padding, font sizes, font hierarchy, colors,
  border radius, shadows, alignment, and proportions.
- Replicate the provided design exactly.
- Do not approximate. Do not simplify unless explicitly asked.

---

## AI Feature Rules

AI calls must never happen directly from the mobile client using secret keys.
Use backend/server routes for:

- generating journal prompts
- summarizing entries
- generating insights
- chatting with journal history

For MVP, AI features can use mocked responses first.
Build the UI and data flow before connecting real AI APIs.

---

## Styling Rules

Use NativeWind classes. Do not use StyleSheet unless it is not possible
to style with className.
Use the NativeWind version installed in this project. Check
package.json. Do not upgrade without approval.
Reuse class patterns through utilities in global.css.

### Style Exception List

Use StyleSheet or inline styles for:

- SafeAreaView (className not supported)

- KeyboardAvoidingView (behavior props)

- Modal (visible, transparent props)

- Animated.View (animated style values)

- Dynamic styles calculated at runtime

- Platform specific styles

- Pressable or TouchableOpacity pressed states

- Shadows (different per platform)
  Everywhere else, use NativeWind.

- Only use inline css styling when truly necessary, otherwise use native-wind classes.

---

## Image Rule

Use centralized image imports.

1. Check if constants/images.ts exists.

2. If not, create it.

3. Import all app images there.

4. Use them through the centralized object.

```ts
import mascot from "@/assets/images/mascot.png";
export const images = {
  mascot,
};
```

```tsx
<Image source={images.mascot} />
```

## Do not import image assets directly inside screens or components.

## State Management

- Zustand for global client state.

- Local state for temporary UI state.

- AsyncStorage for persistence.

---

## TypeScript

- Strict mode.

- No `any`.

- Keep types simple and readable.

---

## Feature Implementation

When building a feature:

1. Read this file first.

2. Identify the files to change.

3. Keep changes focused.

4. Do not rewrite unrelated code.

5. Follow existing patterns.

6. Make sure the feature works end to end.

7. Fix lint and type errors before finishing.

8. Don't run the 'npx expo start on your own.

---

## Secrets

- Never expose secret keys in client code.

- Use server routes for tokens, AI calls, and any external API access.

---

## Authentication

## Use Clerk. Do not build custom auth.

## Communication

## Be concise. Explain what changed and how to test it.

## Final Reminder

Before every feature:

- Read this file.

- Follow it strictly.

- Build clean, simple code.

- Replicate UI exactly when designs are provided.

- Keep implementation simple, readable, and focused.

- Do not install new libraries without approval.

- Don't change the design of the Nav, only add the routing functionality.

- Keep 'leading-6' in all components, and fix if you find any un-matching ones.

- If you see any svgs in the attached design look for them in the '/assets' folder. If we don't have it, try to create them yourself like you created the Google icon in the login screens.

- Keep the text sizes like : headings, subheadings, body text, etc consistent on each screen.
