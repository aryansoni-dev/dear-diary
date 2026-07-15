export const premiumBenefits = [
  "More AI Chat access",
  "AI reflections for your entries",
  "AI-generated themes and tags",
  "Weekly and monthly AI reports",
  "Advanced mood and writing insights",
  "Long-term summaries",
] as const;

export type PremiumBenefit = (typeof premiumBenefits)[number];
