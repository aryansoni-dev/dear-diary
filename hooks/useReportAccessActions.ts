import { type Href, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

import { useAppDialog } from "@/hooks/useAppDialog";
import type { UseAIInsightReportResult } from "@/hooks/useAIInsightReport";
import type {
  FeatureAccessResult,
  PremiumFeature,
} from "@/lib/subscription/constants";
import { useAIUsageStore } from "@/store/useAIUsageStore";

const reportFairUseMessage =
  "You've reached this month's DearDiary Pro fair-use limit for reflection reports. Please try again next month.";

export function useReportAccessActions({
  feature,
  reportAccess,
  reportState,
  userId,
}: {
  feature: PremiumFeature;
  reportAccess: FeatureAccessResult;
  reportState: UseAIInsightReportResult;
  userId: string | null | undefined;
}) {
  const router = useRouter();
  const { showDialog } = useAppDialog();
  const fairUseLimitMessage =
    reportAccess.reason === "Pro_fair_use_exhausted"
      ? reportFairUseMessage
      : null;

  const showFairUseDialog = useCallback(() => {
    showDialog({
      confirmText: "OK",
      message: reportFairUseMessage,
      title: "Monthly report limit reached",
    });
  }, [showDialog]);

  const canUseReportAccess = useCallback(() => {
    if (reportAccess.allowed) {
      return true;
    }

    if (reportAccess.reason === "Pro_fair_use_exhausted") {
      showFairUseDialog();
      return false;
    }

    router.push({
      pathname: "/paywall",
      params: { feature },
    } as unknown as Href);
    return false;
  }, [
    feature,
    reportAccess.allowed,
    reportAccess.reason,
    router,
    showFairUseDialog,
  ]);

  const recordUsage = useCallback(() => {
    if (userId) {
      useAIUsageStore.getState().incrementMonthlyUsage(userId, feature);
    }
  }, [feature, userId]);

  const handleConfirmedRegenerate = useCallback(async () => {
    const regenerated = await reportState.regenerate();

    if (regenerated) {
      recordUsage();
    }
  }, [recordUsage, reportState]);

  const handleGenerate = useCallback(async () => {
    if (!canUseReportAccess()) {
      return;
    }

    const generated = await reportState.generate();

    if (generated) {
      recordUsage();
    }
  }, [canUseReportAccess, recordUsage, reportState]);

  const handleRegenerate = useCallback(() => {
    if (!canUseReportAccess()) {
      return;
    }

    showDialog({
      cancelText: "Keep Current",
      confirmText: "Regenerate",
      icon: "✦",
      message:
        "DearDiary will analyze this period again and replace the current visual reflection.",
      onConfirm: () => {
        void handleConfirmedRegenerate();
      },
      showCancel: true,
      title: "Regenerate reflection?",
    });
  }, [canUseReportAccess, handleConfirmedRegenerate, showDialog]);

  return useMemo(
    () => ({
      canUseReportAccess,
      fairUseLimitMessage,
      handleConfirmedRegenerate,
      handleGenerate,
      handleRegenerate,
    }),
    [
      canUseReportAccess,
      fairUseLimitMessage,
      handleConfirmedRegenerate,
      handleGenerate,
      handleRegenerate,
    ],
  );
}
