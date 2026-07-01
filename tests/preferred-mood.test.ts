import { getPreferredMoodForRange } from "../lib/insights/getPreferredMoodForRange";
import type { JournalEntry, MoodId } from "../types/journal";
import type { MoodLog } from "../types/moodLog";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const userId = "user_1";
const day = new Date(2026, 6, 1, 12);
const rangeStart = new Date(2026, 6, 1);
const rangeEnd = new Date(2026, 6, 1, 23, 59, 59, 999);

function createEntry(id: string, mood: MoodId): JournalEntry {
  return {
    content: "Entry",
    createdAt: day.toISOString(),
    id,
    mood,
    tags: [],
    title: "Entry",
    type: "free_write",
    updatedAt: day.toISOString(),
    userId,
  };
}

function createMoodLog(
  id: string,
  mood: MoodId,
  updatedAt = day.toISOString(),
): MoodLog {
  return {
    createdAt: day.toISOString(),
    deletedAt: null,
    id,
    intensity: null,
    mood,
    note: null,
    updatedAt,
    userId,
  };
}

const homeMoodWins = getPreferredMoodForRange({
  entries: [createEntry("entry_1", "sad"), createEntry("entry_2", "sad")],
  moodLogs: [createMoodLog("mood_1", "happy")],
  rangeEnd,
  rangeStart,
  userId,
});
assert(
  homeMoodWins === "happy",
  "The Home mood check-in must override entry moods for the same day.",
);

const entryFallback = getPreferredMoodForRange({
  entries: [
    createEntry("entry_1", "anxious"),
    createEntry("entry_2", "anxious"),
    createEntry("entry_3", "calm"),
  ],
  moodLogs: [],
  rangeEnd,
  rangeStart,
  userId,
});
assert(
  entryFallback === "anxious",
  "Entry moods must provide the daily fallback when no Home mood exists.",
);

const latestHomeMoodWins = getPreferredMoodForRange({
  entries: [],
  moodLogs: [
    createMoodLog("mood_1", "sad", new Date(2026, 6, 1, 12).toISOString()),
    createMoodLog("mood_2", "grateful", new Date(2026, 6, 1, 13).toISOString()),
  ],
  rangeEnd,
  rangeStart,
  userId,
});
assert(
  latestHomeMoodWins === "grateful",
  "The latest Home mood must be used if duplicate logs exist for a day.",
);

const deletedHomeMoodFallsBack = getPreferredMoodForRange({
  entries: [createEntry("entry_1", "calm")],
  moodLogs: [{ ...createMoodLog("mood_1", "sad"), deletedAt: day.toISOString() }],
  rangeEnd,
  rangeStart,
  userId,
});
assert(
  deletedHomeMoodFallsBack === "calm",
  "Deleted Home mood logs must not override entry moods.",
);
