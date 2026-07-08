# DearDiary Navigation Transition System

## Goals

DearDiary uses one centralized route-motion system for stack navigation. The motion should feel calm, short, and consistent across Android and iOS without platform-specific transition branches.

## Library Version

`react-native-screen-transitions@3.8.0`

## Navigator Strategy

- Expo Router remains the routing system.
- Runtime route layouts use Expo Router's native `Stack` with centralized native-stack transition options for performance.
- A reusable `PremiumStack` prototype exists with the library's Blank Stack and Expo Router `withLayoutContext`, but it is not mounted in app layouts after Expo Go testing showed scroll and back-navigation lag.
- The existing bottom-tab UI remains unchanged.
- No Component Stack, shared-element transitions, or native-stack adapter was introduced.

## Expo Router Integration

The reusable Blank Stack prototype lives in `navigation/premium-stack.tsx`. Runtime transition presets live in `navigation/transitions.ts` and use native-stack options only. Route categories live in `navigation/route-transition-map.ts` so layouts import semantic categories instead of creating ad hoc animation objects.

## Transition Categories

| Route category | Transition |
|---|---|
| Standard detail | `nativePremiumPushTransition` |
| Writing flow | `nativePremiumWritingTransition` |
| Auth boundary | `nativePremiumFadeTransition` |
| Onboarding navigation | `nativePremiumOnboardingTransition` |
| Sensitive lock/reset/SSO | `nativePremiumFadeTransition` |
| Bottom tab switch | `nativePremiumTabTransition` |
| Unknown route | Standard detail category |

## Motion Tokens

Motion constants are centralized in `navigation/transitions.ts`. Standard push and writing flows use native-stack `ios_from_right` motion. Auth, sensitive, and reduced-motion routes use short native fades. Bottom-tab route changes use no stack animation to preserve tab responsiveness.

## Gesture Policy

- Standard detail and onboarding routes enable native horizontal back gestures where supported.
- Editor, auth, SSO, app-lock PIN, tab, and reduced-motion routes disable gestures.
- Full-screen tab route changes use no stack animation so tab taps stay instant.

## Reduced-Motion Behavior

`hooks/useReducedMotionPreference.ts` reads React Native's system reduced-motion setting. When enabled, all semantic categories resolve to `nativePremiumReducedMotionTransition`: a short native fade with no gesture dismissal.

## Bottom-Tab Behavior

The existing custom tab bar and route names are preserved. The transition system does not replace tabs with a custom navigator and does not animate tab switches as horizontal pushes.

## Auth And App Lock Behavior

Auth and onboarding redirects continue to use existing `Redirect` and `router.replace` logic. App Lock remains outside the navigator as a privacy gate; locked/private content is not made swipe-dismissable.

## Deep-Link Behavior

Expo Router file routes and typed route params are preserved. SSO routes are explicitly registered on the root premium stack with sensitive fade transitions.

## Platform Exceptions

No ordinary route transition uses `Platform.OS` branching. Existing project code still contains unrelated platform handling for keyboard behavior and biometric labels.

## Testing Status

Automated checks passed after implementation:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run test:reflection-prompts`
- `npm run test:environment`
- `npm run test:navigation-transitions`

Manual Android and iOS animation parity testing is still required.

After Expo Go testing on Android exposed lag in tab scrolling and back navigation,
the app layouts were returned to Expo Router native `Stack` and then given
centralized native-stack transition presets. Keep the Blank Stack prototype out
of runtime until a smoother strategy is tested on-device.

## Known Limitations

- Physical device smoothness, cancelled gestures, Android hardware back, iOS edge-swipe behavior, and release-build parity were not verified in this session.
- The app's bottom-tab system is a custom route stack; this migration preserves it and uses calm fades for tab route changes.

## Upgrade Guidance

Keep `react-native-screen-transitions` upgrades deliberate. After upgrading, inspect the Blank Stack TypeScript API, rerun the automated checks, and repeat the manual matrix in `docs/premium-screen-transitions-test.md`.
