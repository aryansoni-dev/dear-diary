# Preview Smoke Test

Do not change a status to Passed without running the exact scenario on the recorded device and Preview APK. Use disposable accounts only after the backend is confirmed non-production.

| ID | Area | Scenario | Expected | Actual | Device | Status |
| --- | --- | --- | --- | --- | --- | --- |
| CFG-01 | Config | Inspect effective Expo config | Correct identity, package, scheme, plugins, and project ID | Verified locally | Workstation | Passed |
| CFG-02 | Secrets | Search mobile bundle sources for server secret references | No server secret referenced by React Native code | Verified locally | Workstation | Passed |
| CFG-03 | TypeScript | Run `npx tsc --noEmit` | Exit 0 | Exit 0 | Workstation | Passed |
| CFG-04 | Lint | Run `npm run lint` | Exit 0 | Exit 0 | Workstation | Passed |
| CFG-05 | Expo Doctor | Run `npx expo-doctor` | All checks pass | 18/18 checks passed | Workstation | Passed |
| CFG-06 | Bundle | Export release-mode Android JavaScript with Preview app environment | Export succeeds | Export succeeded; 3,987 modules bundled | Workstation | Passed |
| TEST-01 | Automated tests | Run repository TypeScript tests | Tests execute with configured runner | No runner configured; plain Node cannot resolve extensionless TS imports | Workstation | Blocked |
| BUILD-01 | EAS | Build Android with Preview profile | Release-mode APK succeeds | EAS Preview variables are missing | EAS | Blocked |
| BUILD-02 | Install | Fresh install Preview APK | Install succeeds | No APK available | Physical Android | Blocked |
| BUILD-03 | Install | Upgrade over prior Preview APK | Upgrade succeeds and data remains scoped | No APK available | Physical Android | Blocked |
| BUILD-04 | Standalone | Launch with Metro stopped and USB disconnected | App launches normally | Not tested | Physical Android | Not tested |
| BUILD-05 | Identity | Check launcher label, icon, splash, and Preview label | Correct brand, no separate white/default splash, custom animated splash only, and `Preview • v1.0.0` | Not tested | Physical Android | Not tested |
| BUILD-06 | Release | Long press/shake/back gestures | No developer menu or debug control appears | Not tested | Physical Android | Not tested |
| AUTH-01 | Authentication | Create and verify a new account | Account reaches Home | Not tested | Physical Android | Not tested |
| AUTH-02 | Authentication | Sign in with valid credentials | Sign-in succeeds | Not tested | Physical Android | Not tested |
| AUTH-03 | Authentication | Invalid email and incorrect password | Friendly sanitized errors | Not tested | Physical Android | Not tested |
| AUTH-04 | Authentication | Restore session after process kill and restart | Correct user session returns | Not tested | Physical Android | Not tested |
| AUTH-05 | Authentication | Complete enabled Google/Apple SSO path | Callback returns safely to app | Not tested | Physical Android | Not tested |
| AUTH-06 | Authentication | Sign out and switch accounts | No previous-user data appears | Not tested | Physical Android | Not tested |
| ONB-01 | Onboarding | Complete first-install onboarding | Correct auth route opens | Not tested | Physical Android | Not tested |
| ONB-02 | Onboarding | Relaunch as returning user | Onboarding does not repeat unexpectedly | Not tested | Physical Android | Not tested |
| ONB-03 | Accessibility | Test small screen and large font | Content remains reachable and readable | Not tested | Physical Android | Not tested |
| HOME-01 | Home | Empty first-user Home | Honest empty state; no demo data | Not tested | Physical Android | Not tested |
| HOME-02 | Home | Log and edit mood | Mood persists and syncs to correct user | Not tested | Physical Android | Not tested |
| HOME-03 | Home | Save morning intention and evening reflection | Entries persist and sync | Not tested | Physical Android | Not tested |
| JOURNAL-01 | Journal | Create first entry | Entry saves locally and appears in History | Not tested | Physical Android | Not tested |
| JOURNAL-02 | Journal | Edit, close, and reopen entry | Saved content remains | Not tested | Physical Android | Not tested |
| JOURNAL-03 | Journal | Empty, long, Unicode, and deletion cases | Friendly validation; no corruption | Not tested | Physical Android | Not tested |
| JOURNAL-04 | Journal | Kill app during editing | Behavior matches documented save model | Not tested | Physical Android | Not tested |
| HISTORY-01 | History | Search, filters, and missing route | Correct scoped results and safe missing state | Not tested | Physical Android | Not tested |
| CAL-01 | Calendar | Open day/week/month data | Correct scoped activity and moods | Not tested | Physical Android | Not tested |
| SYNC-01 | Sync | First empty-cloud sync | No foreign or seeded data appears | Not tested | Physical Android | Not tested |
| SYNC-02 | Sync | Create offline, reconnect, and retry | Local write uploads once | Not tested | Physical Android | Not tested |
| SYNC-03 | Sync | Sign out during pending sync | Late response cannot enter next user | Not tested | Physical Android | Not tested |
| SYNC-04 | Isolation | User A and User B create distinct data | Each user sees only their own data | Not tested | Two accounts | Not tested |
| AI-01 | AI Chat | Successful authenticated request | Remote response is stored for active user | Not tested | Physical Android | Not tested |
| AI-02 | AI Chat | Offline and backend failure | Friendly error; no release local/mock response | Not tested | Physical Android | Not tested |
| AI-03 | AI Chat | Duplicate tap and background app | Only intended response is applied | Not tested | Physical Android | Not tested |
| AI-04 | Entry reflection | Generate and regenerate | Correct user/entry result; old content survives failure | Not tested | Physical Android | Not tested |
| AI-05 | Reports | Generate weekly and monthly reports | Correct period and user report | Not tested | Physical Android | Not tested |
| INS-01 | Insights | Empty, partial, refreshing, and populated states | Honest states and no cross-user cache | Not tested | Physical Android | Not tested |
| ACH-01 | Achievements | Unlock and restart | State persists and syncs once | Not tested | Physical Android | Not tested |
| LOCK-01 | App Lock | Set PIN, wrong PIN, correct PIN | Lock behaves correctly | Not tested | Physical Android | Not tested |
| LOCK-02 | App Lock | Biometric success, cancel, unavailable | Safe fallback to PIN | Not tested | Physical Android | Not tested |
| LOCK-03 | App Lock | Background, app switcher, process kill, cold start | Private content never flashes | Not tested | Physical Android | Not tested |
| LOCK-04 | App Lock | Open notification and deep link while locked | Lock remains in front | Not tested | Physical Android | Not tested |
| NOTIF-01 | Notifications | Grant and deny permission | Both paths remain usable | Not tested | Physical Android | Not tested |
| NOTIF-02 | Notifications | Schedule and cancel reminders | Correct local reminders only | Not tested | Physical Android | Not tested |
| NOTIF-03 | Notifications | Restart, reboot, and timezone change | Schedule behaves predictably | Not tested | Physical Android | Not tested |
| NOTIF-04 | Notifications | Open reminder with missing target | Safe route/state | Not tested | Physical Android | Not tested |
| EXPORT-01 | Export | Export with no entries | Friendly empty message | Not tested | Physical Android | Not tested |
| EXPORT-02 | Export | Markdown/JSON with Unicode and long content | Share sheet opens; content is complete | Not tested | Physical Android | Not tested |
| EXPORT-03 | Export | Cancel share and inspect temp cleanup | App remains stable; no raw path shown | Not tested | Physical Android | Not tested |
| BACKUP-01 | Backup | Create backup and restore valid/invalid backup | Full documented behavior works | Restore/import is not present in current code | Physical Android | Blocked |
| DELETE-01 | Account deletion | Cancel confirmation | No data changes | Not tested | Physical Android | Not tested |
| DELETE-02 | Account deletion | Delete online | Supabase, Clerk, local, lock, reminders cleaned | Not tested | Physical Android | Not tested |
| DELETE-03 | Account deletion | Offline and partial failure retry | Guard remains safe and retry is possible | Not tested | Physical Android | Not tested |
| LEGAL-01 | Legal | Open Privacy Policy and Terms | Both accessible without raw placeholders | Documents are accessible but placeholders remain | Physical Android | Retest required |
| DATA-01 | Privacy | Inspect release logs during normal use | No content, email, token, PIN, or rows logged | Static guards verified; runtime not tested | Physical Android | Not tested |
| LIFE-01 | Reliability | Process kill and device reboot | App restores correct scoped state | Not tested | Physical Android | Not tested |
| NET-01 | Reliability | Offline/online transitions across main screens | Friendly states; no data loss | Not tested | Physical Android | Not tested |
| REG-01 | Regression | Check all tabs and navigation | No layout, route, or tab regression | Not tested | Physical Android | Not tested |
