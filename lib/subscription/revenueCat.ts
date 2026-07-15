import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
} from "react-native-purchases";

import { getPublicEnvironment } from "@/lib/environment";
import { revenueCatEntitlementId } from "@/lib/subscription/constants";

export type RevenueCatPlatform = "android" | "ios";

export function getRevenueCatPlatform(): RevenueCatPlatform | null {
  if (process.env.EXPO_OS === "android" || process.env.EXPO_OS === "ios") {
    return process.env.EXPO_OS;
  }

  return null;
}

export function getRevenueCatApiKey() {
  const environment = getPublicEnvironment();
  const platform = getRevenueCatPlatform();

  if (!environment || !platform) {
    return null;
  }

  return platform === "ios"
    ? environment.revenueCatIosApiKey
    : environment.revenueCatAndroidApiKey;
}

export function hasProEntitlement(customerInfo: CustomerInfo | null) {
  return Boolean(customerInfo?.entitlements.active[revenueCatEntitlementId]);
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
    return "Purchase was cancelled.";
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
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  Purchases.configure(appUserID ? { apiKey, appUserID } : { apiKey });
}

function isPurchasesError(error: unknown): error is PurchasesError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}
