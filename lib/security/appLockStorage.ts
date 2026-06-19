import * as SecureStore from "expo-secure-store";

import type { AppLockConfig, AppLockDelay } from "@/types/appLock";

const appLockDelays: AppLockDelay[] = [
  "immediately",
  "after_1_minute",
  "after_5_minutes",
  "after_15_minutes",
];

const sanitizeSecureStoreKey = (value: string) =>
  value.replace(/[^A-Za-z0-9._-]/g, "_");

const getAppLockStorageKey = (userId: string) =>
  `deardiary.app-lock.v1.${sanitizeSecureStoreKey(userId)}`;

export const getAppLockConfig = async (
  userId: string,
): Promise<AppLockConfig | null> => {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();

    if (!isAvailable) {
      return null;
    }

    const storedValue = await SecureStore.getItemAsync(
      getAppLockStorageKey(userId),
    );

    if (!storedValue) {
      return null;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isAppLockConfig(parsedValue)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
};

export const saveAppLockConfig = async (
  userId: string,
  config: AppLockConfig,
): Promise<void> => {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (!isAvailable) {
    throw new Error("Secure storage is not available on this device.");
  }

  await SecureStore.setItemAsync(
    getAppLockStorageKey(userId),
    JSON.stringify(config),
  );
};

export const deleteAppLockConfig = async (userId: string): Promise<void> => {
  const isAvailable = await SecureStore.isAvailableAsync();

  if (!isAvailable) {
    return;
  }

  await SecureStore.deleteItemAsync(getAppLockStorageKey(userId));
};

function isAppLockConfig(value: unknown): value is AppLockConfig {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    typeof value.enabled === "boolean" &&
    typeof value.biometricEnabled === "boolean" &&
    typeof value.pinSalt === "string" &&
    value.pinSalt.length > 0 &&
    typeof value.pinHash === "string" &&
    value.pinHash.length > 0 &&
    typeof value.lockDelay === "string" &&
    appLockDelays.includes(value.lockDelay as AppLockDelay) &&
    typeof value.failedAttempts === "number" &&
    Number.isInteger(value.failedAttempts) &&
    value.failedAttempts >= 0 &&
    (value.lockedUntil === null || isIsoDateString(value.lockedUntil)) &&
    isIsoDateString(value.createdAt) &&
    isIsoDateString(value.updatedAt)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIsoDateString(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}
