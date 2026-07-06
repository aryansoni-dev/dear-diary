# Dynamic Home Reflection Prompts — Manual Test Matrix

The prompt date key changes at local midnight. From 12:00 AM through 4:59 AM, the new calendar date's evening prompt is used.

| ID | Scenario | Local time | Expected period | Expected behavior | Actual | Status |
|---|---|---|---|---|---|---|
| 1 | Fresh morning launch | 5:00–11:59 AM | Morning | One prompt bundle resolves and the morning question appears. | — | Not tested |
| 2 | Reopen during the same morning | Same morning | Morning | The cached morning question is unchanged and no request is repeated. | — | Not tested |
| 3 | Morning-to-afternoon boundary | 11:59 AM–12:00 PM | Afternoon | The card selects the afternoon question from the same bundle. | — | Not tested |
| 4 | Reopen during the same afternoon | 12:00–4:59 PM | Afternoon | The cached afternoon question is unchanged. | — | Not tested |
| 5 | Afternoon-to-evening boundary | 4:59–5:00 PM | Evening | The card selects the evening question from the same bundle. | — | Not tested |
| 6 | Reopen during the same evening | 5:00–11:59 PM | Evening | The cached evening question is unchanged. | — | Not tested |
| 7 | Midnight rollover | 11:59 PM–12:00 AM | Evening | A new date bundle becomes eligible; its evening question is selected. | — | Not tested |
| 8 | Early-morning boundary | 4:59–5:00 AM | Morning | The card changes from evening to morning without polling every second. | — | Not tested |
| 9 | Background and foreground | Any | Current period | Foregrounding recalculates time and reuses a valid cached bundle. | — | Not tested |
| 10 | Process kill and restart | Any | Current period | AsyncStorage restores the same user/date bundle. | — | Not tested |
| 11 | Offline first launch | Any | Current period | A deterministic fallback bundle is persisted and the card stays usable. | — | Not tested |
| 12 | Offline cached launch | Any | Current period | The cached prompt appears with no network request. | — | Not tested |
| 13 | AI endpoint failure | Any | Current period | A fallback bundle appears; no raw error or blank card is shown. | — | Not tested |
| 14 | Sign-out and account switch | Any | Current period | No prior-user prompt flashes; the next user resolves an isolated bundle. | — | Not tested |
| 15 | Narrow Android screen | Any | Current period | The full prompt wraps naturally and the CTA remains visible. | — | Not tested |
| 16 | Large system font | Any | Current period | The card grows naturally with no prompt clipping or ellipsis. | — | Not tested |
| 17 | Prompt card press | Any | Current period | The existing journal editor route opens. | — | Not tested |
| 18 | Prompt passed to editor | Any | Current period | The editor receives exactly the displayed prompt and `ai_reflection` type. | — | Not tested |
| 19 | Dynamic text clipping | Any | Current period | The full question remains readable and available to TalkBack. | — | Not tested |
| 20 | Repeated lifecycle events | Same date | Current period | Rerenders, tab switches, and foreground events do not repeat generation. | — | Not tested |
| 21 | Answer current prompt | Current period | Current period | Saving a non-empty answer hides the card; the next period's unanswered prompt still appears. | — | Not tested |
