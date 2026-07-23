import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  resolveRevenueCatBuildConfig,
} = require("../lib/subscription/revenueCatBuildConfig.js");
const getExpoConfig = require("../app.config.js");
const easConfig = JSON.parse(
  readFileSync(new URL("../eas.json", import.meta.url), "utf8"),
);

const googlePlayKey = ["goog", "examplepublickey"].join("_");
const testStoreKey = ["test", "examplepublickey"].join("_");
const appStoreKey = ["appl", "examplepublickey"].join("_");

assert.deepEqual(easConfig.build.development, {
  developmentClient: true,
  distribution: "internal",
  environment: "development",
  env: {
    EXPO_PUBLIC_REVENUECAT_MODE: "test-store",
  },
});
assert.equal(
  "subscription-test" in easConfig.build,
  false,
  "Development must be the only Test Store build profile.",
);
assert.equal(easConfig.build.preview.developmentClient, false);
assert.equal(easConfig.build.preview.distribution, "internal");
assert.equal(easConfig.build.preview.environment, "preview");
assert.equal(easConfig.build.preview.env.EXPO_PUBLIC_REVENUECAT_MODE, "google-play");
assert.equal(easConfig.build.preview.android.buildType, "apk");
assert.equal(easConfig.build.production.environment, "production");
assert.equal(
  easConfig.build.production.env.EXPO_PUBLIC_REVENUECAT_MODE,
  "google-play",
);
assert.equal(easConfig.build.production.android.buildType, "app-bundle");
assert.notEqual(easConfig.build.production.developmentClient, true);

const developmentConfig = resolveRevenueCatBuildConfig({
  androidApiKey: googlePlayKey,
  appEnvironment: "development",
  buildPlatform: "android",
  buildProfile: "development",
  mode: "test-store",
  testApiKey: testStoreKey,
});

assert.deepEqual(developmentConfig, {
  apiKey: testStoreKey,
  mode: "test-store",
});
assert.deepEqual(
  Object.keys(developmentConfig).sort(),
  ["apiKey", "mode"],
  "Runtime config must expose only the explicitly selected key and mode.",
);

const previewConfig = resolveRevenueCatBuildConfig({
  androidApiKey: googlePlayKey,
  appEnvironment: "preview",
  buildPlatform: "android",
  buildProfile: "preview",
  mode: "google-play",
  testApiKey: testStoreKey,
});

assert.deepEqual(previewConfig, {
  apiKey: googlePlayKey,
  mode: "google-play",
});

const productionConfig = resolveRevenueCatBuildConfig({
  androidApiKey: googlePlayKey,
  appEnvironment: "production",
  buildPlatform: "android",
  buildProfile: "production",
  mode: "google-play",
});

assert.deepEqual(productionConfig, {
  apiKey: googlePlayKey,
  mode: "google-play",
});

const iosPreviewConfig = resolveRevenueCatBuildConfig({
  androidApiKey: googlePlayKey,
  appEnvironment: "preview",
  buildPlatform: "ios",
  buildProfile: "preview",
  iosApiKey: appStoreKey,
  mode: "google-play",
});

assert.equal(
  iosPreviewConfig.apiKey,
  appStoreKey,
  "Existing iOS builds must continue selecting the iOS public SDK key.",
);

const missingDevelopmentKeyError = captureError(() =>
  resolveRevenueCatBuildConfig({
    appEnvironment: "development",
    buildPlatform: "android",
    buildProfile: "development",
    mode: "test-store",
  }),
);

assert.match(missingDevelopmentKeyError.message, /public SDK key is required/);
assert.equal(missingDevelopmentKeyError.message.includes(testStoreKey), false);
assert.equal(missingDevelopmentKeyError.message.includes(googlePlayKey), false);

assert.throws(
  () =>
    resolveRevenueCatBuildConfig({
      androidApiKey: googlePlayKey,
      appEnvironment: "development",
      buildPlatform: "android",
      buildProfile: "development",
      mode: "google-play",
      testApiKey: testStoreKey,
    }),
  /development builds must use RevenueCat test-store mode/,
);

assert.throws(
  () =>
    resolveRevenueCatBuildConfig({
      androidApiKey: googlePlayKey,
      appEnvironment: "production",
      buildPlatform: "android",
      buildProfile: "production",
      mode: "test-store",
      testApiKey: testStoreKey,
    }),
  /Production|production builds/,
);

assert.throws(
  () =>
    resolveRevenueCatBuildConfig({
      androidApiKey: googlePlayKey,
      appEnvironment: "production",
      buildPlatform: "android",
      buildProfile: "production",
      mode: "google-play",
      testApiKey: testStoreKey,
    }),
  /must not define a RevenueCat Test Store/,
);

assert.throws(
  () =>
    resolveRevenueCatBuildConfig({
      androidApiKey: testStoreKey,
      appEnvironment: "preview",
      buildPlatform: "android",
      buildProfile: "preview",
      mode: "google-play",
    }),
  /cannot select a Test Store/,
);

assert.throws(
  () =>
    resolveRevenueCatBuildConfig({
      androidApiKey: appStoreKey,
      appEnvironment: "production",
      buildPlatform: "android",
      buildProfile: "production",
      mode: "google-play",
    }),
  /cannot select an App Store/,
);

let logCount = 0;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const countLog = () => {
  logCount += 1;
};

try {
  console.log = countLog;
  console.warn = countLog;
  console.error = countLog;

  resolveRevenueCatBuildConfig({
    appEnvironment: "development",
    buildPlatform: "android",
    buildProfile: "development",
    mode: "test-store",
    testApiKey: testStoreKey,
  });

  captureError(() =>
    resolveRevenueCatBuildConfig({
      appEnvironment: "development",
      buildPlatform: "android",
      buildProfile: "development",
      mode: "test-store",
    }),
  );
} finally {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
}

assert.equal(logCount, 0, "RevenueCat configuration must not log API keys.");

const baseExpoConfig = {
  extra: { eas: { projectId: "preserved-project" } },
  plugins: ["expo-dev-client"],
};
const effectiveDevelopmentConfig = getEffectiveExpoConfig(
  {
    EAS_BUILD_PLATFORM: "android",
    EAS_BUILD_PROFILE: "development",
    EXPO_PUBLIC_APP_ENV: "development",
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googlePlayKey,
    EXPO_PUBLIC_REVENUECAT_MODE: "test-store",
    EXPO_PUBLIC_REVENUECAT_TEST_API_KEY: testStoreKey,
  },
  baseExpoConfig,
);

assert.equal(effectiveDevelopmentConfig.extra.revenueCat.apiKey, testStoreKey);
assert.equal(effectiveDevelopmentConfig.extra.revenueCat.mode, "test-store");
assert.equal(effectiveDevelopmentConfig.extra.eas.projectId, "preserved-project");
assert.deepEqual(effectiveDevelopmentConfig.plugins[0], [
  "expo-dev-client",
  { addGeneratedScheme: true },
]);

const effectivePreviewConfig = getEffectiveExpoConfig(
  {
    EAS_BUILD_PLATFORM: "android",
    EAS_BUILD_PROFILE: "preview",
    EXPO_PUBLIC_APP_ENV: "preview",
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googlePlayKey,
    EXPO_PUBLIC_REVENUECAT_MODE: "google-play",
    EXPO_PUBLIC_REVENUECAT_TEST_API_KEY: undefined,
  },
  baseExpoConfig,
);

assert.equal(effectivePreviewConfig.extra.revenueCat.apiKey, googlePlayKey);
assert.equal(effectivePreviewConfig.extra.revenueCat.mode, "google-play");
assert.deepEqual(effectivePreviewConfig.plugins[0], [
  "expo-dev-client",
  { addGeneratedScheme: false },
]);

const effectiveProductionConfig = getEffectiveExpoConfig(
  {
    EAS_BUILD_PLATFORM: "android",
    EAS_BUILD_PROFILE: "production",
    EXPO_PUBLIC_APP_ENV: "production",
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googlePlayKey,
    EXPO_PUBLIC_REVENUECAT_MODE: "google-play",
    EXPO_PUBLIC_REVENUECAT_TEST_API_KEY: undefined,
  },
  baseExpoConfig,
);

assert.equal(effectiveProductionConfig.extra.revenueCat.apiKey, googlePlayKey);
assert.equal(effectiveProductionConfig.extra.revenueCat.mode, "google-play");
assert.deepEqual(effectiveProductionConfig.plugins[0], [
  "expo-dev-client",
  { addGeneratedScheme: false },
]);

const effectiveUnprofiledConfig = getEffectiveExpoConfig(
  {
    EAS_BUILD_PLATFORM: "android",
    EAS_BUILD_PROFILE: undefined,
    EXPO_PUBLIC_APP_ENV: "development",
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY: googlePlayKey,
    EXPO_PUBLIC_REVENUECAT_MODE: "google-play",
    EXPO_PUBLIC_REVENUECAT_TEST_API_KEY: undefined,
  },
  baseExpoConfig,
);

assert.deepEqual(effectiveUnprofiledConfig.plugins[0], [
  "expo-dev-client",
  { addGeneratedScheme: false },
]);

function captureError(action) {
  try {
    action();
  } catch (error) {
    assert(error instanceof Error);
    return error;
  }

  throw new Error("Expected action to throw.");
}

function getEffectiveExpoConfig(environment, config) {
  return withEnvironment(environment, () => getExpoConfig({ config }));
}

function withEnvironment(values, action) {
  const previousValues = new Map();

  for (const [name, value] of Object.entries(values)) {
    previousValues.set(name, process.env[name]);

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }

  try {
    return action();
  } finally {
    for (const [name, value] of previousValues) {
      if (value === undefined) {
        delete process.env[name];
      } else {
        process.env[name] = value;
      }
    }
  }
}
