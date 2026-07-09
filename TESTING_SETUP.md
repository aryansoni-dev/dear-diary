# DearDiary Testing Setup

This guide defines the recommended low-cost testing stack for DearDiary:

- **Maestro CLI** for native Android end-to-end tests
- **Jest + React Native Testing Library** for components, hooks, stores, and utilities
- **Supabase pgTAP + Deno tests** for database, RLS, and Edge Functions
- **Manual device checks** for biometrics, notifications, encryption, and OS-specific behavior

The local workflow is free. Optional EAS builds and EAS Workflows can consume the
quota included with the Expo account.

## 1. Current project state

DearDiary currently uses:

- Expo SDK 54 and React Native 0.81
- Android package ID: `com.aryan.deardiary`
- Clerk Expo authentication
- Supabase database and Edge Functions
- Zustand with AsyncStorage persistence
- `expo-local-authentication`, `expo-secure-store`, and `expo-notifications`
- An existing `preview` EAS profile that produces an Android APK

The existing files under `tests/` are standalone Node assertion scripts. They
must remain separate from Jest tests. Put new Jest tests under `__tests__/`.

Recommended final structure:

```text
.maestro/
  config.yaml
  smoke/
  auth/
  journal/
  privacy/
__tests__/
  components/
  hooks/
  lib/
  store/
supabase/
  tests/
    database/
  functions/
    tests/
tests/
  existing standalone Node tests
```

## 2. Environment safety

Use development or preview services for automated tests. Never point destructive
tests at production.

1. Copy `.env.example` to the local environment file already used by the app.
2. Use a Clerk **development** publishable key (`pk_test_...`).
3. Use a development or dedicated test Supabase project.
4. Never place these values in Maestro YAML or commit them:
   - Clerk secret key
   - Supabase service-role key
   - AI provider keys
   - Real user credentials
5. Use clearly identifiable test data, for example titles prefixed with
   `[E2E]`, so cleanup is safe.

For Clerk OTP flows, a development instance supports test addresses such as:

```text
deardiary+clerk_test@example.com
```

The fixed verification code for Clerk test addresses is:

```text
424242
```

Use a dedicated test user. Do not automate sign-in against a real user's
account.

## 3. Maestro native E2E setup

Maestro is the primary native test runner. It tests the installed Android app
through the accessibility layer and does not require an npm package inside the
app.

### 3.1 Prerequisites on Linux

Verify Java 17 or newer:

```bash
java -version
```

Verify Android Debug Bridge:

```bash
adb version
adb devices
```

If `adb devices` does not show a device:

1. Open Android Studio.
2. Open **Device Manager**.
3. Start an Android emulator.
4. Run `adb devices` again.

Install Maestro CLI:

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Ensure the CLI directory is in `PATH`:

```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

Persist that line in the shell configuration after confirming it works.

Verify installation:

```bash
maestro --version
```

### 3.2 Install a testable DearDiary build

Use one of the following approaches.

#### Option A: local Android build

This is the free default for daily development:

```bash
npx expo run:android
```

The command builds and installs DearDiary on the running emulator. Start the
Metro server separately when the development build requires it.

#### Option B: preview APK

The existing `preview` profile in `eas.json` already produces an APK:

```bash
npx eas build --platform android --profile preview
```

After downloading the APK:

```bash
adb install -r /absolute/path/to/deardiary.apk
```

Use this option for release-like smoke tests. EAS build quota may apply.

Confirm installation:

```bash
adb shell pm list packages | grep com.aryan.deardiary
```

### 3.3 Create the Maestro folders

Create:

```text
.maestro/
  config.yaml
  smoke/
  auth/
  journal/
  privacy/
```

Because the flows are organized in subfolders, add
`.maestro/config.yaml` so Maestro discovers them recursively:

```yaml
flows:
  - "smoke/**"
  - "auth/**"
  - "journal/**"
  - "privacy/**"
```

Start with `.maestro/smoke/app-launch.yml`:

```yaml
appId: com.aryan.deardiary
---
- launchApp:
    clearState: true
- assertVisible: "Get Started.*"
```

Run it:

```bash
maestro test .maestro/smoke/app-launch.yml
```

Use regular expressions only where UI text intentionally contains variable
content.

### 3.4 Stable selectors

Prefer selectors in this order:

1. React Native `testID`
2. `accessibilityLabel`
3. Stable visible text

Example app component:

```tsx
<Pressable
  accessibilityLabel="Create journal entry"
  testID="create-journal-entry"
>
  ...
</Pressable>
```

Example Maestro step:

```yaml
- tapOn:
    id: "create-journal-entry"
```

Do not add `testID` to every element. Add it only where visible text is missing,
localized, duplicated, or unstable.

### 3.5 Pass test values safely

Do not commit passwords in flow files. Pass values when running Maestro:

```bash
maestro test \
  -e TEST_EMAIL="deardiary+clerk_test@example.com" \
  -e TEST_OTP="424242" \
  .maestro/auth/sign-in.yml
```

Use them in YAML:

```yaml
- tapOn: "Email"
- inputText: "${TEST_EMAIL}"
- tapOn: "Continue"
- tapOn: "Verification code"
- inputText: "${TEST_OTP}"
```

Adjust visible labels to match the implemented Clerk flow.

### 3.6 Initial Maestro test suite

Implement flows in this order:

1. **App launch**
   - Fresh install opens onboarding
   - Existing state skips completed onboarding
   - App reaches a usable screen without crashing

2. **Authentication**
   - Sign up or sign in using a Clerk development test account
   - Invalid identifier/code shows a readable error
   - Sign out returns to authentication
   - Relaunch restores the valid session

3. **Journal**
   - Create an entry with title, body, and mood
   - Edit and save the entry
   - Relaunch and confirm local persistence
   - Search for the entry
   - Delete the entry and confirm removal

4. **Mood and reflection**
   - Complete a mood check-in
   - Verify the mood appears in history/calendar
   - Generate a mocked or test-environment reflection
   - Verify loading, success, and failure states

5. **Navigation**
   - Visit every main tab
   - Open journal detail and return
   - Verify Android back behavior
   - Verify deep links that are part of release scope

6. **Offline and recovery**
   - Create/edit while offline
   - Relaunch with persisted local data
   - Restore connectivity and verify sync behavior
   - Exercise the app's documented fault-injection states where available

Run one flow:

```bash
maestro test .maestro/journal/create-entry.yml
```

Run the whole suite:

```bash
maestro test .maestro
```

Capture diagnostics during investigation:

```yaml
- takeScreenshot: "journal-created"
```

## 4. Jest and React Native Testing Library

This layer provides fast feedback without booting an emulator.

### 4.1 Install dependencies

These are new development dependencies and should only be installed after
approval:

```bash
npx expo install jest-expo jest @types/jest --dev
npx expo install @testing-library/react-native --dev
```

Do not install `react-test-renderer`; it is deprecated for the React version
used by this project.

### 4.2 Configure Jest

Add scripts similar to:

```json
{
  "scripts": {
    "test:unit": "jest",
    "test:unit:watch": "jest --watch"
  }
}
```

Add a Jest configuration that only discovers tests under `__tests__/`:

```json
{
  "jest": {
    "preset": "jest-expo",
    "testMatch": [
      "<rootDir>/__tests__/**/*.test.ts",
      "<rootDir>/__tests__/**/*.test.tsx"
    ]
  }
}
```

This scoping is important because the existing `tests/*.test.ts` files are
standalone Node scripts rather than Jest suites.

If Jest globals are used directly in TypeScript, add `"jest"` to the
`compilerOptions.types` array without removing any existing type entries.

### 4.3 First unit and component targets

Prioritize behavior with business or privacy risk:

- Journal store add/update/delete behavior
- Persisted-state validation and migration
- User A/User B local-data isolation
- Mood-log calculations
- Streak and achievement calculations
- Search and filter behavior
- Sync retry and conflict behavior
- AI response parsing and malformed-response fallbacks
- Environment validation
- Loading, empty, error, and long-text component states

Mock boundaries, not implementation details:

- AsyncStorage
- Network requests
- Clerk hooks
- Supabase client
- Notifications
- Local authentication

Avoid large snapshot tests. Assert user-visible behavior and state transitions.

### 4.4 Run tests

Run Jest tests:

```bash
npm run test:unit
```

Continue running the existing focused scripts:

```bash
npm run test:environment
npm run test:navigation-transitions
npm run test:reflection-prompts
```

Also run:

```bash
npm run lint
npx tsc --noEmit
```

## 5. Supabase database and RLS tests

Database tests are essential because journal entries contain private user data.

### 5.1 Prerequisites

Install or use the Supabase CLI and ensure Docker is running.

Discover the installed CLI commands rather than assuming a version:

```bash
npx supabase --version
npx supabase test db --help
```

Start the local stack:

```bash
npx supabase start
```

### 5.2 Add pgTAP tests

Put database tests under:

```text
supabase/tests/database/
```

Create tests for:

- Required tables, columns, constraints, and indexes
- RLS enabled on every exposed journal-related table
- User A can read and modify User A's rows
- User A cannot read, update, or delete User B's rows
- Anonymous access is rejected where appropriate
- Inserts cannot assign data to another user
- Updates cannot change row ownership
- Delete-account database behavior removes expected user data
- Storage policies protect any exported or uploaded private files

Every update policy should be tested for both row visibility and allowed new
values. Authentication alone is not authorization.

Run database tests:

```bash
npx supabase test db
```

Stop local services when finished:

```bash
npx supabase stop
```

## 6. Supabase Edge Function tests

DearDiary currently has functions for:

- Daily reflection prompts
- Entry reflections
- Insight reports
- Journal AI chat
- Account deletion

Put new tests under:

```text
supabase/functions/tests/
```

Use Deno tests for:

1. Pure parsers and business logic
2. Request validation
3. Missing/invalid authentication
4. Clerk/Supabase identity mismatch
5. Upstream AI timeout and malformed response
6. Database failure
7. Rate limiting
8. Successful response shape
9. Account deletion authorization and cleanup

Some functions have gateway JWT verification disabled in `supabase/config.toml`.
For each such function, explicitly test that its own authentication and
authorization logic still rejects unauthorized requests.

Run deterministic unit tests:

```bash
deno test --allow-env supabase/functions/tests/
```

If a test intentionally calls locally served functions, start the stack and
grant only the permissions required by that test:

```bash
npx supabase start
npx supabase functions serve
deno test --allow-env --allow-net supabase/functions/tests/
```

Do not use production service-role credentials in tests.

## 7. Manual native test pass

Keep these checks manual because emulators cannot provide full confidence:

### Privacy and security

- Real fingerprint and Face ID success, cancellation, and lockout
- PIN fallback and retry limits
- App background/foreground privacy behavior
- Screenshot/app-switcher privacy behavior
- Secure storage after sign-out
- User switch does not expose the previous user's entries
- Export contains only the current user's requested data
- Account deletion removes local and remote data

### Notifications and lifecycle

- Permission allowed and denied
- Notification received while foregrounded/backgrounded
- Notification tap opens the correct route
- Device reboot and app process death
- Low storage and interrupted save

### Device coverage

- Small Android screen
- Large Android screen
- Light and dark mode
- Increased font size
- Slow/offline network
- At least one physical Android device
- iOS physical-device pass before App Store release

Linux can run Android automation locally. iOS automation requires macOS and
Xcode.

## 8. Recommended daily and release workflow

### During feature development

```bash
npm run lint
npx tsc --noEmit
npm run test:unit
```

Run the affected standalone Node test and Maestro flow as needed.

### Before merging

```bash
npm run lint
npx tsc --noEmit
npm run test:unit
maestro test .maestro/smoke
```

Run Supabase tests whenever migrations or Edge Functions change:

```bash
npx supabase test db
deno test --allow-env supabase/functions/tests/
```

### Before a release

1. Build/install the preview APK.
2. Run the complete Maestro suite.
3. Run all unit, database, and Edge Function tests.
4. Complete the manual native checklist.
5. Record failures, device/OS version, screenshots, and reproduction steps.
6. Do not release while a privacy, data-loss, authentication, or crash issue is
   unresolved.

## 9. Optional EAS Workflow

Only add cloud automation after local Maestro flows are stable. EAS Workflows'
Maestro job is currently documented as alpha and can consume Expo build/workflow
quota.

An Android-only workflow can use the existing `preview` APK profile:

```yaml
name: Android E2E

on:
  workflow_dispatch: {}

jobs:
  build_android:
    type: build
    params:
      platform: android
      profile: preview

  maestro_test:
    needs: [build_android]
    type: maestro
    params:
      build_id: ${{ needs.build_android.outputs.build_id }}
      flow_path: ".maestro"
      record_screen: true
```

Save it under `.eas/workflows/` only when enabling CI. Validate it against the
current EAS Workflow schema before committing.

## 10. Setup order

Use this order to keep the rollout small and debuggable:

1. Install Maestro locally.
2. Add one app-launch smoke flow.
3. Add the journal create/edit/persist flow.
4. Add Clerk development-account authentication.
5. Install and configure Jest/RNTL.
6. Add store and persistence tests.
7. Add pgTAP RLS isolation tests.
8. Add Edge Function tests.
9. Complete the manual physical-device checklist.
10. Add optional CI only after local tests are reliable.

## Official references

- [Maestro CLI installation](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli)
- [Maestro React Native support](https://docs.maestro.dev/platform-support/react-native)
- [Expo unit testing](https://docs.expo.dev/develop/unit-testing/)
- [Expo E2E testing with Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- [Clerk testing overview](https://clerk.com/docs/guides/development/testing/overview)
- [Clerk test emails and OTPs](https://clerk.com/docs/guides/development/testing/test-emails-and-phones)
- [Supabase database testing](https://supabase.com/docs/guides/database/testing)
- [Supabase Edge Function testing](https://supabase.com/docs/guides/functions/unit-test)
