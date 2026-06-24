import { moodList } from "@/constants/moods";
import {
  getInsightDateRange,
  getLocalDateKey,
  getStartOfLocalDay,
} from "@/lib/insights/insightPeriodUtils";
import type {
  DerivedInsights,
  InsightsPeriod,
  MoodCount,
  ThemeFrequency,
  WeekdayPattern,
} from "@/types/insights";
import type { JournalEntry, MoodId } from "@/types/journal";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const moodOrder = moodList.map((mood) => mood.id);

export function deriveInsights({
  entries,
  period,
  referenceDate,
  userId,
}: {
  entries: JournalEntry[];
  period: InsightsPeriod;
  referenceDate: Date;
  userId: string | null;
}): DerivedInsights {
  const dateRange = getInsightDateRange(period, referenceDate);
  const userEntries = entries.filter(
    (entry) => !entry.deletedAt && (!userId || entry.userId === userId),
  );
  const periodEntries = userEntries.filter((entry) =>
    isEntryInRange(entry, dateRange.start, dateRange.end),
  );
  const entriesByDate = groupEntriesByDate(periodEntries);
  const activeDays = entriesByDate.size;
  const moodDistribution = getMoodDistribution(periodEntries);
  const entriesWithoutMood = periodEntries.filter((entry) => !entry.mood).length;
  const themes = getThemeFrequencies(periodEntries);
  const weekdayPatterns = getWeekdayPatterns(periodEntries);

  return {
    activeEntries: periodEntries.length,
    dateRange,
    entriesWithoutMood,
    moodDistribution,
    summary: {
      activeDays,
      currentStreak: getReflectionStreak(userEntries),
      entryCount: periodEntries.length,
      topMood: moodDistribution[0]?.moodId ?? null,
    },
    themes,
    weekdayPatterns,
  };
}

function isEntryInRange(entry: JournalEntry, start: Date, end: Date) {
  const createdAt = Date.parse(entry.createdAt);

  return (
    Number.isFinite(createdAt) &&
    createdAt >= start.getTime() &&
    createdAt <= end.getTime()
  );
}

function groupEntriesByDate(entries: JournalEntry[]) {
  return entries.reduce<Map<string, JournalEntry[]>>((groups, entry) => {
    const dateKey = getLocalDateKey(new Date(entry.createdAt));
    const currentEntries = groups.get(dateKey) ?? [];

    groups.set(dateKey, [...currentEntries, entry]);
    return groups;
  }, new Map());
}

function getMoodDistribution(entries: JournalEntry[]): MoodCount[] {
  const moodCounts = entries.reduce<Partial<Record<MoodId, number>>>(
    (counts, entry) => {
      if (!entry.mood) {
        return counts;
      }

      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const totalMoodEntries = Object.values(moodCounts).reduce(
    (total, count) => total + (count ?? 0),
    0,
  );

  if (totalMoodEntries === 0) {
    return [];
  }

  return moodOrder
    .map((moodId) => ({
      count: moodCounts[moodId] ?? 0,
      moodId,
      percentage: Math.round(((moodCounts[moodId] ?? 0) / totalMoodEntries) * 100),
    }))
    .filter((item) => item.count > 0)
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return moodOrder.indexOf(first.moodId) - moodOrder.indexOf(second.moodId);
    });
}

function getWeekdayPatterns(entries: JournalEntry[]): WeekdayPattern[] {
  return weekdayLabels.map((label, index) => {
    const weekday = index + 1;
    const weekdayEntries = entries.filter(
      (entry) => getMondayBasedWeekday(new Date(entry.createdAt)) === weekday,
    );
    const activeDates = new Set(
      weekdayEntries.map((entry) => getLocalDateKey(new Date(entry.createdAt))),
    );

    return {
      activeDayCount: activeDates.size,
      dominantMood: getTopMood(weekdayEntries),
      entryCount: weekdayEntries.length,
      label,
      weekday,
    };
  });
}

function getThemeFrequencies(entries: JournalEntry[]): ThemeFrequency[] {
  const tagCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    entry.tags.forEach((tag) => {
      const label = tag.trim();

      if (label.length === 0) {
        return;
      }

      counts[label] = (counts[label] ?? 0) + 1;
    });

    return counts;
  }, {});
  const totalTaggedEntries = entries.filter((entry) => entry.tags.length > 0).length;

  if (totalTaggedEntries === 0) {
    return [];
  }

  return Object.entries(tagCounts)
    .map(([label, count]) => ({
      count,
      label,
      percentage: Math.round((count / totalTaggedEntries) * 100),
      source: "tag" as const,
    }))
    .sort((first, second) => {
      if (second.count !== first.count) {
        return second.count - first.count;
      }

      return first.label.localeCompare(second.label);
    })
    .slice(0, 5);
}

function getTopMood(entries: JournalEntry[]) {
  const moodCounts = getMoodDistribution(entries);

  return moodCounts[0]?.moodId ?? null;
}

function getReflectionStreak(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const entryDays = new Set(
    entries.map((entry) => getLocalDateKey(new Date(entry.createdAt))),
  );
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let cursor = getStartOfLocalDay(today);

  if (!entryDays.has(getLocalDateKey(cursor))) {
    if (!entryDays.has(getLocalDateKey(yesterday))) {
      return 0;
    }

    cursor = getStartOfLocalDay(yesterday);
  }

  let streak = 0;

  while (entryDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getMondayBasedWeekday(date: Date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}
