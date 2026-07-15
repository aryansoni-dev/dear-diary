| testID | Screen/feature | Element | Purpose |
|---|---|---|---|
| `login-screen`, `signup-screen` | Authentication | Auth scroll screen | Detect auth state |
| `login-email-input`, `signup-email-input` | Authentication | Email input | Enter email |
| `login-password-input`, `signup-password-input` | Authentication | Password input | Enter password |
| `signup-name-input` | Authentication | Full name input | Enter signup name |
| `login-submit-button`, `signup-submit-button` | Authentication | Primary submit button | Submit auth form |
| `login-forgot-password-button` | Authentication | Forgot password link | Open reset flow |
| `login-signup-link`, `signup-login-link` | Authentication | Footer auth link | Switch auth mode |
| `auth-sso-google-button`, `auth-sso-apple-button` | Authentication | SSO buttons | Start SSO |
| `auth-loading-indicator`, `sso-callback-loading` | Authentication | Loading states | Wait for auth/SSO |
| `onboarding-next-button`, `onboarding-back-button`, `onboarding-skip-button`, `onboarding-complete-button`, `onboarding-maybe-later-button` | Onboarding | Navigation buttons | Drive onboarding |
| `onboarding-page-indicator` | Onboarding | Progress indicator | Verify current onboarding page |
| `tab-today-button`, `tab-reflect-button`, `tab-history-button`, `tab-insights-button`, `tab-profile-button` | Bottom tabs | Tab buttons | Navigate main tabs |
| `home-screen` | Home | Screen | Detect home state |
| `home-mood-card` | Home | Mood check-in card | Verify mood module |
| `home-mood-<moodId>-button` | Home | Mood radio button | Select a mood |
| `home-mood-save-button` | Home | Mood save button | Save mood check-in |
| `home-ai-prompt-card`, `home-ai-prompt-text`, `home-ai-prompt-open-button` | Home | Daily prompt card | Open prompt journaling |
| `home-writing-streak-card` | Home | Streak card | Verify streak area |
| `home-morning-intention-card`, `home-morning-intention-open-button` | Home | Morning intention card/action | Open or create intention |
| `home-recent-entries-section`, `home-recent-entry-card-<entryId>` | Home | Recent entries | Open recent entry |
| `journal-editor-screen` | Journal editor | Screen | Detect editor |
| `journal-editor-title-input`, `journal-editor-body-input` | Journal editor | Text inputs | Write entry title/body |
| `journal-editor-save-button`, `journal-editor-delete-button`, `journal-editor-back-button` | Journal editor | Main actions | Save/delete/go back |
| `journal-editor-sync-status` | Journal editor | Save status text | Read sync/local state |
| `journal-editor-mood-<moodId>-button` | Journal editor | Mood chip | Set entry mood |
| `journal-editor-add-tag-button`, `journal-editor-tag-input`, `journal-editor-tag-submit-button` | Journal editor | Tag controls | Add a tag |
| `journal-editor-tag-chip-<tagSlug>` | Journal editor | Tag chip | Remove a visible tag |
| `entry-reflection-screen` | Entry reflection | Reflection card | Detect AI reflection area |
| `entry-reflection-generate-button`, `entry-reflection-regenerate-button` | Entry reflection | AI actions | Generate/update reflection |
| `entry-reflection-loading`, `entry-reflection-error-message` | Entry reflection | State messages | Wait/assert reflection state |
| `entry-reflection-summary-section`, `entry-reflection-emotions-section`, `entry-reflection-themes-section`, `entry-reflection-question-section`, `entry-reflection-next-step-section` | Entry reflection | Result sections | Verify generated sections |
| `entry-reflection-theme-chip-<themeSlug>` | Entry reflection | Theme chip | Verify visible theme chip |
| `history-screen` | History | Screen | Detect history |
| `history-search-input` | History | Search input | Search entries |
| `history-filter-list`, `history-mood-filter-<moodId>-button` | History | Filters | Filter by mood |
| `history-entry-list`, `history-entry-card-<entryId>` | History | Entry list/card | Open entry without content-based IDs |
| `history-empty-state` | History | Empty state | Assert no entries |
| `calendar-prev-month-button`, `calendar-next-month-button`, `calendar-today-button` | Calendar | Month controls | Navigate calendar |
| `calendar-day-button-<yyyy-mm-dd>` | Calendar | Calendar day | Select date |
| `ai-chat-screen` | AI Chat | Screen | Detect chat |
| `ai-chat-message-list` | AI Chat | Message list | Verify list exists |
| `ai-chat-message-input`, `ai-chat-send-button` | AI Chat | Composer | Send message |
| `ai-chat-clear-button`, `ai-chat-jump-latest-button`, `ai-chat-emoji-toggle-button` | AI Chat | Chat actions | Manage chat view |
| `ai-chat-loading-indicator`, `ai-chat-thinking-indicator`, `ai-chat-error-message` | AI Chat | State messages | Wait/assert chat state |
| `assistant-message-<messageId>` | AI Chat | Assistant message renderer | Target generated assistant message |
| `insights-screen` | Insights | Screen | Detect insights |
| `insights-weekly-report-card`, `insights-monthly-report-card` | Insights | Report cards | Verify report entry points |
| `weekly-report-open-button`, `monthly-report-open-button` | Insights | Report open buttons | Open reports |
| `weekly-report-generate-button`, `monthly-report-generate-button` | Reports | Generate buttons | Generate report |
| `weekly-report-content`, `monthly-report-content` | Reports | Report scroll content | Verify report view |
| `report-loading-indicator`, `report-error-message`, `report-retry-button` | Reports | State/actions | Handle report states |
| `premium-locked-card`, `insights-advanced-upgrade-button`, `insights-monthly-report-upgrade-button` | Insights premium | Locked CTAs | Open paywall |
| `paywall-screen` | Paywall | Screen | Detect paywall |
| `paywall-monthly-plan-card`, `paywall-yearly-plan-card` | Paywall | Plan cards | Select plan |
| `paywall-continue-button`, `paywall-restore-button`, `paywall-maybe-later-button` | Paywall | Actions | Purchase/restore/close |
| `paywall-terms-link`, `paywall-privacy-link` | Paywall | Legal links | Open legal docs |
| `paywall-error-message`, `paywall-status-message`, `paywall-loading-indicator` | Paywall | State messages | Assert state |
| `profile-screen` | Profile | Screen | Detect profile |
| `profile-settings-button`, `profile-signout-button` | Profile | Header/account actions | Open settings/sign out |
| `profile-export-button`, `profile-backup-button` | Profile | Account rows | Export or sync data |
| `profile-upgrade-plus-button`, `profile-manage-subscription-button` | Profile | Subscription row | Open paywall/manage subscription |
| `profile-delete-account-button` | Profile | Destructive row | Reveal deletion confirmation |
| `delete-account-screen`, `delete-account-confirm-input`, `delete-account-confirm-button`, `delete-account-cancel-button` | Account deletion | Confirmation controls | Test confirmation safeguards |
| `delete-account-warning-text`, `delete-account-loading-indicator` | Account deletion | Warning/loading | Assert destructive flow state |
| `settings-screen` | Settings/privacy | Screen | Detect settings |
| `settings-app-lock-row`, `settings-notifications-row`, `settings-privacy-row`, `settings-theme-row` | Settings/profile | Rows | Navigate settings |
| `profile-privacy-policy-link`, `profile-terms-link` | Settings/privacy | Legal rows | Open legal docs |
| `app-lock-screen` | App Lock | Lock gate | Detect private lock |
| `app-lock-pin-input`, `app-lock-unlock-button`, `app-lock-biometric-button`, `app-lock-error-message` | App Lock | Unlock controls | Unlock or assert failure |
| `app-lock-setup-screen`, `app-lock-setup-pin-input`, `app-lock-confirm-pin-input`, `app-lock-enable-button` | App Lock setup | Setup controls | Enable App Lock |
| `app-lock-biometric-toggle`, `app-lock-delay-<delay>-button` | App Lock setup | Preferences | Configure lock options |
| `notifications-settings-screen` | Notifications | Screen | Detect notifications |
| `notifications-enable-toggle`, `notification-permission-status` | Notifications | Toggle/status | Enable and assert reminders |
| `morning-reminder-time-button`, `evening-reminder-time-button` | Notifications | Reminder rows | Open time picker |
| `reminder-save-button`, `reminder-cancel-button` | Notifications | Picker actions | Save/cancel time |

Dynamic ID strategy:
- Entry cards use `entry.id`.
- Calendar days use existing date keys in `yyyy-mm-dd` form.
- Mood buttons use typed mood IDs.
- Tag and AI theme chips use normalized visible chip text.
- No ID includes journal title, journal body, email, user ID, token, purchase token, or private AI response content.
