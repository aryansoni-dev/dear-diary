import {
  createLocalDateKey,
  formatCalendarMonth,
  isSameLocalDay,
  isSameLocalMonth,
  startOfLocalDay,
} from "@/lib/calendar/dateUtils";
import { getDominantMood } from "@/lib/calendar/getDominantMood";
import type {
  CalendarDayStatus,
  JournalCalendarMonth,
} from "@/types/journalCalendar";
import type { JournalEntry, MoodId } from "@/types/journal";

const calendarDayCountByRows = {
  fiveWeeks: 35,
  sixWeeks: 42,
} as const;

export const buildJournalCalendarMonth = ({
  currentUserId,
  entries,
  now = new Date(),
  visibleMonth,
}: {
  currentUserId: string;
  entries: JournalEntry[];
  now?: Date;
  visibleMonth: Date;
}): JournalCalendarMonth => {
  const monthStart = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );
  const nativeDay = monthStart.getDay();
  const leadingDayCount = (nativeDay + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - leadingDayCount);

  const lastDayOfMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  );
  const cellsThroughMonthEnd = leadingDayCount + lastDayOfMonth.getDate();
  const totalCellCount =
    cellsThroughMonthEnd <= calendarDayCountByRows.fiveWeeks
      ? calendarDayCountByRows.fiveWeeks
      : calendarDayCountByRows.sixWeeks;
  const entriesByDateKey = groupEntriesByLocalDate(entries, currentUserId);
  const today = startOfLocalDay(now);
  const days = Array.from({ length: totalCellCount }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return buildCalendarDay({
      date,
      entries: entriesByDateKey.get(createLocalDateKey(date)) ?? [],
      today,
      visibleMonth: monthStart,
    });
  });
  const currentMonthDays = days.filter((day) => day.isCurrentMonth);
  const activeMonthDays = currentMonthDays.filter((day) => day.entryCount > 0);
  const moodsPresent = getMoodsPresent(currentMonthDays);

  return {
    activeDays: activeMonthDays.length,
    days,
    label: formatCalendarMonth(monthStart),
    month: monthStart.getMonth(),
    moodsPresent,
    totalEntries: currentMonthDays.reduce(
      (total, day) => total + day.entryCount,
      0,
    ),
    year: monthStart.getFullYear(),
  };
};

export const hasMorningIntentionEntry = (entries: JournalEntry[]): boolean =>
  entries.some((entry) => entry.type === "morning_intention");

export const hasEveningReflectionEntry = (entries: JournalEntry[]): boolean =>
  entries.some((entry) => entry.type === "evening_reflection");

const groupEntriesByLocalDate = (
  entries: JournalEntry[],
  currentUserId: string,
) => {
  const entriesByDateKey = new Map<string, JournalEntry[]>();

  entries
    .filter((entry) => entry.userId === currentUserId && !entry.deletedAt)
    .forEach((entry) => {
      const dateKey = createLocalDateKey(new Date(entry.createdAt));
      const dateEntries = entriesByDateKey.get(dateKey) ?? [];

      entriesByDateKey.set(dateKey, [...dateEntries, entry]);
    });

  entriesByDateKey.forEach((dateEntries, dateKey) => {
    entriesByDateKey.set(
      dateKey,
      [...dateEntries].sort(
        (first, second) =>
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime(),
      ),
    );
  });

  return entriesByDateKey;
};

const buildCalendarDay = ({
  date,
  entries,
  today,
  visibleMonth,
}: {
  date: Date;
  entries: JournalEntry[];
  today: Date;
  visibleMonth: Date;
}): CalendarDayStatus => {
  const moodCounts = getMoodCounts(entries);

  return {
    date,
    dateKey: createLocalDateKey(date),
    dominantMood: getDominantMood(entries),
    entries,
    entryCount: entries.length,
    hasEntriesWithoutMood: entries.some((entry) => !entry.mood),
    hasEveningReflection: hasEveningReflectionEntry(entries),
    hasMorningIntention: hasMorningIntentionEntry(entries),
    isCurrentMonth: isSameLocalMonth(date, visibleMonth),
    isFuture: startOfLocalDay(date).getTime() > today.getTime(),
    isToday: isSameLocalDay(date, today),
    moodCounts,
  };
};

const getMoodCounts = (entries: JournalEntry[]) =>
  entries.reduce<Partial<Record<MoodId, number>>>((counts, entry) => {
    if (entry.mood) {
      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
    }

    return counts;
  }, {});

const getMoodsPresent = (days: CalendarDayStatus[]): MoodId[] => {
  const moods = new Set<MoodId>();

  days.forEach((day) => {
    if (day.dominantMood) {
      moods.add(day.dominantMood);
    }
  });

  return Array.from(moods);
};
