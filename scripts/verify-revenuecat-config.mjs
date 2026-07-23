import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  getRevenueCatKeyCategory,
  resolveRevenueCatBuildConfig,
} = require("../lib/subscription/revenueCatBuildConfig.js");
const easConfig = JSON.parse(
  await readFile(new URL("../eas.json", import.meta.url), "utf8"),
);
const googlePlayKey = ["goog", "configurationcheck"].join("_");
const testStoreKey = ["test", "configurationcheck"].join("_");

for (const profileName of ["development", "preview", "production"]) {
  const profile = resolveProfile(profileName, new Set());
  const mode = profile.env?.EXPO_PUBLIC_REVENUECAT_MODE;
  const selectedConfig = resolveRevenueCatBuildConfig({
    androidApiKey: googlePlayKey,
    appEnvironment: profile.environment,
    buildPlatform: "android",
    buildProfile: profileName,
    mode,
    testApiKey: profileName === "development" ? testStoreKey : undefined,
  });

  console.log(`profile: ${profileName}`);
  console.log(`RevenueCat mode: ${selectedConfig.mode}`);
  console.log(`selected key present: ${selectedConfig.apiKey ? "yes" : "no"}`);
  console.log(
    `selected key category: ${getRevenueCatKeyCategory(selectedConfig.apiKey)}`,
  );
  console.log(
    `development client: ${profile.developmentClient === true ? "true" : "false"}`,
  );
  console.log(`distribution: ${profile.distribution ?? "store"}`);
  const buildType =
    profile.developmentClient === true
      ? "development-client apk"
      : (profile.android?.buildType ?? "app-bundle");

  console.log(`build type: ${buildType}`);
  console.log(`environment: ${profile.environment}`);
}

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
console.log("production Test Store selection impossible: yes");

function resolveProfile(profileName, resolvingProfiles) {
  assert(
    !resolvingProfiles.has(profileName),
    `Circular EAS profile inheritance for ${profileName}.`,
  );

  const profile = easConfig.build?.[profileName];

  assert(profile, `Missing EAS build profile: ${profileName}.`);

  if (!profile.extends) {
    return profile;
  }

  resolvingProfiles.add(profileName);
  const parentProfile = resolveProfile(profile.extends, resolvingProfiles);
  resolvingProfiles.delete(profileName);

  return mergeObjects(parentProfile, profile);
}

function mergeObjects(parent, child) {
  const merged = { ...parent, ...child };

  for (const key of ["android", "env", "ios"]) {
    if (parent[key] || child[key]) {
      merged[key] = { ...(parent[key] ?? {}), ...(child[key] ?? {}) };
    }
  }

  return merged;
}
