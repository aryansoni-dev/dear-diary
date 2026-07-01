import { moodList } from "@/constants/moods";
import { createLocalDateKey } from "@/lib/calendar/dateUtils";
import type { JournalEntry, MoodId } from "@/types/journal";
import type { MoodLog } from "@/types/moodLog";

const moodOrder = moodList.map((mood) => mood.id);

export function getPreferredMoodForRange({
  entries,
  moodLogs,
  rangeEnd,
  rangeStart,
  userId,
}: {
  entries: JournalEntry[];
  moodLogs: MoodLog[];
  rangeEnd: Date;
  rangeStart: Date;
  userId: string | null;
}): MoodId | null {
  if (!userId) {
    return null;
  }

  const entryMoodsByDate = new Map<string, MoodId[]>();
  const latestMoodLogByDate = new Map<string, MoodLog>();

  entries.forEach((entry) => {
    if (
      entry.userId !== userId ||
      entry.deletedAt ||
      !entry.mood ||
      !isTimestampInRange(entry.createdAt, rangeStart, rangeEnd)
    ) {
      return;
    }

    const dateKey = createLocalDateKey(new Date(entry.createdAt));
    const moods = entryMoodsByDate.get(dateKey) ?? [];

    moods.push(entry.mood);
    entryMoodsByDate.set(dateKey, moods);
  });

  moodLogs.forEach((moodLog) => {
    if (
      moodLog.userId !== userId ||
      moodLog.deletedAt ||
      !isTimestampInRange(moodLog.createdAt, rangeStart, rangeEnd)
    ) {
      return;
    }

    const dateKey = createLocalDateKey(new Date(moodLog.createdAt));
    const currentMoodLog = latestMoodLogByDate.get(dateKey);

    if (!currentMoodLog || isMoodLogNewer(moodLog, currentMoodLog)) {
      latestMoodLogByDate.set(dateKey, moodLog);
    }
  });

  const dateKeys = new Set([
    ...entryMoodsByDate.keys(),
    ...latestMoodLogByDate.keys(),
  ]);
  const preferredDailyMoods = [...dateKeys].sort().flatMap((dateKey) => {
    const homeMood = latestMoodLogByDate.get(dateKey)?.mood;

    if (homeMood) {
      return [homeMood];
    }

    const entryMood = getTopMood(entryMoodsByDate.get(dateKey) ?? []);

    return entryMood ? [entryMood] : [];
  });

  return getTopMood(preferredDailyMoods);
}

function getTopMood(moods: MoodId[]) {
  const counts = moods.reduce<Partial<Record<MoodId, number>>>((result, mood) => {
    result[mood] = (result[mood] ?? 0) + 1;
    return result;
  }, {});
  let topMood: MoodId | null = null;
  let topCount = 0;

  moodOrder.forEach((mood) => {
    const count = counts[mood] ?? 0;

    if (count > topCount) {
      topMood = mood;
      topCount = count;
    }
  });

  return topMood;
}

function isMoodLogNewer(candidate: MoodLog, current: MoodLog) {
  return Date.parse(candidate.updatedAt) > Date.parse(current.updatedAt);
}

function isTimestampInRange(value: string, start: Date, end: Date) {
  const timestamp = Date.parse(value);

  return (
    Number.isFinite(timestamp) &&
    timestamp >= start.getTime() &&
    timestamp <= end.getTime()
  );
}
