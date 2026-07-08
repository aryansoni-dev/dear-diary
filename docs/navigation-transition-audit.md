# DearDiary Navigation Transition Audit

Safe checkpoint:

- Branch: `dev`
- Commit: `1a98f7f002db0eeac5e273a915e71c9bdd749e90`
- Starting worktree: clean
- Baseline checks before navigation edits: `npx tsc --noEmit`, `npm run lint`, `npm run test:reflection-prompts`, and `npm run test:environment` passed.
- Existing route transitions before migration: Expo Router native stack defaults, with `headerShown: false` throughout app route layouts.
- Android/iOS launch and animation behavior were not device-tested in this coding session.

## Route Hierarchy

| Route/group | Current navigator | Parent navigator | Entry method | Presentation | Header | Gesture risk | Proposed transition |
|---|---|---|---|---|---|---|---|
| `app/_layout.tsx` | Premium Blank Stack | Root | File route/deep link | Full screen | Hidden | App Lock/auth privacy | Auth fade default, explicit push for details |
| `/` | Root stack screen | Root | Redirect gate | Full screen | Hidden | Auth redirects | Auth boundary fade |
| `/(onboarding)` | Premium Blank Stack | Root | Redirect/links | Full screen | Hidden | Vertical scroll only | Onboarding push |
| `/(onboarding)/onboarding-screen-*` | Onboarding stack screens | Onboarding | `Link`, `router.replace` for skip/finish | Full screen | Hidden | ScrollView/buttons | Onboarding push, reduced-motion fade |
| `/(auth)` | Premium Blank Stack | Root | Redirect/links | Full screen | Hidden | Text inputs, SSO | Auth fade, gestures disabled |
| `/(auth)/login` | Auth stack screen | Auth | Redirect/link | Full screen | Hidden | Keyboard, SSO modal | Auth fade |
| `/(auth)/signup` | Auth stack screen | Auth | Redirect/link | Full screen | Hidden | Keyboard, verification modal | Auth fade |
| `/(auth)/reset-passwd` | Auth stack screen | Auth | Link | Full screen | Hidden | Keyboard, verification modal | Auth fade |
| `/(tabs)` | Premium Blank Stack | Root | Auth redirect/bottom tab presses | Full screen | Hidden | Tab state/history | Calm tab fade, no horizontal push |
| `/home-tab` | Tab group screen | Tabs | Redirect/bottom tab | Full screen | Hidden | Vertical scroll, cards | Bottom-tab fade |
| `/reflect-tab` | Tab group screen | Tabs | Bottom tab, cards | Full screen | Hidden | Vertical scroll | Bottom-tab fade |
| `/journal-history` | Tab group screen | Tabs | Bottom tab/home | Full screen | Hidden | Search, horizontal chips/calendar | Bottom-tab fade |
| `/insights-tab` | Tab group screen | Tabs | Bottom tab | Full screen | Hidden | Reports links, charts | Bottom-tab fade |
| `/profile-tab` | Tab group screen | Tabs | Bottom tab | Full screen | Hidden | Account deletion modal | Bottom-tab fade |
| `/ai-chat` | Tab group screen | Tabs | Reflect card | Full screen | Hidden | Keyboard, scroll, horizontal suggestions | Bottom-tab fade |
| `/profile-notifications` | Tab group screen | Tabs | Profile settings | Full screen | Hidden | Modal time picker | Bottom-tab fade |
| `/journal-editor` | Tab group screen | Tabs | Prompt/edit redirect | Full screen | Hidden | Keyboard, autosave, horizontal tags | Writing flow, gestures disabled |
| `/journal` | Premium Blank Stack | Root | History/home/editor replace | Full screen | Hidden | Editor state | Writing flow |
| `/journal/new` | Journal stack screen | Journal | Push | Full screen | Hidden | Keyboard, unsaved writing | Writing flow, gestures disabled |
| `/journal/[id]` | Journal stack screen | Journal | Push/replace | Full screen | Hidden | Autosave, tag modal | Writing flow, gestures disabled |
| `/insights/report/[periodType]` | Root stack screen | Root | Link/push | Full screen | Hidden | Long content/charts | Standard push |
| `/achievements` | Root stack screen | Root | Profile link | Full screen | Hidden | Vertical scroll | Standard push |
| `/settings` | Premium Blank Stack | Root | Profile/privacy links | Full screen | Hidden | PIN flows | Standard default |
| `/settings/privacy` | Settings stack screen | Settings | Push | Full screen | Hidden | PIN input for sensitive actions | Standard push |
| `/settings/app-lock/setup` | Settings stack screen | Settings | Push/replace | Full screen | Hidden | PIN setup | Sensitive fade, gestures disabled |
| `/settings/app-lock/change-pin` | Settings stack screen | Settings | Push/replace | Full screen | Hidden | PIN change | Sensitive fade, gestures disabled |
| `/legal/privacy-policy` | Root stack screen | Root | Auth/settings links | Full screen | Hidden | Long text | Standard push |
| `/legal/terms` | Root stack screen | Root | Auth/settings links | Full screen | Hidden | Long text | Standard push |
| `/sso` and `/sso-callback` | Root stack screens | Root | Deep link/SSO redirect | Full screen | Hidden | Auth callback | Sensitive fade |

## Navigation Assumptions

- Native headers are not used by visible screens; route files repeatedly set `headerShown: false`.
- No route-level `presentation: "modal"`, `transparentModal`, `formSheet`, or native large-title options were found.
- No `usePreventRemove` or `beforeRemove` usage was found.
- `router.replace` is used for auth completion, onboarding skip/finish, editor save/delete, app-lock setup/change, and some fallback back actions.
- `router.canGoBack()` fallbacks exist in legal, achievements, privacy/settings, AI chat, notification settings, and profile.
- App Lock is a gate around the navigator. It can render an opaque lock screen over previously opened private content; transition routes must not make that overlay dismissible.
- Bottom navigation is implemented as the existing custom `BottomTabBar` with `router.push`; this task does not change its visual design or route names.

## Dependency Compatibility

- Installed requested library: `react-native-screen-transitions@3.8.0`.
- Existing resolved packages after install include `expo@54.0.35`, `expo-router@6.0.24`, `react-native@0.81.5`, `react-native-reanimated@4.1.7`, `react-native-worklets@0.5.1`, `react-native-gesture-handler@2.28.0`, `react-native-screens@4.16.0`, `react-native-safe-area-context@5.6.0`, `@react-navigation/native@7.2.5`, and `@react-navigation/elements@2.9.19`.
- `@react-navigation/native-stack` is not a direct dependency and is not needed for the selected Blank Stack strategy.
- Babel uses Expo's internal preset. Metro uses Expo default config plus NativeWind and an existing Lottie resolver.
- `app.json` has New Architecture enabled, Android edge-to-edge enabled, and Android predictive back disabled.

## Exceptions And Risks

- Current runtime layouts use Expo Router native `Stack` with centralized native
  transition presets because Blank Stack testing in Expo Go caused visible scroll
  and back-navigation lag.
- Device animation parity is pending manual Android and iOS testing.
- Editor routes intentionally disable gesture dismissal to avoid unsafe keyboard/autosave interactions.
- App Lock is not a route; it remains an opaque gate outside the navigator transition system.
