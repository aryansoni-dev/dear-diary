import type {
  AIInsightPeriodType,
  AIInsightReport,
  EntryTypeDistributionItem,
  MoodDistributionItem,
  MoodTimelineItem,
  ReportAnalytics,
  ReportNarrative,
  ThemeFrequencyItem,
} from "@/types/aiInsightReport";

export type AIInsightReportRow = {
  created_at: string;
  format_version?: number | null;
  id: string;
  insight_type: AIInsightPeriodType;
  model: string | null;
  period_end: string;
  period_start: string;
  related_entry_ids: string[] | null;
  report_data: unknown;
  source_entry_count?: number | null;
  source_latest_updated_at?: string | null;
  source_snapshot_hash?: string | null;
  updated_at: string;
  user_id: string;
};

export type AIInsightReportMapResult =
  | { report: AIInsightReport; status: "ok" }
  | { status: "legacy" }
  | { status: "invalid" };

export function mapAIInsightReportRow(
  row: unknown,
): AIInsightReportMapResult {
  if (!isAIInsightReportRow(row)) {
    return { status: "invalid" };
  }

  const reportData = row.report_data;

  if (!isRecord(reportData)) {
    return { status: "legacy" };
  }

  const formatVersion = reportData.formatVersion;

  if (formatVersion !== 4) {
    return { status: "legacy" };
  }

  const analytics = parseAnalytics(reportData.analytics);
  const narrative = parseNarrative(reportData.narrative);

  if (!analytics || !narrative) {
    return { status: "invalid" };
  }

  return {
    report: {
      analytics,
      createdAt: row.created_at,
      formatVersion,
      id: row.id,
      model: row.model,
      narrative,
      periodEnd: row.period_end,
      periodStart: row.period_start,
      periodType: row.insight_type,
      relatedEntryIds: row.related_entry_ids ?? [],
      sourceEntryCount: row.source_entry_count ?? analytics.totalEntries,
      sourceLatestUpdatedAt: row.source_latest_updated_at ?? null,
      sourceSnapshotHash: row.source_snapshot_hash ?? "",
      updatedAt: row.updated_at,
      userId: row.user_id,
    },
    status: "ok",
  };
}

export function isAIInsightReport(value: unknown): value is AIInsightReport {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    isPeriodType(value.periodType) &&
    typeof value.periodStart === "string" &&
    typeof value.periodEnd === "string" &&
    parseAnalytics(value.analytics) !== null &&
    parseNarrative(value.narrative) !== null &&
    Array.isArray(value.relatedEntryIds) &&
    value.relatedEntryIds.every((id) => typeof id === "string") &&
    typeof value.sourceEntryCount === "number" &&
    (value.sourceLatestUpdatedAt === null ||
      typeof value.sourceLatestUpdatedAt === "string") &&
    typeof value.sourceSnapshotHash === "string" &&
    value.formatVersion === 4 &&
    (value.model === null || typeof value.model === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isAIInsightReportRow(value: unknown): value is AIInsightReportRow {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.user_id === "string" &&
    isPeriodType(value.insight_type) &&
    typeof value.period_start === "string" &&
    typeof value.period_end === "string" &&
    (value.related_entry_ids === null ||
      (Array.isArray(value.related_entry_ids) &&
        value.related_entry_ids.every((id) => typeof id === "string"))) &&
    (value.source_entry_count === undefined ||
      value.source_entry_count === null ||
      typeof value.source_entry_count === "number") &&
    (value.source_latest_updated_at === undefined ||
      value.source_latest_updated_at === null ||
      typeof value.source_latest_updated_at === "string") &&
    (value.source_snapshot_hash === undefined ||
      value.source_snapshot_hash === null ||
      typeof value.source_snapshot_hash === "string") &&
    (value.model === null || typeof value.model === "string") &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function parseAnalytics(value: unknown): ReportAnalytics | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isFiniteNumber(value.totalEntries) ||
    !isFiniteNumber(value.activeDays) ||
    !isFiniteNumber(value.longestStreak) ||
    !isFiniteNumber(value.averageEntriesPerActiveDay) ||
    (value.mostActiveDate !== null && typeof value.mostActiveDate !== "string") ||
    !isFiniteNumber(value.mostActiveDateEntryCount) ||
    !Array.isArray(value.moodDistribution) ||
    !Array.isArray(value.moodTimeline) ||
    !Array.isArray(value.activityTimeline) ||
    !Array.isArray(value.recurringThemes) ||
    !Array.isArray(value.entryTypeDistribution) ||
    !isFiniteNumber(value.entriesWithMood) ||
    !isFiniteNumber(value.entriesWithoutMood) ||
    typeof value.dataWasCapped !== "boolean"
  ) {
    return null;
  }

  const moodDistribution = value.moodDistribution.filter(
    isMoodDistributionItem,
  );
  const moodTimeline = value.moodTimeline.filter(isMoodTimelineItem);
  const activityTimeline = value.activityTimeline.filter(
    isActivityTimelineItem,
  );
  const recurringThemes = value.recurringThemes.filter(isThemeFrequencyItem);
  const entryTypeDistribution = value.entryTypeDistribution.filter(
    isEntryTypeDistributionItem,
  );

  if (
    moodDistribution.length !== value.moodDistribution.length ||
    moodTimeline.length !== value.moodTimeline.length ||
    activityTimeline.length !== value.activityTimeline.length ||
    recurringThemes.length !== value.recurringThemes.length ||
    entryTypeDistribution.length !== value.entryTypeDistribution.length
  ) {
    return null;
  }

  return {
    activeDays: value.activeDays,
    activityTimeline,
    averageEntriesPerActiveDay: value.averageEntriesPerActiveDay,
    dataWasCapped: value.dataWasCapped,
    entriesWithMood: value.entriesWithMood,
    entriesWithoutMood: value.entriesWithoutMood,
    entryTypeDistribution,
    longestStreak: value.longestStreak,
    moodDistribution,
    moodTimeline,
    mostActiveDate: value.mostActiveDate,
    mostActiveDateEntryCount: value.mostActiveDateEntryCount,
    recurringThemes,
    totalEntries: value.totalEntries,
  };
}

function parseNarrative(value: unknown): ReportNarrative | null {
  if (!isRecord(value)) {
    return null;
  }

  const overview = getString(value.overview);
  const emotionalJourney = getString(value.emotionalJourney);
  const nextFocus = getString(value.nextFocus);

  if (!overview || !emotionalJourney || !nextFocus) {
    return null;
  }

  return {
    activities: getStringArray(value.activities),
    challenges: getStringArray(value.challenges),
    dataQualityNote: getNullableString(value.dataQualityNote),
    emotionalFlow: getStringArray(value.emotionalFlow),
    emotionalJourney,
    enjoyed: getStringArray(value.enjoyed),
    improvements: getStringArray(value.improvements),
    nextFocus,
    overview,
    patterns: getStringArray(value.patterns),
    reflectionPrompt: getNullableString(value.reflectionPrompt),
    wins: getStringArray(value.wins),
  };
}

function isMoodDistributionItem(value: unknown): value is MoodDistributionItem {
  return (
    isRecord(value) &&
    typeof value.mood === "string" &&
    typeof value.count === "number" &&
    typeof value.percentage === "number"
  );
}

function isMoodTimelineItem(value: unknown): value is MoodTimelineItem {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    Array.isArray(value.moods) &&
    value.moods.every((mood) => typeof mood === "string") &&
    (value.dominantMood === null || typeof value.dominantMood === "string") &&
    typeof value.entryCount === "number"
  );
}

function isActivityTimelineItem(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.date === "string" &&
    typeof value.entryCount === "number"
  );
}

function isThemeFrequencyItem(value: unknown): value is ThemeFrequencyItem {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.count === "number" &&
    (value.source === "tag" || value.source === "content")
  );
}

function isEntryTypeDistributionItem(
  value: unknown,
): value is EntryTypeDistributionItem {
  return (
    isRecord(value) &&
    typeof value.type === "string" &&
    typeof value.count === "number" &&
    typeof value.percentage === "number"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPeriodType(value: unknown): value is AIInsightPeriodType {
  return value === "weekly" || value === "monthly";
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNullableString(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}
