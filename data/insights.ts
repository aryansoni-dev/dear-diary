export type MoodJourneyPoint = {
  day: string;
  emoji: string;
  mood: number;
};

export type InsightStat = {
  backgroundColor: string;
  emoji: string;
  label: string;
  shadowColor: string;
  value: string;
};

export type InsightCard = {
  backgroundColor: string;
  body: string;
  emoji: string;
  shadowColor: string;
  title: string;
  variant: "ai" | "plain";
};

export type InsightStatStyle = Omit<InsightStat, "value">;

export type InsightCardStyle = Omit<InsightCard, "body">;

export const insightStatStyles: InsightStatStyle[] = [
  {
    backgroundColor: "#FFDDE8",
    emoji: "🌸",
    label: "Top Emotion",
    shadowColor: "rgba(255, 32, 86, 0.25)",
  },
  {
    backgroundColor: "#DDEFFF",
    emoji: "📝",
    label: "Entries",
    shadowColor: "rgba(120, 160, 220, 0.25)",
  },
  {
    backgroundColor: "#D8EEDB",
    emoji: "🔥",
    label: "Current Streak",
    shadowColor: "rgba(120, 200, 140, 0.25)",
  },
] satisfies InsightStatStyle[];

export const insightCardStyles: InsightCardStyle[] = [
  {
    backgroundColor: "#FFFFFF",
    emoji: "✨",
    shadowColor: "rgba(180, 150, 210, 0.28)",
    title: "DearDiary AI Says",
    variant: "ai",
  },
  {
    backgroundColor: "#D8EEDB",
    emoji: "🌱",
    shadowColor: "rgba(120, 200, 140, 0.3)",
    title: "Pattern Found",
    variant: "plain",
  },
  {
    backgroundColor: "#DDEFFF",
    emoji: "💡",
    shadowColor: "rgba(120, 160, 220, 0.3)",
    title: "Recurring Topic",
    variant: "plain",
  },
] satisfies InsightCardStyle[];
