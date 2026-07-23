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
  getRevenueCatCustomerInfo,
  getRevenueCatMode,
  getRevenueCatOfferings,
  hasProEntitlement,
} from "@/lib/subscription/revenueCat";
import { synchronizeRevenueCatIdentity } from "@/lib/subscription/revenueCatIdentity";
import { isRevenueCatIdentityCurrent } from "@/lib/subscription/subscriptionState";

const subscriptionUnavailableMessage =
  "Subscriptions are unavailable right now.";

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const clerkUserId = userId ?? null;
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const configuredRef = useRef(false);
  const activeUserIdRef = useRef<string | null>(clerkUserId);
  const synchronizedUserIdRef = useRef<string | null>(null);
  const identityVersionRef = useRef(0);
  const apiKey = getRevenueCatApiKey();
  const revenueCatMode = getRevenueCatMode();

  const getIdentityKey = useCallback(
    (identityUserId: string | null) =>
      `${revenueCatMode ?? "unavailable"}:${identityUserId ?? "anonymous"}`,
    [revenueCatMode],
  );

  useEffect(() => {
    activeUserIdRef.current = clerkUserId;
  }, [clerkUserId]);

  useEffect(() => {
    const identityVersion = identityVersionRef.current + 1;

    identityVersionRef.current = identityVersion;
    synchronizedUserIdRef.current = null;
    setCustomerInfo(null);
    setOfferings(null);
    setError(null);

    if (!isLoaded) {
      setIsLoading(true);
      return;
    }

    if (!apiKey) {
      configuredRef.current = false;
      setIsConfigured(false);
      setIsLoading(false);
      setError("RevenueCat is not configured for this build.");
      return;
    }

    try {
      if (!configuredRef.current) {
        configureRevenueCat(apiKey, clerkUserId ?? undefined);
        configuredRef.current = true;
      }

      setIsConfigured(true);
    } catch {
      configuredRef.current = false;
      setIsConfigured(false);
      setIsLoading(false);
      setError("Subscriptions could not be initialized for this build.");
      return;
    }

    let isActive = true;
    const identityKey = getIdentityKey(clerkUserId);

    async function synchronizeIdentity() {
      setIsLoading(true);

      try {
        const identityResult = await synchronizeRevenueCatIdentity(
          {
            getAppUserID: () => Purchases.getAppUserID(),
            getCustomerInfo: () => getRevenueCatCustomerInfo(identityKey),
            isAnonymous: () => Purchases.isAnonymous(),
            logIn: (nextUserId) => Purchases.logIn(nextUserId),
            logOut: () => Purchases.logOut(),
          },
          clerkUserId,
        );

        if (!isCurrentIdentity()) {
          return;
        }

        synchronizedUserIdRef.current = identityResult.appUserId;
        setCustomerInfo(identityResult.customerInfo);

        if (!identityResult.appUserId) {
          return;
        }

        try {
          const latestOfferings = await getRevenueCatOfferings(identityKey);

          if (isCurrentIdentity()) {
            setOfferings(latestOfferings);
          }
        } catch {
          if (isCurrentIdentity()) {
            setOfferings(null);
            setError(subscriptionUnavailableMessage);
          }
        }
      } catch {
        if (isCurrentIdentity()) {
          synchronizedUserIdRef.current = null;
          setCustomerInfo(null);
          setOfferings(null);
          setError(subscriptionUnavailableMessage);
        }
      } finally {
        if (isCurrentIdentity()) {
          setIsLoading(false);
        }
      }
    }

    function isCurrentIdentity() {
      return (
        isActive &&
        identityVersionRef.current === identityVersion &&
        activeUserIdRef.current === clerkUserId
      );
    }

    void synchronizeIdentity();

    return () => {
      isActive = false;
    };
  }, [apiKey, clerkUserId, getIdentityKey, isLoaded]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const listener: CustomerInfoUpdateListener = (nextCustomerInfo) => {
      const expectedUserId = activeUserIdRef.current;

      if (
        !expectedUserId ||
        synchronizedUserIdRef.current !== expectedUserId
      ) {
        return;
      }

      void Purchases.getAppUserID()
        .then((revenueCatUserId) => {
          if (
            isRevenueCatIdentityCurrent({
              activeUserId: activeUserIdRef.current,
              revenueCatUserId,
              synchronizedUserId: synchronizedUserIdRef.current,
            })
          ) {
            setCustomerInfo(nextCustomerInfo);
          }
        })
        .catch(() => undefined);
    };

    Purchases.addCustomerInfoUpdateListener(listener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [isConfigured]);

  const refresh = useCallback(async () => {
    const expectedUserId = activeUserIdRef.current;

    if (
      !configuredRef.current ||
      !expectedUserId ||
      synchronizedUserIdRef.current !== expectedUserId
    ) {
      return;
    }

    const identityKey = getIdentityKey(expectedUserId);

    setIsLoading(true);
    setError(null);

    const [customerInfoResult, offeringsResult] = await Promise.allSettled([
      getRevenueCatCustomerInfo(identityKey),
      getRevenueCatOfferings(identityKey),
    ]);

    if (
      activeUserIdRef.current !== expectedUserId ||
      synchronizedUserIdRef.current !== expectedUserId
    ) {
      return;
    }

    if (customerInfoResult.status === "fulfilled") {
      setCustomerInfo(customerInfoResult.value);
    }

    if (offeringsResult.status === "fulfilled") {
      setOfferings(offeringsResult.value);
    }

    if (
      customerInfoResult.status === "rejected" ||
      offeringsResult.status === "rejected"
    ) {
      setError(subscriptionUnavailableMessage);
    }

    setIsLoading(false);
  }, [getIdentityKey]);

  const purchasePackage = useCallback(
    async (selectedPackage: PurchasesPackage) => {
      const expectedUserId = requireSynchronizedUser(
        configuredRef.current,
        activeUserIdRef.current,
        synchronizedUserIdRef.current,
      );

      setIsLoading(true);
      setError(null);

      try {
        await Purchases.purchasePackage(selectedPackage);
        return await refreshCustomerForUser(
          expectedUserId,
          getIdentityKey(expectedUserId),
        );
      } catch (purchaseError) {
        if (purchaseError instanceof SubscriptionIdentityError) {
          throw purchaseError;
        }

        throw new Error(getFriendlyRevenueCatError(purchaseError));
      } finally {
        if (activeUserIdRef.current === expectedUserId) {
          setIsLoading(false);
        }
      }
    },
    [getIdentityKey],
  );

  const restorePurchases = useCallback(async () => {
    const expectedUserId = requireSynchronizedUser(
      configuredRef.current,
      activeUserIdRef.current,
      synchronizedUserIdRef.current,
    );

    setIsLoading(true);
    setError(null);

    try {
      await Purchases.restorePurchases();
      return await refreshCustomerForUser(
        expectedUserId,
        getIdentityKey(expectedUserId),
      );
    } catch (restoreError) {
      if (restoreError instanceof SubscriptionIdentityError) {
        throw restoreError;
      }

      throw new Error(getFriendlyRevenueCatError(restoreError));
    } finally {
      if (activeUserIdRef.current === expectedUserId) {
        setIsLoading(false);
      }
    }
  }, [getIdentityKey]);

  async function refreshCustomerForUser(
    expectedUserId: string,
    identityKey: string,
  ) {
    const revenueCatUserId = await Purchases.getAppUserID();

    if (
      revenueCatUserId !== expectedUserId ||
      activeUserIdRef.current !== expectedUserId ||
      synchronizedUserIdRef.current !== expectedUserId
    ) {
      throw new SubscriptionIdentityError(
        "Your account changed before the subscription update completed. Please try again.",
      );
    }

    const latestCustomerInfo = await getRevenueCatCustomerInfo(identityKey);

    if (
      activeUserIdRef.current !== expectedUserId ||
      synchronizedUserIdRef.current !== expectedUserId
    ) {
      throw new SubscriptionIdentityError(
        "Your account changed before the subscription update completed. Please try again.",
      );
    }

    setCustomerInfo(latestCustomerInfo);
    return latestCustomerInfo;
  }

  const identityMatches = isRevenueCatIdentityCurrent({
    activeUserId: clerkUserId,
    revenueCatUserId: clerkUserId,
    synchronizedUserId: synchronizedUserIdRef.current,
  });
  const value = useMemo(
    () => ({
      customerInfo,
      error,
      isConfigured,
      isLoading,
      isPro: hasProEntitlement(customerInfo, identityMatches),
      offerings,
      purchasePackage,
      refresh,
      restorePurchases,
    }),
    [
      customerInfo,
      error,
      identityMatches,
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

class SubscriptionIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionIdentityError";
  }
}

function requireSynchronizedUser(
  isConfigured: boolean,
  activeUserId: string | null,
  synchronizedUserId: string | null,
) {
  if (!isConfigured) {
    throw new Error("Subscriptions are not configured for this build.");
  }

  if (!activeUserId || synchronizedUserId !== activeUserId) {
    throw new Error(
      "Subscriptions are still synchronizing with your account. Please try again.",
    );
  }

  return activeUserId;
}
