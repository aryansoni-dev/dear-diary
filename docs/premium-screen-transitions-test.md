# Premium Screen Transitions Test Matrix

| ID | Platform | From | To | Action | Expected transition | Gesture | Actual | Status |
|---|---|---|---|---|---|---|---|---|
| A1 | Android physical | Cold launch | Redirect target | Open app | Splash/gate, no initial stack animation | None | Not run | Not tested |
| A2 | Android physical | Onboarding 1 | Onboarding 2 | Continue | Gentle horizontal onboarding push | Edge back only | Not run | Not tested |
| A3 | Android physical | Login | Home | Sign in | Auth fade, no private screen in back | None | Not run | Not tested |
| A4 | Android physical | Bottom tab | Another tab | Tap tab | Short fade, no horizontal push | None | Not run | Not tested |
| A5 | Android physical | History | Journal entry | Open entry | Writing transition | Disabled | Not run | Not tested |
| A6 | Android physical | Journal editor | History | Save/delete/back | Writing reverse or replace, no data loss | Disabled | Not run | Not tested |
| A7 | Android physical | Insights | Report | Open report | Standard push | Edge back | Not run | Not tested |
| A8 | Android physical | Settings | Privacy | Push | Standard push | Edge back | Not run | Not tested |
| A9 | Android physical | Privacy | App lock setup | Push | Sensitive fade | Disabled | Not run | Not tested |
| A10 | Android physical | Any pushed route | Previous route | Hardware back | Matching reverse transition | Hardware | Not run | Not tested |
| A11 | Android physical | Locked app | Protected route | Unlock | No private flash before unlock | None | Not run | Not tested |
| A12 | Android physical | SSO provider | `/sso` | Deep link | Sensitive fade/minimal callback | None | Not run | Not tested |
| A13 | Android physical | Reduced motion enabled | Any route | Navigate | Short fade, no translation/scale | Disabled | Not run | Not tested |
| I1 | iOS simulator | Cold launch | Redirect target | Open app | Splash/gate, no initial stack animation | None | Not run | Not tested |
| I2 | iOS simulator | Onboarding 1 | Onboarding 2 | Continue | Gentle horizontal onboarding push | Edge back only | Not run | Not tested |
| I3 | iOS simulator | Login | Home | Sign in | Auth fade, no private screen in back | None | Not run | Not tested |
| I4 | iOS simulator | Bottom tab | Another tab | Tap tab | Short fade, no horizontal push | None | Not run | Not tested |
| I5 | iOS simulator | Report | Insights | Edge-swipe back | Standard reverse, cancel returns cleanly | Edge | Not run | Not tested |
| I6 | iOS simulator | Journal editor | Previous | Back with keyboard | No keyboard artifact, no data loss | Disabled | Not run | Not tested |
| I7 | iOS simulator | AI Chat | Reflect | Back | Calm reverse/fade, scroll remains usable | None | Not run | Not tested |
| I8 | iOS simulator | Locked app | Protected route | Unlock | No stale private flash | None | Not run | Not tested |
| I9 | iOS simulator | Reduced motion enabled | Any route | Navigate | Short fade, no translation/scale | Disabled | Not run | Not tested |

## Parity Comparison

| Property | Android | iOS | Result |
|---|---|---|---|
| Direction | Not tested | Not tested | Not tested |
| Incoming distance | Not tested | Not tested | Not tested |
| Underlying movement | Not tested | Not tested | Not tested |
| Opacity | Not tested | Not tested | Not tested |
| Scale | Not tested | Not tested | Not tested |
| Backdrop | Not tested | Not tested | Not tested |
| Open response | Not tested | Not tested | Not tested |
| Close response | Not tested | Not tested | Not tested |
| Gesture direction | Not tested | Not tested | Not tested |
| Cancel behavior | Not tested | Not tested | Not tested |
| Completion behavior | Not tested | Not tested | Not tested |

## Regression Checklist

- Onboarding: Not tested
- Authentication: Not tested
- SSO and deep links: Not tested
- Session restoration: Not tested
- Home, mood logging, and daily prompt flows: Not tested
- Journal creation/editing/autosave/deletion: Not tested
- History search, filters, and calendar: Not tested
- Insights and reports: Not tested
- AI Chat and long AI content: Not tested
- Achievements and notifications: Not tested
- Profile, settings, legal screens, and account deletion: Not tested
- App Lock and privacy cover behavior: Not tested
- Offline/sync behavior: Not tested
- Preview release build without Metro: Not tested
