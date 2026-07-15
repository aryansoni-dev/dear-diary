import { createContext, useContext } from "react";

import type {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";

export type SubscriptionState = {
  customerInfo: CustomerInfo | null;
  error: string | null;
  isConfigured: boolean;
  isLoading: boolean;
  isPro: boolean;
  offerings: PurchasesOfferings | null;
  purchasePackage: (selectedPackage: PurchasesPackage) => Promise<CustomerInfo>;
  refresh: () => Promise<void>;
  restorePurchases: () => Promise<CustomerInfo>;
};

export const SubscriptionContext = createContext<SubscriptionState | null>(
  null,
);

export function useSubscription() {
  const value = useContext(SubscriptionContext);

  if (!value) {
    throw new Error("useSubscription must be used within SubscriptionProvider.");
  }

  return value;
}

export function useIsPro() {
  return useSubscription().isPro;
}

export function useCustomerInfo() {
  return useSubscription().customerInfo;
}
