import Constants from "expo-constants";
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOfferings,
} from "react-native-purchases";

import { createKeyedRequestDeduper } from "@/lib/subscription/requestDeduper";
import { revenueCatEntitlementId } from "@/lib/subscription/constants";
import { createRunOnce } from "@/lib/subscription/runOnce";
import {
  hasVerifiedEntitlement,
  isEntitlementEnvironmentAuthoritative,
} from "@/lib/subscription/subscriptionState";

export type RevenueCatMode = "google-play" | "test-store";
export type RevenueCatPlatform = "android" | "ios";

type RevenueCatRuntimeConfig = {
  apiKey: string | null;
  mode: RevenueCatMode;
};

const configureOnce = createRunOnce();
const customerInfoRequests = createKeyedRequestDeduper<CustomerInfo>();
const offeringRequests = createKeyedRequestDeduper<PurchasesOfferings>();

export function getRevenueCatPlatform(): RevenueCatPlatform | null {
  if (process.env.EXPO_OS === "android" || process.env.EXPO_OS === "ios") {
    return process.env.EXPO_OS;
  }

  return null;
}

export function getRevenueCatRuntimeConfig() {
  const candidate: unknown = Constants.expoConfig?.extra?.revenueCat;

  if (!isRecord(candidate) || !isRevenueCatMode(candidate.mode)) {
    return null;
  }

  if (candidate.apiKey !== null && typeof candidate.apiKey !== "string") {
    return null;
  }

  const apiKey = candidate.apiKey?.trim() || null;

  return {
    apiKey,
    mode: candidate.mode,
  } satisfies RevenueCatRuntimeConfig;
}

export function getRevenueCatApiKey() {
  if (!getRevenueCatPlatform()) {
    return null;
  }

  return getRevenueCatRuntimeConfig()?.apiKey ?? null;
}

export function getRevenueCatMode() {
  return getRevenueCatRuntimeConfig()?.mode ?? null;
}

export function isRevenueCatEntitlementAuthoritative() {
  return isEntitlementEnvironmentAuthoritative(Constants.executionEnvironment);
}

export function hasProEntitlement(
  customerInfo: CustomerInfo | null,
  identityMatches: boolean,
) {
  return hasVerifiedEntitlement({
    customerInfo,
    entitlementId: revenueCatEntitlementId,
    identityMatches,
    isAuthoritative: isRevenueCatEntitlementAuthoritative(),
  });
}

export function isRevenueCatPurchaseCancelled(error: unknown) {
  return (
    isPurchasesError(error) &&
    error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}

export function getFriendlyRevenueCatError(error: unknown) {
  if (!isPurchasesError(error)) {
    return "We could not complete the purchase. Please try again.";
  }

  if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
    return "Purchase was cancelled. You can try again when you are ready.";
  }

  if (error.code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
    return "Your purchase is pending. Please check your store account.";
  }

  if (error.code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
    return "Please check your connection and try again.";
  }

  if (
    error.code === PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR
  ) {
    return "This subscription is not available right now.";
  }

  if (error.code === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
    return "Purchases are not available for this store account.";
  }

  if (error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
    return "This subscription is already active on your store account.";
  }

  return "We could not complete the purchase. Please try again.";
}

export function configureRevenueCat(apiKey: string, appUserID?: string) {
  return configureOnce.run(() => {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure(appUserID ? { apiKey, appUserID } : { apiKey });
  });
}

export function getRevenueCatCustomerInfo(identityKey: string) {
  return customerInfoRequests.run(identityKey, () => Purchases.getCustomerInfo());
}

export function getRevenueCatOfferings(identityKey: string) {
  return offeringRequests.run(identityKey, () => Purchases.getOfferings());
}

function isRevenueCatMode(value: unknown): value is RevenueCatMode {
  return value === "google-play" || value === "test-store";
}

function isPurchasesError(error: unknown): error is PurchasesError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
