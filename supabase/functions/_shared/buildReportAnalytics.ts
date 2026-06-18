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

export type JournalEntryRow = {
  content: string;
  created_at: string;
  id: string;
  mood: string | null;
  prompt: string | null;
  tags?: string[] | null;
  title: string;
  type: string;
  updated_at: string;
};

const stopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "because",
  "been",
  "before",
  "being",
  "could",
  "daily",
  "dear",
  "diary",
  "feel",
  "felt",
  "from",
  "have",
  "into",
  "journal",
  "just",
  "like",
  "more",
  "much",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "this",
  "today",
  "want",
  "were",
  "what",
  "when",
  "with",
  "would",
  "your",
]);

export function buildReportAnalytics({
  dataWasCapped,
  entries,
  periodEnd,
  periodStart,
  timezone,
}: {
  dataWasCapped: boolean;
  entries: JournalEntryRow[];
  periodEnd: Date;
  periodStart: Date;
  timezone?: string;
}): ReportAnalytics {
  const totalEntries = entries.length;
  const entryCountByDate = countEntriesByDate(entries, timezone);
  const activityTimeline = buildActivityTimeline({
    entryCountByDate,
    periodEnd,
    periodStart,
    timezone,
  });
  const activeDates = activityTimeline
    .filter((item) => item.entryCount > 0)
    .map((item) => item.date);
  const activeDays = activeDates.length;
  const mostActive = getMostActiveDate(activityTimeline);
  const moodDistribution = getMoodDistribution(entries);
  const entriesWithMood = entries.filter((entry) => entry.mood).length;

  return {
    activeDays,
    activityTimeline,
    averageEntriesPerActiveDay:
      activeDays === 0 ? 0 : roundToTwo(totalEntries / activeDays),
    dataWasCapped,
    entriesWithMood,
    entriesWithoutMood: totalEntries - entriesWithMood,
    entryTypeDistribution: getEntryTypeDistribution(entries),
    longestStreak: getLongestStreak(activeDates),
    moodDistribution,
    moodTimeline: getMoodTimeline(entries, entryCountByDate, timezone),
    mostActiveDate: mostActive.date,
    mostActiveDateEntryCount: mostActive.count,
    recurringThemes: getRecurringThemes(entries),
    totalEntries,
  };
}

function countEntriesByDate(entries: JournalEntryRow[], timezone?: string) {
  return entries.reduce<Record<string, number>>((counts, entry) => {
    const dateKey = getDateKey(new Date(entry.created_at), timezone);
    counts[dateKey] = (counts[dateKey] ?? 0) + 1;
    return counts;
  }, {});
}

function buildActivityTimeline({
  entryCountByDate,
  periodEnd,
  periodStart,
  timezone,
}: {
  entryCountByDate: Record<string, number>;
  periodEnd: Date;
  periodStart: Date;
  timezone?: string;
}): ActivityTimelineItem[] {
  const timeline: ActivityTimelineItem[] = [];
  const seenDates = new Set<string>();
  const cursor = new Date(periodStart);

  while (cursor.getTime() <= periodEnd.getTime()) {
    const date = getDateKey(cursor, timezone);

    if (!seenDates.has(date)) {
      timeline.push({
        date,
        entryCount: entryCountByDate[date] ?? 0,
      });
      seenDates.add(date);
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return timeline;
}

function getMoodDistribution(entries: JournalEntryRow[]) {
  const counts = entries.reduce<Record<string, number>>((moodCounts, entry) => {
    const mood = entry.mood?.trim();

    if (!mood) {
      return moodCounts;
    }

    moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
    return moodCounts;
  }, {});
  const totalWithMood = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return Object.entries(counts)
    .map(([mood, count]) => ({
      count,
      mood,
      percentage: totalWithMood === 0 ? 0 : roundToTwo((count / totalWithMood) * 100),
    }))
    .sort(sortByCountThenName);
}

function getMoodTimeline(
  entries: JournalEntryRow[],
  entryCountByDate: Record<string, number>,
  timezone?: string,
) {
  const moodsByDate = entries.reduce<Record<string, string[]>>((groups, entry) => {
    const date = getDateKey(new Date(entry.created_at), timezone);

    if (!groups[date]) {
      groups[date] = [];
    }

    if (entry.mood?.trim()) {
      groups[date].push(entry.mood.trim());
    }

    return groups;
  }, {});

  return Object.keys(entryCountByDate)
    .sort()
    .map((date) => ({
      date,
      dominantMood: getDominantMood(moodsByDate[date] ?? []),
      entryCount: entryCountByDate[date],
      moods: [...new Set(moodsByDate[date] ?? [])],
    }));
}

function getDominantMood(moods: string[]) {
  if (moods.length === 0) {
    return null;
  }

  const counts = moods.reduce<Record<string, number>>((moodCounts, mood) => {
    moodCounts[mood] = (moodCounts[mood] ?? 0) + 1;
    return moodCounts;
  }, {});

  return Object.entries(counts).sort(sortByCountThenName)[0]?.[0] ?? null;
}

function getEntryTypeDistribution(entries: JournalEntryRow[]) {
  const counts = entries.reduce<Record<string, number>>((typeCounts, entry) => {
    const type = entry.type.trim() || "unknown";
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
    return typeCounts;
  }, {});

  return Object.entries(counts)
    .map(([type, count]) => ({
      count,
      percentage: entries.length === 0 ? 0 : roundToTwo((count / entries.length) * 100),
      type,
    }))
    .sort(sortByCountThenName);
}

function getRecurringThemes(entries: JournalEntryRow[]) {
  const tagCounts = new Map<string, number>();
  const contentCounts = new Map<string, number>();

  entries.forEach((entry) => {
    (entry.tags ?? []).forEach((tag) => {
      const normalizedTag = normalizeTheme(tag);

      if (normalizedTag) {
        tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) ?? 0) + 1);
      }
    });

    const searchableText = `${entry.title} ${entry.content}`;
    const words = searchableText.toLowerCase().match(/[a-z][a-z']+/g) ?? [];

    words.forEach((word) => {
      const normalizedWord = normalizeTheme(word);

      if (normalizedWord && !tagCounts.has(normalizedWord)) {
        contentCounts.set(
          normalizedWord,
          (contentCounts.get(normalizedWord) ?? 0) + 1,
        );
      }
    });
  });

  const tagThemes = Array.from(tagCounts.entries()).map(([name, count]) => ({
    count,
    name,
    source: "tag" as const,
  }));
  const contentThemes = Array.from(contentCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({
      count,
      name,
      source: "content" as const,
    }));

  return [...tagThemes, ...contentThemes].sort(sortByCountThenName).slice(0, 8);
}

function getMostActiveDate(timeline: ActivityTimelineItem[]) {
  const mostActive = timeline.reduce<ActivityTimelineItem | null>(
    (current, item) => {
      if (!current || item.entryCount > current.entryCount) {
        return item;
      }

      return current;
    },
    null,
  );

  if (!mostActive || mostActive.entryCount === 0) {
    return { count: 0, date: null };
  }

  return { count: mostActive.entryCount, date: mostActive.date };
}

function getLongestStreak(activeDates: string[]) {
  if (activeDates.length === 0) {
    return 0;
  }

  const sortedDates = [...new Set(activeDates)].sort();
  let longestStreak = 1;
  let currentStreak = 1;

  for (let index = 1; index < sortedDates.length; index += 1) {
    const previous = Date.parse(`${sortedDates[index - 1]}T00:00:00Z`);
    const current = Date.parse(`${sortedDates[index]}T00:00:00Z`);
    const dayDifference = Math.round((current - previous) / 86400000);

    if (dayDifference === 1) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return longestStreak;
}

function getDateKey(date: Date, timezone?: string) {
  if (timezone && isValidTimezone(timezone)) {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      timeZone: timezone,
      year: "numeric",
    }).formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  }

  return date.toISOString().slice(0, 10);
}

function isValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function normalizeTheme(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[_-]+/g, " ");

  if (normalized.length < 4 || stopWords.has(normalized)) {
    return null;
  }

  return normalized.replace(/\s+/g, " ");
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function sortByCountThenName<T extends { count: number; name?: string; mood?: string; type?: string }>(
  first: T,
  second: T,
) {
  const countDifference = second.count - first.count;

  if (countDifference !== 0) {
    return countDifference;
  }

  const firstName = first.name ?? first.mood ?? first.type ?? "";
  const secondName = second.name ?? second.mood ?? second.type ?? "";

  return firstName.localeCompare(secondName);
}
