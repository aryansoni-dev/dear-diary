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

export const moodJourney: MoodJourneyPoint[] = [
  { day: "Mon", emoji: "😌", mood: 3 },
  { day: "Tue", emoji: "😊", mood: 4 },
  { day: "Wed", emoji: "😌", mood: 3.5 },
  { day: "Thu", emoji: "🔥", mood: 4.5 },
  { day: "Fri", emoji: "😊", mood: 4 },
  { day: "Sat", emoji: "🙏", mood: 4.8 },
  { day: "Sun", emoji: "😊", mood: 4.2 },
];

export const insightStats: InsightStat[] = [
  {
    backgroundColor: "#FFDDE8",
    emoji: "🌸",
    label: "Top Emotion",
    shadowColor: "rgba(255, 32, 86, 0.25)",
    value: "Calm",
  },
  {
    backgroundColor: "#DDEFFF",
    emoji: "📝",
    label: "Entries",
    shadowColor: "rgba(120, 160, 220, 0.25)",
    value: "5",
  },
  {
    backgroundColor: "#D8EEDB",
    emoji: "🔥",
    label: "Current Streak",
    shadowColor: "rgba(120, 200, 140, 0.25)",
    value: "7 Days",
  },
];

export const insightCards: InsightCard[] = [
  {
    backgroundColor: "#FFFFFF",
    body: '"You\'ve been carrying a lot lately, but gratitude appears frequently throughout your entries."',
    emoji: "✨",
    shadowColor: "rgba(180, 150, 210, 0.28)",
    title: "DearDiary AI Says",
    variant: "ai",
  },
  {
    backgroundColor: "#D8EEDB",
    body: "You feel calmer on days you write before 10 PM.",
    emoji: "🌱",
    shadowColor: "rgba(120, 200, 140, 0.3)",
    title: "Pattern Found",
    variant: "plain",
  },
  {
    backgroundColor: "#DDEFFF",
    body: "Friendships appeared in 34% of entries this month.",
    emoji: "💡",
    shadowColor: "rgba(120, 160, 220, 0.3)",
    title: "Recurring Topic",
    variant: "plain",
  },
];
