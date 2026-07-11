# AI Reflection Theme Tags Test Matrix

| ID | Scenario | Initial tags | AI themes | Expected final tags | Actual | Status |
|---|---|---|---|---|---|---|
| 1 | Untagged entry + successful reflection with two themes | none | productivity, accomplishment | productivity, accomplishment | Not run | Not tested |
| 2 | Entry with existing tag + successful reflection | college | productivity, accomplishment | college, productivity, accomplishment | Not run | Not tested |
| 3 | Entry with duplicate existing theme tag | productivity | productivity, accomplishment | productivity, accomplishment | Not run | Not tested |
| 4 | Reflection returns no themes | college | none | college | Not run | Not tested |
| 5 | Reflection generation fails | college | n/a | college | Not run | Not tested |
| 6 | Reflection saves but tag update fails | college | productivity | college, reflection remains saved | Not run | Not tested |
| 7 | Regenerate reflection with new themes | productivity | accomplishment, focus | productivity, accomplishment, focus | Not run | Not tested |
| 8 | User edits tags while reflection is loading | college added during loading | productivity | college, productivity | Not run | Not tested |
| 9 | Entry deleted while reflection is loading | college | productivity | no entry mutation, no recreated entry | Not run | Not tested |
| 10 | User switches account while reflection is loading | User A: college, User B: none | productivity | no User B mutation | Not run | Not tested |
| 11 | Offline after reflection succeeds | college | productivity | college, productivity, pending sync | Not run | Not tested |
| 12 | App restart after tags are applied | college | productivity | college, productivity still visible | Not run | Not tested |
| 13 | History filtering by AI-added tag | none | productivity | entry appears under productivity filter | Not run | Not tested |
| 14 | Search by AI-added tag | none | accomplishment | entry appears in tag/search results | Not run | Not tested |
| 15 | Large-font layout with new tags visible | none | productivity, accomplishment | tags visible without clipping | Not run | Not tested |

## Regression Checklist

| Area | Status |
|---|---|
| Journal creation | Not tested |
| Journal editing | Not tested |
| Manual tags | Not tested |
| Tag deletion | Not tested |
| History | Not tested |
| Search | Not tested |
| Tag filters | Not tested |
| Calendar | Not tested |
| AI Reflection | Not tested |
| Regenerate Reflection | Not tested |
| AI Chat | Not tested |
| Weekly report | Not tested |
| Monthly report | Not tested |
| Insights | Not tested |
| Mood logging | Not tested |
| Home | Not tested |
| Dynamic daily AI prompts | Not tested |
| Cloud sync | Not tested |
| Offline mode | Not tested |
| Account switching | Not tested |
| App Lock | Not tested |
| Export | Not tested |
| Backup/restore if implemented | Not tested |
| Account deletion | Not tested |
| Preview build configuration | Not tested |
