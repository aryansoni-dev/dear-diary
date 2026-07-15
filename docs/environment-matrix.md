# Environment Matrix

## Development

Used for local Metro-connected work, explicit developer diagnostics, and `__DEV__`-guarded fault injection. Local values belong in ignored `.env` files. The configured EAS development profile is a development client, but `expo-dev-client` is not installed; do not build that profile until the dependency is explicitly approved and added.

## Preview

Used for private friends-and-family testing. It is a release-mode internal APK, does not use Metro, contains no development controls, uses non-production services, and has no paywall. The services must be explicitly approved before their variables are added to EAS.

## Production

Reserved for a future Play Store AAB using production services. Production values are intentionally absent, and no production build or submission is authorized by this task.

| Variable                                            | Development                        | Preview                                                    | Production                                           | Client-safe? |     Required |
| --------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- | -----------: | -----------: |
| `EXPO_PUBLIC_APP_ENV`                               | `development`                      | `preview`                                                  | `production`                                         |          Yes |          Yes |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`                 | Local test publishable key         | Approved non-production publishable key; missing in EAS    | Future production publishable key; pending           |          Yes |          Yes |
| `EXPO_PUBLIC_SUPABASE_URL`                          | Local ignored HTTPS URL            | Approved non-production project URL; missing in EAS        | Future production project URL; pending               |          Yes |          Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`                     | Local ignored legacy anonymous key | Approved Preview anonymous/publishable key; missing in EAS | Future production anonymous/publishable key; pending |          Yes |          Yes |
| `EXPO_PUBLIC_ACCOUNT_DELETION_URL`                  | Optional public URL                | Optional public Preview URL; missing in EAS                | Future public URL; pending                           |          Yes |           No |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`            | Optional public Android SDK key    | Preview RevenueCat Android public SDK key; missing in EAS  | Production Android public SDK key; pending           |          Yes | No for core app, yes for purchases |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`                | Optional public iOS SDK key        | Preview RevenueCat iOS public SDK key when iOS is enabled  | Production iOS public SDK key; pending               |          Yes | No for core app, yes for purchases |
| `OPENROUTER_API_KEY`                                | Backend secret storage             | Backend secret storage                                     | Backend secret storage                               |           No | Backend only |
| `CLERK_SECRET_KEY`                                  | Delete-account Edge Function only  | Delete-account Edge Function only                          | Backend only                                         |           No | Backend only |
| `REVENUECAT_SECRET_API_KEY`                         | AI Edge Functions only             | AI Edge Functions only                                     | AI Edge Functions only                               |           No | Backend only |
| `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` | Edge Functions only                | Edge Functions only                                        | Backend only                                         |           No | Backend only |

## Rules

- Never place server-only variables in `eas.json`, any `EXPO_PUBLIC_` variable, or React Native source.
- Treat every `EXPO_PUBLIC_` value as extractable from the APK.
- Do not copy local Development values into Preview until both services are confirmed non-production and contain no production users or data.
- Use the matching EAS environment for each build profile. Do not add a production fallback.
- Preview and Production fail closed with a generic configuration screen when required public values are missing or invalid.
- Development shows safe variable names in the configuration error; it never prints values.

## Preview EAS handoff

After approving the backend projects, create these values in the EAS `preview` environment through the Expo dashboard or EAS CLI:

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_ACCOUNT_DELETION_URL (optional)
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY (optional until iOS builds are enabled)
```

Re-run `eas env:list preview` without value-revealing flags, then run the pre-build checks before building.

## Preview Clerk

Application: DearDiary
Instance: Development
Purpose: Preview Build 1
Publishable-key type: pk*test*
Contains production users: No
Approved for preview: Yes

## Preview Supabase

Project name: dear-diary
Project reference: gnbdsmijnopmmyipwnri
Purpose: Preview Build 1
Contains production data: No
Approved for preview: Yes

Android keystore: Present
Management: EAS
Package: com.aryan.deardiary
