import { useAuth } from "@clerk/expo";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesOfferings,
  type PurchasesPackage,
} from "react-native-purchases";

import { SubscriptionContext } from "@/hooks/useSubscription";
import {
  configureRevenueCat,
  getFriendlyRevenueCatError,
  getRevenueCatApiKey,
  hasProEntitlement,
} from "@/lib/subscription/revenueCat";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const configuredRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(null);
  const apiKey = getRevenueCatApiKey();

  const resetCustomerState = useCallback(() => {
    activeUserIdRef.current = null;
    setCustomerInfo(null);
    setOfferings(null);
    setError(null);
  }, []);

  const loadRevenueCatState = useCallback(async () => {
    if (!configuredRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [latestCustomerInfo, latestOfferings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      setCustomerInfo(latestCustomerInfo);
      setOfferings(latestOfferings);
    } catch {
      setError("Subscriptions are unavailable right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true);
      return;
    }

    if (!apiKey) {
      configuredRef.current = false;
      setIsConfigured(false);
      setIsLoading(false);
      resetCustomerState();
      setError("RevenueCat is not configured for this build.");
      return;
    }

    if (!configuredRef.current) {
      configureRevenueCat(apiKey, userId ?? undefined);
      configuredRef.current = true;
      setIsConfigured(true);
    }

    let isActive = true;

    async function identifyCustomer() {
      setIsLoading(true);
      setCustomerInfo(null);
      setError(null);

      try {
        if (userId) {
          activeUserIdRef.current = userId;
          const result = await Purchases.logIn(userId);

          if (!isActive || activeUserIdRef.current !== userId) {
            return;
          }

          setCustomerInfo(result.customerInfo);
        } else {
          activeUserIdRef.current = null;
          await Purchases.logOut().catch(() => undefined);

          if (!isActive) {
            return;
          }

          setCustomerInfo(null);
        }

        const latestOfferings = await Purchases.getOfferings();

        if (isActive) {
          setOfferings(latestOfferings);
        }
      } catch {
        if (isActive) {
          setError("Subscriptions are unavailable right now.");
          setOfferings(null);
          setCustomerInfo(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void identifyCustomer();

    return () => {
      isActive = false;
    };
  }, [apiKey, isLoaded, resetCustomerState, userId]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const listener: CustomerInfoUpdateListener = (nextCustomerInfo) => {
      setCustomerInfo(nextCustomerInfo);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isConfigured]);

  const refresh = useCallback(async () => {
    await loadRevenueCatState();
  }, [loadRevenueCatState]);

  const purchasePackage = useCallback(
    async (selectedPackage: PurchasesPackage) => {
      if (!configuredRef.current) {
        throw new Error("Subscriptions are not configured for this build.");
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await Purchases.purchasePackage(selectedPackage);

        setCustomerInfo(result.customerInfo);
        await loadRevenueCatState();
        return result.customerInfo;
      } catch (purchaseError) {
        const message = getFriendlyRevenueCatError(purchaseError);

        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [loadRevenueCatState],
  );

  const restorePurchases = useCallback(async () => {
    if (!configuredRef.current) {
      throw new Error("Subscriptions are not configured for this build.");
    }

    setIsLoading(true);
    setError(null);

    try {
      const restoredCustomerInfo = await Purchases.restorePurchases();

      setCustomerInfo(restoredCustomerInfo);
      await loadRevenueCatState();
      return restoredCustomerInfo;
    } catch (restoreError) {
      const message = getFriendlyRevenueCatError(restoreError);

      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [loadRevenueCatState]);

  const value = useMemo(
    () => ({
      customerInfo,
      error,
      isConfigured,
      isLoading,
      isPro: hasProEntitlement(customerInfo),
      offerings,
      purchasePackage,
      refresh,
      restorePurchases,
    }),
    [
      customerInfo,
      error,
      isConfigured,
      isLoading,
      offerings,
      purchasePackage,
      refresh,
      restorePurchases,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
