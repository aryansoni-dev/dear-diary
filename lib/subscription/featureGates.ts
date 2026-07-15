import {
  premiumFeatureLimits,
  type FeatureAccessResult,
  type PremiumFeature,
} from "@/lib/subscription/constants";

export function getFeatureAccess(params: {
  feature: PremiumFeature;
  isPro: boolean;
  monthlyUsage: number;
  subscriptionAvailable: boolean;
}): FeatureAccessResult {
  const limit = premiumFeatureLimits[params.feature];

  if (params.isPro) {
    if (limit.proMonthlyLimit === null) {
      return { allowed: true, reason: "allowed_Pro" };
    }

    const remaining = Math.max(0, limit.proMonthlyLimit - params.monthlyUsage);

    return {
      allowed: remaining > 0,
      limit: limit.proMonthlyLimit,
      reason: remaining > 0 ? "allowed_Pro" : "Pro_fair_use_exhausted",
      remaining,
    };
  }

  if (limit.proOnly && !params.subscriptionAvailable) {
    return { allowed: false, reason: "subscription_unavailable" };
  }

  if (limit.freeMonthlyLimit === null) {
    return { allowed: true, reason: "allowed_free" };
  }

  const remaining = Math.max(0, limit.freeMonthlyLimit - params.monthlyUsage);

  return {
    allowed: remaining > 0,
    limit: limit.freeMonthlyLimit,
    reason: remaining > 0 ? "free_quota_remaining" : "free_quota_exhausted",
    remaining,
  };
}
