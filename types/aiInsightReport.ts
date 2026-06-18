export type AIInsightPeriodType = "weekly" | "monthly";

export type MoodDistributionItem = {
  mood: string;
  count: number;
  percentage: number;
};

export type MoodTimelineItem = {
  date: string;
  moods: string[];
  dominantMood: string | null;
  entryCount: number;
};

export type ActivityTimelineItem = {
  date: string;
  entryCount: number;
};

export type ThemeFrequencyItem = {
  name: string;
  count: number;
  source: "tag" | "content";
};

export type EntryTypeDistributionItem = {
  type: string;
  count: number;
  percentage: number;
};

export type ReportAnalytics = {
  totalEntries: number;
  activeDays: number;
  longestStreak: number;
  averageEntriesPerActiveDay: number;
  mostActiveDate: string | null;
  mostActiveDateEntryCount: number;
  moodDistribution: MoodDistributionItem[];
  moodTimeline: MoodTimelineItem[];
  activityTimeline: ActivityTimelineItem[];
  recurringThemes: ThemeFrequencyItem[];
  entryTypeDistribution: EntryTypeDistributionItem[];
  entriesWithMood: number;
  entriesWithoutMood: number;
  dataWasCapped: boolean;
};

export type ReportNarrative = {
  overview: string;
  activities: string[];
  emotionalJourney: string;
  emotionalFlow: string[];
  enjoyed: string[];
  challenges: string[];
  wins: string[];
  patterns: string[];
  improvements: string[];
  nextFocus: string;
  reflectionPrompt: string | null;
  dataQualityNote: string | null;
};

export type AIInsightReport = {
  id: string;
  userId: string;
  periodType: AIInsightPeriodType;
  periodStart: string;
  periodEnd: string;
  analytics: ReportAnalytics;
  narrative: ReportNarrative;
  relatedEntryIds: string[];
  sourceEntryCount: number;
  sourceLatestUpdatedAt: string | null;
  sourceSnapshotHash: string;
  formatVersion: number;
  model: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GenerateAIInsightReportResponse = {
  report: AIInsightReport;
  requestId: string;
};
