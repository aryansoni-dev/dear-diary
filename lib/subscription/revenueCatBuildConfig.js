const REVENUECAT_MODES = new Set(["google-play", "test-store"]);
const REQUIRED_MODES_BY_PROFILE = {
  development: "test-store",
  preview: "google-play",
  production: "google-play",
};

function resolveRevenueCatBuildConfig({
  androidApiKey,
  appEnvironment,
  buildPlatform,
  buildProfile,
  iosApiKey,
  mode,
  testApiKey,
}) {
  const normalizedProfile = normalizeOptionalValue(buildProfile);
  const normalizedAppEnvironment = normalizeOptionalValue(appEnvironment);
  const normalizedMode = normalizeOptionalValue(mode) || "google-play";
  const normalizedAndroidApiKey = normalizeOptionalValue(androidApiKey);
  const normalizedIosApiKey = normalizeOptionalValue(iosApiKey);
  const normalizedTestApiKey = normalizeOptionalValue(testApiKey);
  const normalizedBuildPlatform = normalizeOptionalValue(buildPlatform);
  const requiredProfileMode = REQUIRED_MODES_BY_PROFILE[normalizedProfile];
  const isProduction =
    normalizedProfile === "production" ||
    normalizedAppEnvironment === "production";

  if (!REVENUECAT_MODES.has(normalizedMode)) {
    throw new Error(
      "EXPO_PUBLIC_REVENUECAT_MODE must be google-play or test-store.",
    );
  }

  if (requiredProfileMode && normalizedMode !== requiredProfileMode) {
    throw new Error(
      `${normalizedProfile} builds must use RevenueCat ${requiredProfileMode} mode.`,
    );
  }

  if (isProduction && normalizedMode !== "google-play") {
    throw new Error("Production cannot use RevenueCat Test Store mode.");
  }

  if (isProduction && normalizedTestApiKey) {
    throw new Error(
      "Production must not define a RevenueCat Test Store public SDK key.",
    );
  }

  const selectedApiKey =
    normalizedMode === "test-store"
      ? normalizedTestApiKey
      : normalizedBuildPlatform === "ios"
        ? normalizedIosApiKey
        : normalizedAndroidApiKey;
  const selectedKeyCategory = getRevenueCatKeyCategory(selectedApiKey);
  const expectedPlatformKeyCategory =
    normalizedBuildPlatform === "ios" ? "app-store" : "google-play";

  if (
    requiredProfileMode &&
    !selectedApiKey
  ) {
    throw new Error(
      `RevenueCat ${normalizedMode} public SDK key is required for ${normalizedProfile} builds.`,
    );
  }

  if (
    normalizedMode === "google-play" &&
    selectedKeyCategory !== "missing" &&
    selectedKeyCategory !== "unknown" &&
    selectedKeyCategory !== expectedPlatformKeyCategory
  ) {
    throw new Error(
      `RevenueCat google-play mode cannot select ${getKeyCategoryLabel(selectedKeyCategory)} public SDK key for this platform.`,
    );
  }

  if (
    normalizedMode === "test-store" &&
    (selectedKeyCategory === "google-play" ||
      selectedKeyCategory === "app-store")
  ) {
    throw new Error(
      "RevenueCat test-store mode cannot select a platform Store public SDK key.",
    );
  }

  return {
    apiKey: selectedApiKey,
    mode: normalizedMode,
  };
}

function resolveRevenueCatBuildConfigFromEnvironment(environment) {
  return resolveRevenueCatBuildConfig({
    androidApiKey: environment.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    appEnvironment: environment.EXPO_PUBLIC_APP_ENV,
    buildPlatform: environment.EAS_BUILD_PLATFORM || environment.EXPO_OS,
    buildProfile: environment.EAS_BUILD_PROFILE,
    iosApiKey: environment.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    mode: environment.EXPO_PUBLIC_REVENUECAT_MODE,
    testApiKey: environment.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

function getRevenueCatKeyCategory(apiKey) {
  const normalizedApiKey = normalizeOptionalValue(apiKey);

  if (!normalizedApiKey) {
    return "missing";
  }

  if (normalizedApiKey.startsWith("test_")) {
    return "test-store";
  }

  if (normalizedApiKey.startsWith("goog_")) {
    return "google-play";
  }

  if (normalizedApiKey.startsWith("appl_")) {
    return "app-store";
  }

  return "unknown";
}

function normalizeOptionalValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function getKeyCategoryLabel(category) {
  if (category === "test-store") {
    return "a Test Store";
  }

  if (category === "app-store") {
    return "an App Store";
  }

  return "a Google Play";
}

module.exports = {
  getRevenueCatKeyCategory,
  resolveRevenueCatBuildConfig,
  resolveRevenueCatBuildConfigFromEnvironment,
};
