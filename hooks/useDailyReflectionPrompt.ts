import { useAuth } from "@clerk/expo";
import { useEffect, useMemo, useRef, useState } from "react";

import { useConnectivity } from "@/hooks/useConnectivity";
import { generateDailyReflectionPromptBundle } from "@/lib/ai/dailyReflectionPromptService";
import {
  createStableFallbackBundle,
  getLocalDateKey,
  getLocalTimezone,
  getRecentPromptTexts,
  getReflectionPeriod,
} from "@/lib/reflection-prompts/dailyReflectionPrompts";
import { useDailyReflectionPromptStore } from "@/store/useDailyReflectionPromptStore";
import type { DailyReflectionPromptBundle } from "@/types/dailyReflectionPrompt";

type VolatileBundle = {
  bundle: DailyReflectionPromptBundle;
  userId: string;
};

export function useDailyReflectionPrompt(currentTime: Date) {
  const { isLoaded, userId } = useAuth();
  const connectivity = useConnectivity();
  const dateKey = getLocalDateKey(currentTime);
  const timezone = getLocalTimezone();
  const period = getReflectionPeriod(currentTime);
  const hasHydrated = useDailyReflectionPromptStore(
    (state) => state.hasHydrated,
  );
  const hydrationError = useDailyReflectionPromptStore(
    (state) => state.hydrationError,
  );
  const cachedBundle = useDailyReflectionPromptStore((state) =>
    userId ? state.bundlesByUser[userId]?.[dateKey] ?? null : null,
  );
  const userBundles = useDailyReflectionPromptStore((state) =>
    userId ? state.bundlesByUser[userId] : undefined,
  );
  const setBundle = useDailyReflectionPromptStore(
    (state) => state.setBundle,
  );
  const [volatileBundle, setVolatileBundle] =
    useState<VolatileBundle | null>(null);
  const requestContextRef = useRef(0);
  const matchingVolatileBundle =
    volatileBundle &&
    volatileBundle.userId === userId &&
    volatileBundle.bundle.dateKey === dateKey
      ? volatileBundle.bundle
      : null;
  const bundle = cachedBundle ?? matchingVolatileBundle;
  const recentPrompts = useMemo(
    () => getRecentPromptTexts(userBundles, dateKey),
    [dateKey, userBundles],
  );

  useEffect(() => {
    requestContextRef.current += 1;
    const requestContext = requestContextRef.current;

    if (!isLoaded || !userId || !hasHydrated || bundle) {
      return;
    }

    if (connectivity.status === "unknown") {
      return;
    }

    const fallbackBundle = createStableFallbackBundle({
      date: currentTime,
      dateKey,
      recentPrompts,
      timezone,
      userId,
    });

    const saveBundle = (nextBundle: DailyReflectionPromptBundle) => {
      if (requestContextRef.current !== requestContext) {
        return;
      }

      if (hydrationError) {
        setVolatileBundle({ bundle: nextBundle, userId });
        return;
      }

      setBundle(userId, nextBundle);
    };

    if (connectivity.status === "offline") {
      saveBundle(fallbackBundle);
      return;
    }

    void generateDailyReflectionPromptBundle({
      dateKey,
      recentPrompts,
      timezone,
      userId,
    })
      .then((generatedBundle) => {
        const latestBundle =
          useDailyReflectionPromptStore.getState().bundlesByUser[userId]?.[
            dateKey
          ];

        if (!latestBundle) {
          saveBundle(generatedBundle);
        }
      })
      .catch(() => {
        if (__DEV__) {
          console.info("Daily reflection fallback selected", {
            dateKeyPresent: Boolean(dateKey),
            fallbackUsed: true,
            requestFailed: true,
          });
        }

        saveBundle(fallbackBundle);
      });
  }, [
    bundle,
    connectivity.status,
    currentTime,
    dateKey,
    hasHydrated,
    hydrationError,
    isLoaded,
    recentPrompts,
    setBundle,
    timezone,
    userId,
  ]);

  useEffect(
    () => () => {
      requestContextRef.current += 1;
    },
    [],
  );

  return {
    isLoading: Boolean(isLoaded && userId && !bundle),
    period,
    prompt: bundle?.prompts[period] ?? null,
  };
}
