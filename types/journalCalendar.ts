import type { JournalEntry, MoodId } from "@/types/journal";

export type JournalHistoryViewMode = "list" | "calendar";

export type CalendarDayStatus = {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isFuture: boolean;
  isToday: boolean;
  entries: JournalEntry[];
  entryCount: number;
  moodCounts: Partial<Record<MoodId, number>>;
  dominantMood: MoodId | null;
  hasEntriesWithoutMood: boolean;
  hasMorningIntention: boolean;
  hasEveningReflection: boolean;
};

export type JournalCalendarMonth = {
  year: number;
  month: number;
  label: string;
  days: CalendarDayStatus[];
  totalEntries: number;
  activeDays: number;
  moodsPresent: MoodId[];
};
