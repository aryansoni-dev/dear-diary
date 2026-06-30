# Dynamic AI Text Rendering Audit

## Affected surfaces

| Surface | Component | Data source | Renderer | Primary vertical scroll | Clipping or truncation risk |
|---|---|---|---|---|---|
| AI Chat assistant messages | `components/ai-chat/ai-chat-screen.tsx` | `journal-ai-chat` or local fallback → Zustand/AsyncStorage | Plain React Native `Text` | Chat `ScrollView` | No Markdown structure, assistant selection disabled, long tokens unsafe, unconditional scroll-to-end |
| AI Chat user messages | `components/ai-chat/ai-chat-screen.tsx` | Local input → Zustand/AsyncStorage | Plain React Native `Text` | Chat `ScrollView` | Long tokens unsafe |
| Entry AI reflection | `components/journal-editor/entry-ai-reflection-card.tsx` | `reflect-on-entry` → Supabase `text` columns → Zustand/AsyncStorage | Separate plain `Text` fields | Journal editor `ScrollView` | Backend prose fields truncated to 220 characters and line breaks collapsed |
| Weekly report | `app/insights/report/[periodType].tsx` and report components | `generate-insight-report` → Supabase `jsonb` → Zustand/AsyncStorage | Separate plain `Text` fields | Report `ScrollView` | Backend narrative strings and arrays truncated; dynamic prose disables font scaling and selection |
| Monthly report | `app/insights/report/[periodType].tsx` and report components | `generate-insight-report` → Supabase `jsonb` → Zustand/AsyncStorage | Separate plain `Text` fields | Report `ScrollView` | Same report risks as weekly reports |
| Insights summary cards | `components/insights/insights-screen.tsx` | Cached weekly/monthly report | Plain React Native `Text` | Insights `ScrollView` | Overview reduced with an arbitrary 180-character slice; no structured rendering |
| Recurring AI themes | `components/insights/RecurringThemesCard.tsx` and report charts | Report analytics | Plain React Native `Text` | Owning screen `ScrollView` | Font scaling disabled in report variants; long labels need flexible wrapping |
| AI errors and retained-result notices | Reflection/report/chat state components | Service errors and cached state | Plain React Native `Text` | Owning screen scroll | Natural height already used, but important error text is not consistently selectable |

## Data truncation risks

- `reflect-on-entry` truncated every generated prose field to 220 characters and collapsed all whitespace.
- `generate-insight-report` truncated overview, emotional journey, focus, prompt, and every narrative array item; it also sliced generated arrays to fixed item counts.
- `journal-ai-chat` did not inspect `finish_reason`, so a provider response ending because of its output limit could be presented as complete.
- Chat history intentionally limits context sent back to the model. This does not mutate or truncate the stored/rendered message.
- Entry and report source material is intentionally bounded for provider context. Those context limits are documented by the functions and are distinct from truncating generated output.

## Visual clipping risks

- The chat calls `scrollToEnd()` after every content-size change, forcing a reader away from older content as the document changes height.
- Assistant chat text explicitly disables selection.
- AI surfaces use separate one-off text styles and have no safe handling for long URLs or unbroken tokens.
- Report narrative text opts out of system font scaling with `allowFontScaling={false}` and `maxFontSizeMultiplier={1}`.
- No full-response surface currently has a fixed prose height, `numberOfLines`, or `ellipsizeMode`. Fixed chart and composer heights are intentional and are not prose containers.

## Markdown rendering

No Markdown library is installed. AI output is currently displayed as raw plain text, so headings, lists, blockquotes, links, inline code, code fences, and tables have no dedicated layout behavior.

## Chat streaming

The current chat implementation is non-streaming. It performs one Supabase Edge Function request and stores one complete assistant message. Streaming chunk loss, stale chunk assembly, and streaming memoization defects are therefore not applicable to the current code. The chat still needs variable-height-safe scrolling behavior for long non-streamed messages and future growth.

## Variable-height lists

Chat uses a single `ScrollView`, not `FlatList`; there is no `getItemLayout`, `removeClippedSubviews`, or fixed message measurement. Message keys use stable stored IDs. The primary defect is forced scrolling on every content-size change.

## Font metrics

Chat and reflection body styles use `includeFontPadding: true`, which is safe for Android accents, emoji, and mixed scripts. Report narrative styles also include font padding but disable font scaling. Dynamic prose should retain safe padding and allow system scaling with line heights that can grow naturally.

## Long-token handling

No presentation-only safe-break helper exists. Long raw URLs and unusually long unbroken tokens can overflow narrow Android layouts. Stored source strings must remain unchanged while display text receives safe break opportunities.

## Accessibility

- Assistant chat text is currently not selectable.
- Report narrative and AI insight text is not selectable.
- Report narrative content opts out of user font scaling.
- The existing screen-level scroll owners and App Lock boundary remain appropriate and must not be changed.

## Confirmed root causes

| ID | Surface | Symptom | Root cause | Data complete? | Fix | Status |
|---|---|---|---|---:|---|---|
| CHAT-01 | AI Chat | Reader is forced to the latest message after remeasurement | Unconditional `scrollToEnd` in `onContentSizeChange` | Yes | Follow only while already near bottom | Retest required |
| CHAT-02 | AI Chat | Markdown is raw and long tokens can overflow | One plain `Text` renderer with no block handling | Yes | Shared natural-height AI renderer | Retest required |
| CHAT-03 | AI Chat | Provider-limit completion can look complete | `finish_reason` ignored | No | Preserve and label partial content when output limit is reached | Fixed |
| REF-01 | Entry reflection | Generated prose ends early | 220-character output sanitizer and prompt restriction | No | Preserve complete validated strings | Fixed |
| REF-02 | Entry reflection | Paragraph and Markdown structure disappears | Whitespace collapsed with `replace(/\\s+/g, " ")` | No | Trim boundaries only; preserve internal whitespace | Fixed |
| REPORT-01 | Weekly/monthly reports | Narrative fields and lists end early | Output string truncation and fixed array slicing | No | Preserve every valid generated field and item | Fixed |
| REPORT-02 | Weekly/monthly reports | Large system text is unavailable | Font scaling disabled on dynamic narrative | Yes | Shared scaling, selectable renderer | Retest required |
| REPORT-03 | Weekly/monthly reports | Generation returns `invalid_ai_response` with HTTP 502 | Deployed parser truncated required fields and then rejected cuts ending in connector words or punctuation | No report saved | Parse without output truncation, normalize empty optional fields, recover wrapped JSON, retry malformed JSON once | Fixed |
| INSIGHT-01 | AI summary card | Overview is shortened mid-thought | 180-character compact-card slice | No in card | Keep a complete first-sentence summary without character slicing; full report remains linked | Fixed |
| DB-01 | Reflection/report persistence | Possible database clipping | Audited schemas use PostgreSQL `text` and `jsonb`, with no `varchar` cap | Yes | No migration required | Fixed |
| STREAM-01 | AI Chat | Chunk loss or stale assembly | No streaming path exists | N/A | Document as not applicable | Fixed |

## Fixes implemented

- Added a shared native AI response renderer for chat, reflection, report, and insight variants.
- Added natural-height paragraphs, headings, lists, blockquotes, inline emphasis/code, safe links, code fences, and table fallback rendering.
- Code and table blocks own horizontal scrolling only; the screen remains the sole vertical scroll owner.
- Added display-only safe break opportunities for long URLs and unbroken tokens without mutating stored source strings.
- Added selectable text, safe Android font padding, system font scaling, and a complete plain-text rendering fallback.
- Replaced unconditional chat auto-scroll with near-bottom tracking and a `Jump to latest` action.
- Added explicit partial chat-response persistence and labeling when the provider reports `finish_reason: length`.
- Removed reflection prose character truncation, output array slicing, and internal whitespace collapse.
- Removed report narrative character truncation and fixed output-array slicing; invalid generated arrays now reject the report instead of silently dropping items.
- Replaced the report parser that could reject its own truncated output. Long required fields and complete arrays are preserved, empty optional strings normalize to `null`, fenced/wrapped JSON is recovered, and malformed responses receive one schema-correction retry.
- Added safe parser diagnostics containing only the attempt, character count, and invalid field reason—never report or journal text.
- Removed the insight-card 180-character slice. The dashboard intentionally uses the first complete sentence while the existing report route exposes the complete report.
- Added development-only character-count diagnostics for validated, stored, and rendered source values. Server functions log counts and finish reasons without logging private text.
- Confirmed reflection persistence uses PostgreSQL `text` and reports use `jsonb`; no database migration is needed.
- Added long prose, very-long prose, Markdown, code, table, Unicode/Hindi, long-token, report, and irregular-chunk fixtures plus pure rendering-helper assertions.
- Deployed `generate-insight-report` version 7 with `verify_jwt: false`, matching the project’s Clerk third-party authentication architecture.

## Intentional remaining summaries and limits

- The Insights dashboard shows one complete overview sentence and links to the existing full report. It no longer cuts that sentence by character count.
- Compact analytics cards show top themes or first report items by design; full narrative arrays remain available on the report detail screen.
- Chat history, journal entries, and report source entries are bounded only when constructing provider input context. Stored journal data and generated response output are not modified by those context limits.
- Local fallback search results use deliberate journal-entry previews. They do not truncate a stored assistant response after generation.

## Remaining limitations

- Physical Android, TalkBack, lifecycle, orientation, and system-font matrix testing require a device and cannot be claimed from this repository-only environment.
- Live provider, Supabase persistence, backgrounding, process-kill, and account-switch tests were not run in this repository-only pass.
- Runtime scroll and parse performance on 25,000-character documents still needs device profiling. Pure parsing and integrity assertions passed with a 15,733-character fixture.
- Provider context limits remain necessary to fit model input windows. They affect analysis source breadth, not storage or rendering of generated output, and are surfaced through existing data-quality metadata where applicable.
