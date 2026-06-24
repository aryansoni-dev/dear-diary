import type { MoodId } from "@/types/journal";

export type InsightsPeriod = "week" | "month" | "year";

export type InsightsDateRange = {
  end: Date;
  label: string;
  start: Date;
};

export type MoodCount = {
  count: number;
  moodId: MoodId;
  percentage: number;
};

export type WeekdayPattern = {
  activeDayCount: number;
  dominantMood: MoodId | null;
  entryCount: number;
  label: string;
  weekday: number;
};

export type ThemeFrequency = {
  count: number;
  label: string;
  percentage: number;
  source: "tag" | "ai";
};

export type InsightsSummary = {
  activeDays: number;
  currentStreak: number;
  entryCount: number;
  topMood: MoodId | null;
};

export type DerivedInsights = {
  activeEntries: number;
  dateRange: InsightsDateRange;
  entriesWithoutMood: number;
  moodDistribution: MoodCount[];
  summary: InsightsSummary;
  themes: ThemeFrequency[];
  weekdayPatterns: WeekdayPattern[];
};
