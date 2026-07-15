| Component/screen | Interactive element | Current testID? | Current accessibility label? | Required change | Risk |
|---|---|---|---|---|---|
| AuthScreen | login/signup email, password, name inputs | Generic auth/input IDs existed | Partial | Replaced with mode-specific input IDs and hints | Low |
| AuthScreen | submit, forgot password, footer auth links | Generic submit ID existed | Partial | Added `login-*`/`signup-*` IDs and button labels | Low |
| AuthScreen | Google/Apple SSO buttons and loading indicators | No | Partial | Added SSO button IDs and shared loading indicator ID | Low |
| Verification/Sso | SSO callback loading | No | Visible text only | Added `sso-callback-loading` | Low |
| Onboarding screens/header | next/back/skip/complete/page indicator | No | Partial | Added stable onboarding IDs | Low |
| BottomTabBar | tab buttons | No | No explicit labels | Added `tab-*-button` and tab labels | Low |
| AnimatedIconButton | reusable icon button | No passthrough | Required label prop | Added optional test/accessibility hint passthrough | Low |
| ScreenEmptyState | empty state and actions | No passthrough | Action labels | Added optional testID props for state/actions | Low |
| HomeScreen | screen, prompt, streak, intention, recent entries | No | Partial | Added high-value card/action IDs | Low |
| HomeMoodCheckInCard/MoodSpectrumSelector | mood card, mood buttons, save/retry | No | Yes | Added screen-passed ID prefix and action IDs | Low |
| JournalEditorScreen | title/body, save/delete/back, mood/tag controls | No | Partial | Added editor control IDs and hints | Medium: editor focus/keyboard must stay intact |
| TagInputModal | tag input and submit/cancel | No passthrough | Partial | Added optional screen-passed IDs | Low |
| EntryAIReflectionCard | generate/regenerate/loading/error/sections | Some renderer IDs only | Partial | Added reflection action/state/section IDs | Low |
| JournalHistoryScreen | search, filters, list, empty state, entry cards | No | Partial | Added history IDs using entry IDs for dynamic cards | Low |
| JournalCalendarView | month controls, today, day buttons | No | Yes | Added calendar control/day IDs using date keys | Low |
| AIChatScreen | screen, message list, input, send, clear, jump, states | Assistant messages had dynamic IDs | Partial | Added composer/action/state IDs | Medium: keyboard/scroll behavior must remain unchanged |
| InsightsScreen | screen, report cards, upgrade/open buttons | No | Partial | Added insights/report card IDs | Low |
| ReportScreenStates/report route | loading/error/retry/generate/regenerate/content | No | Partial | Added report state/action/content IDs | Low |
| PaywallScreen/PlanCard | plans, continue, restore, maybe later, legal links, loading/error | No | Partial | Added plan/action/state IDs via props | Medium: purchase flow must remain unchanged |
| ProfileScreen/MenuSection | menu rows, sign out, account deletion card | No | Partial | Added data-backed row IDs and deletion controls | Medium: deletion confirmation must remain unchanged |
| PrivacySettingsScreen/AppLockSettingsComponents | settings rows and legal links | No | Partial | Added settings row passthrough IDs | Low |
| AppLockScreen/PinInput/BiometricLockSwitch/setup | PIN, unlock, biometric, setup/confirm PIN, enable | No passthrough | Yes | Added typed passthrough IDs and screen-specific lock IDs | Medium: App Lock privacy/focus must remain intact |
| NotificationSettingsScreen | enable switch, reminder rows, picker actions/status | No | Partial | Added notification/reminder IDs | Low |

Notes:
- Dynamic journal entry IDs use existing opaque entry IDs only.
- Tag/theme dynamic IDs use normalized visible chip text and never journal body/title content.
- No new wrappers were added around journal editor or chat inputs.
- No separate autosave indicator exists in the current editor UI; the existing save/sync button label is exposed as `journal-editor-sync-status`.
