import { useMemo } from "react";

import { getFeatureAccess } from "@/lib/subscription/featureGates";
import type { PremiumFeature } from "@/lib/subscription/constants";
import { useSubscription } from "@/hooks/useSubscription";
import { useAIUsageStore } from "@/store/useAIUsageStore";

export function useFeatureAccess(
  feature: PremiumFeature,
  userId: string | null | undefined,
) {
  const { isConfigured, isPro } = useSubscription();
  const monthlyUsage = useAIUsageStore((state) =>
    state.getMonthlyUsage(userId, feature),
  );

  return useMemo(
    () =>
      getFeatureAccess({
        feature,
        isPro,
        monthlyUsage,
        subscriptionAvailable: isConfigured,
      }),
    [feature, isConfigured, isPro, monthlyUsage],
  );
}
