# Dynamic AI Text Test Matrix

| ID | Surface | Content type | Length | Device | Font size | Expected | Actual | Status |
|---|---|---|---:|---|---|---|---|---|
| CHAT-01 | AI Chat | Short prose | 1 paragraph | Physical Android | Default | Full selectable text | Device required | Blocked |
| CHAT-02 | AI Chat | Long prose | 2,000+ | Physical Android | Default | Final line reachable | Device required | Blocked |
| CHAT-03 | AI Chat | Very long prose | 10,000+ | Physical Android | Large | Full response grows naturally | Device required | Blocked |
| CHAT-04 | AI Chat | Markdown and lists | Mixed | Physical Android | Large | Structure wraps without clipping | Device required | Blocked |
| CHAT-05 | AI Chat | Code and table | Wide | Physical Android | Default | Only wide blocks scroll horizontally | Device required | Blocked |
| CHAT-06 | AI Chat | Unicode and Hindi | Mixed | Physical Android | Maximum practical | Glyphs and emoji remain visible | Device required | Blocked |
| CHAT-07 | AI Chat | Long URL/token | 100+ token | Narrow Android | Large | Page width remains stable | Device required | Blocked |
| CHAT-08 | AI Chat | Scroll behavior | Multiple long messages | Physical Android | Default | Older reading position is not forced down | Device required | Blocked |
| CHAT-09 | AI Chat | Restart/offline restore | 10,000+ | Physical Android | Default | Restored source matches saved source | Device required | Blocked |
| REF-01 | Entry reflection | Long structured reflection | 2,000+ total | Physical Android | Large | Parent editor scroll reaches final line | Device required | Blocked |
| REF-02 | Entry reflection | Markdown/Unicode | Mixed | Narrow Android | Maximum practical | Complete readable sections | Device required | Blocked |
| REF-03 | Entry reflection | Failed regeneration | Existing long result | Physical Android | Default | Previous result remains visible | Device required | Blocked |
| REPORT-01 | Weekly report | Every narrative section | 10,000+ total | Physical Android | Large | Final section and line reachable | Device required | Blocked |
| REPORT-02 | Monthly report | Charts plus long narrative | 10,000+ total | Narrow Android | Maximum practical | Chart height does not constrain prose | Device required | Blocked |
| REPORT-03 | Report | Cached/offline restore | 10,000+ total | Physical Android | Default | Restored report matches saved source | Device required | Blocked |
| A11Y-01 | All AI surfaces | TalkBack and selection | Mixed | Physical Android | Large | Full content exposed and selectable | Device required | Blocked |
| STATIC-01 | Shared parser/helpers | Plain, Markdown, code, table, Unicode, long tokens, chunks | 15,733 | Repository checks | N/A | No content loss in pure assertions | Assertions passed | Passed |
| STATIC-02 | Application | TypeScript strict check | N/A | Repository checks | N/A | No type errors | `npx tsc --noEmit` passed | Passed |
| STATIC-03 | Application | Expo lint | N/A | Repository checks | N/A | No lint errors | `npm run lint` passed | Passed |
| STATIC-04 | Edge Functions | ESLint syntax/static pass | N/A | Repository checks | N/A | No lint errors | Three changed functions passed | Passed |
| STATIC-05 | Report parser | Long fields, 10-item array, empty optionals, fenced/wrapped JSON | 1,000+ | Repository checks | N/A | Preserve all content and return safe invalid-field reasons | Assertions passed | Passed |
| HOSTED-01 | Report Edge Function | Invalid authentication probe | N/A | Supabase version 7 | N/A | Reachable and reject malformed JWT | HTTP 401 `invalid_jwt` | Passed |
