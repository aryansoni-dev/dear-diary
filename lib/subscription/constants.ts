export const revenueCatEntitlementId = "DearDiary Pro";
export const revenueCatOfferingId = "default";

export const expectedRevenueCatProductIds = {
  monthly: "deardiary_pro_monthly",
  yearly: "deardiary_pro_yearly",
} as const;

export type PremiumFeature =
  | "ai_chat"
  | "entry_reflection"
  | "weekly_report"
  | "monthly_report"
  | "advanced_insights"
  | "long_term_summary"
  | "personalized_suggestions";

export type FeatureAccessReason =
  | "allowed_free"
  | "allowed_Pro"
  | "free_quota_remaining"
  | "free_quota_exhausted"
  | "Pro_fair_use_exhausted"
  | "subscription_unavailable";

export type FeatureAccessResult = {
  allowed: boolean;
  limit?: number;
  reason: FeatureAccessReason;
  remaining?: number;
};

type FeatureLimit = {
  freeMonthlyLimit: number | null;
  proMonthlyLimit: number | null;
  proOnly: boolean;
};

export const premiumFeatureLimits: Record<PremiumFeature, FeatureLimit> = {
  advanced_insights: {
    freeMonthlyLimit: 0,
    proMonthlyLimit: null,
    proOnly: true,
  },
  ai_chat: {
    freeMonthlyLimit: 10,
    proMonthlyLimit: 300,
    proOnly: false,
  },
  entry_reflection: {
    freeMonthlyLimit: 3,
    proMonthlyLimit: 100,
    proOnly: false,
  },
  long_term_summary: {
    freeMonthlyLimit: 0,
    proMonthlyLimit: null,
    proOnly: true,
  },
  monthly_report: {
    freeMonthlyLimit: 0,
    proMonthlyLimit: null,
    proOnly: true,
  },
  personalized_suggestions: {
    freeMonthlyLimit: 0,
    proMonthlyLimit: null,
    proOnly: true,
  },
  weekly_report: {
    freeMonthlyLimit: 1,
    proMonthlyLimit: null,
    proOnly: false,
  },
};

export function getCurrentUTCMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}
