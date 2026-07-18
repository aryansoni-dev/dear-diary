# Android Release Dependency Hardening

Implementation date: 2026-07-17

## Result

DearDiary Preview and Production Android release builds no longer resolve AndroidX Test Core or Compose UI Tooling. Their merged release manifests consequently contain none of the four MobSF activities and no `android.permission.REORDER_TASKS`.

The Expo Dev Client generated scheme is now profile-aware:

| Profile | `exp+dear-diary://` | `deardiary://` | Dependency exclusions |
| --- | --- | --- | --- |
| Development | Preserved | Preserved | Present in generated Gradle, but applies only to release configurations |
| Preview | Removed | Preserved | Applied to Android release configurations |
| Production | Removed | Preserved | Applied to Android release configurations |
| Local prebuild without `EAS_BUILD_PROFILE` | Preserved as a safe development default | Preserved | Present, but applies only to release configurations |

No Expo, React Native, Clerk, RevenueCat, or Expo Notifications dependency was upgraded, removed, or suppressed. `eas.json`, application business logic, generated native source, and the pre-existing `package.json` and `package-lock.json` changes were not modified by this implementation.

## Upstream Clerk investigation

The installed package is `@clerk/expo@3.3.1`, which uses `com.clerk:clerk-android-ui:1.0.23`. Its release metadata introduces:

```text
@clerk/expo@3.3.1
\- com.clerk:clerk-android-ui:1.0.23
   +- androidx.test:core-ktx:1.7.0
   |  \- androidx.test:core:1.7.0
   \- androidx.compose.ui:ui-tooling -> ui-tooling-android:1.11.2
```

The current stable package available during implementation was `@clerk/expo@3.7.8`. Its peer range accepts Expo 54 (`expo >=53 <58`), consistent with Clerk's [Expo 54 and 55 compatibility guidance](https://clerk.com/articles/clerk-compatibility-in-expo-54-and-55). However, its Android build uses Clerk Android UI 1.0.36, whose [published Maven POM](https://repo1.maven.org/maven2/com/clerk/clerk-android-ui/1.0.36/clerk-android-ui-1.0.36.pom) still declares both `androidx.test:core-ktx:1.7.0` and Compose `ui-tooling` as runtime dependencies.

Therefore no verified upstream release fixes this metadata leak. An upstream update was not used: it would add upgrade risk without removing the findings.

## Implementation

### Release dependency plugin

`plugins/withAndroidReleaseHardening.js` is a local Expo config plugin registered after the explicitly registered `expo-dev-client` plugin in `app.json`. It uses `withAppBuildGradle` so Continuous Native Generation recreates the change during every prebuild; no generated `android/` directory is committed.

The generated block applies only to Gradle configurations whose names contain `release` and excludes exactly:

```groovy
configuration.exclude group: 'androidx.test', module: 'core'
configuration.exclude group: 'androidx.test', module: 'core-ktx'
configuration.exclude group: 'androidx.compose.ui', module: 'ui-tooling'
```

The plugin:

- uses clear begin/end markers;
- replaces its own marked block rather than duplicating it;
- passed a two-run idempotence assertion;
- rejects mismatched or duplicate markers;
- fails clearly when the generated app Gradle file is not Groovy or lacks the expected Android application/dependency structure.

The exclusions are safe for the verified release because these artifacts contributed test invocation and IDE preview tooling, not DearDiary runtime APIs. The Production release dependency chain and app module compiled successfully after they were removed.

The plugin deliberately does not exclude:

```text
androidx.compose.ui:ui-tooling-preview-android:1.11.2
androidx.compose.runtime
androidx.compose.ui
```

`ui-tooling-preview-android` remains on `releaseRuntimeClasspath` through Clerk. It supplies preview annotations/API without the manifest-bearing `PreviewActivity` from `ui-tooling-android`.

### Profile-aware dev-client scheme

`app.config.js` preserves the complete static config passed from `app.json` and changes only the existing Expo Dev Client plugin option:

```text
development or unspecified profile -> addGeneratedScheme: true
preview/production               -> addGeneratedScheme: false
```

A dynamic config was necessary because `addGeneratedScheme` must vary by `EAS_BUILD_PROFILE`. Using Expo Dev Client's own option prevents the scheme from being generated and avoids brittle post-generation intent-filter edits. The intentional `deardiary://` scheme, HTTPS filters, launcher filter, and Clerk `clerk://` callback filters are untouched.

Expo Dev Client remains installed and autolinked. Preview and Production may still compile its disabled release stubs and Dev Launcher barcode metadata, but their functional debug activities and `expo-dev-launcher://` authentication filter remain absent from release manifests. Profile-aware native autolinking exclusion could reduce release size later, but it is not required for this security fix and would be substantially more fragile.

## Before and after

| Finding | Before Preview/Production | After Preview/Production |
| --- | --- | --- |
| `androidx.test:core-ktx` | `1.7.0` on release runtime | Absent |
| `androidx.test:core` | `1.7.0` on release runtime | Absent |
| `androidx.compose.ui:ui-tooling-android` | `1.11.2` on release runtime | Absent |
| `androidx.compose.ui:ui-tooling-preview-android` | `1.11.2` on release runtime | Preserved at `1.11.2` |
| `androidx.compose.ui.tooling.PreviewActivity` | Exported | Absent |
| `InstrumentationActivityInvoker$BootstrapActivity` | Exported | Absent |
| `InstrumentationActivityInvoker$EmptyActivity` | Exported | Absent |
| `InstrumentationActivityInvoker$EmptyFloatingActivity` | Exported | Absent |
| `android.permission.REORDER_TASKS` | Present | Absent |
| `exp+dear-diary://` | Present | Absent |
| `deardiary://` | Present | Preserved |
| Clerk callback filters | Present | Preserved |

## Native verification

All native generation occurred in `/tmp/dear-diary-release-hardening.R3v6BQ`. No `android/` or `ios/` directory was generated in the repository.

### Preview release

Executed:

```bash
EXPO_PUBLIC_APP_ENV=preview EAS_BUILD_PROFILE=preview npx expo prebuild --platform android --no-install --clean
NODE_ENV=production EXPO_PUBLIC_APP_ENV=preview EAS_BUILD_PROFILE=preview ./gradlew :app:processReleaseMainManifest --no-daemon --console=plain
./gradlew :app:dependencies --configuration releaseRuntimeClasspath --no-daemon --console=plain
./gradlew :app:dependencyInsight --configuration releaseRuntimeClasspath --dependency androidx.test --no-daemon --console=plain
./gradlew :app:dependencyInsight --configuration releaseRuntimeClasspath --dependency androidx.compose.ui:ui-tooling-android --no-daemon --console=plain
```

Results:

- prebuild and the release manifest merge passed;
- focused dependency insight found no AndroidX Test dependency;
- focused dependency insight found no `ui-tooling-android` dependency;
- `ui-tooling-preview-android:1.11.2`, Compose UI, and Compose runtime remain;
- all four flagged activities, `REORDER_TASKS`, and `exp+dear-diary` are absent from the merged release manifest;
- `com.aryan.deardiary.MainActivity`, `deardiary`, Clerk Auth/User Profile and SSO activities, both Clerk callback filters, RevenueCat/Google Play billing activities, and Expo notification services/activities remain.

### Production release

Executed:

```bash
EXPO_PUBLIC_APP_ENV=production EAS_BUILD_PROFILE=production npx expo prebuild --platform android --no-install
NODE_ENV=production EXPO_PUBLIC_APP_ENV=production EAS_BUILD_PROFILE=production ./gradlew :app:processReleaseMainManifest --no-daemon --console=plain
NODE_ENV=production EXPO_PUBLIC_APP_ENV=production EAS_BUILD_PROFILE=production ./gradlew :app:compileReleaseKotlin --no-daemon --console=plain
```

Results:

- the production release manifest passed the same absence and preservation checks as Preview;
- the release compile completed successfully, including `:clerk_expo:compileReleaseKotlin`, Clerk Java compilation, `:react-native-purchases:compileReleaseKotlin`/Java, Expo modules, and `:app:compileReleaseKotlin`;
- upstream deprecation warnings remain, but there were no compilation errors.

### Development debug

Executed:

```bash
EXPO_PUBLIC_APP_ENV=development EAS_BUILD_PROFILE=development npx expo prebuild --platform android --no-install --clean
EXPO_PUBLIC_APP_ENV=development EAS_BUILD_PROFILE=development ./gradlew :app:processDebugMainManifest --no-daemon --console=plain
```

The merged debug manifest preserves:

- `exp+dear-diary://` and `deardiary://`;
- `expo-dev-launcher://`;
- `DevLauncherActivity` and `DevLauncherErrorActivity`;
- the existing debug dependency behavior, including the test/tooling activities that are intentionally excluded only from release configurations.

This confirms the existing development-client workflow remains available.

## Repository checks

Both the baseline and post-change required checks passed:

| Check | Result |
| --- | --- |
| `npx expo-doctor` | Passed, 18/18 |
| `npx tsc --noEmit` | Passed |
| `npm run lint` | Passed |
| `npm run test:reflection-prompts` | Passed |
| `npm run test:environment` | Passed |
| `npm run test:entry-reflection-theme-tags` | Passed |
| `npm run test:navigation-transitions` | Passed |
| Release-hardening idempotence assertion | Passed |

No Expo server or cloud build was started.

## Upgrade and removal guidance

On each future `@clerk/expo` update:

1. Inspect the resolved Clerk Android UI version and its Gradle module metadata/POM.
2. Generate a clean temporary Android project.
3. Run release dependency insight for `androidx.test` and `androidx.compose.ui:ui-tooling-android`.
4. Inspect the merged release manifest for the four activities and `REORDER_TASKS`.
5. Compile the release configuration and exercise Clerk sign-in, sign-up, profile, SSO, and callback flows.

Remove the three Gradle exclusions only after the upstream release graph no longer publishes those artifacts at runtime and the clean manifest remains free of the findings without the workaround. The profile-aware Expo Dev Client option is independent; retain it while `expo-dev-client` is installed and non-development builds should not expose its generated scheme.

## Remaining risk and next step

This validation proves CNG output, release dependency resolution, merged manifests, and release compilation. It did not install an APK on a device, execute Clerk/RevenueCat/notification runtime flows, or run a cloud build. A fresh Preview APK is ready to build and should be followed by device smoke tests and a new MobSF scan before promotion.
