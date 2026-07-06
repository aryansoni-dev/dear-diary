export type ReflectionPeriod = "morning" | "afternoon" | "evening";

export type DailyReflectionPrompts = Record<ReflectionPeriod, string>;

export type DailyReflectionPromptBundle = {
  dateKey: string;
  generatedAt: string;
  prompts: DailyReflectionPrompts;
  source: "ai" | "fallback";
  timezone: string;
};

export type GenerateDailyReflectionPromptsResponse = {
  prompts: DailyReflectionPrompts;
  requestId: string;
};
