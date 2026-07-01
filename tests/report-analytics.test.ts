import {
  buildReportAnalytics,
  type JournalEntryRow,
  type MoodLogRow,
} from "../supabase/functions/_shared/buildReportAnalytics";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function createEntry(
  id: string,
  content: string,
  tags: string[] = [],
): JournalEntryRow {
  return {
    content,
    created_at: `2026-06-${id.padStart(2, "0")}T10:00:00.000Z`,
    id,
    mood: null,
    prompt: null,
    tags,
    title: "Daily reflection",
    type: "free_write",
    updated_at: `2026-06-${id.padStart(2, "0")}T10:00:00.000Z`,
  };
}

const entries = [
  createEntry(
    "1",
    "I'll focus on the app. Every challenge affects everything, everything.",
    ["AI", "breakup", "breakup"],
  ),
  createEntry(
    "2",
    "I'll keep my focus while every night feels different and everything changes.",
    ["AI", "breakup"],
  ),
  createEntry("3", "Productivity productivity productivity helped today."),
];

const report = buildReportAnalytics({
  dataWasCapped: false,
  entries,
  periodEnd: new Date("2026-06-30T23:59:59.999Z"),
  periodStart: new Date("2026-06-01T00:00:00.000Z"),
  timezone: "UTC",
});
const themes = report.recurringThemes;

assert(
  themes.some((theme) => theme.name === "focus" && theme.count === 2),
  "A meaningful word repeated across separate entries should be a theme.",
);
assert(
  themes.some(
    (theme) =>
      theme.name === "ai" && theme.count === 2 && theme.source === "tag",
  ),
  "Short, intentional tags should remain valid themes.",
);
assert(
  themes.some((theme) => theme.name === "breakup" && theme.count === 2),
  "Duplicate tags in one entry should count only once per entry.",
);
assert(
  !themes.some((theme) =>
    ["every", "everything", "i'll", "night"].includes(theme.name),
  ),
  "Generic filler and contraction fragments must not become themes.",
);
assert(
  !themes.some((theme) => theme.name === "productivity"),
  "Repeating a word inside one entry must not make it recurring.",
);

function createMoodEntry(id: string, mood: string, date: string): JournalEntryRow {
  return {
    content: "Mood entry",
    created_at: date,
    id,
    mood,
    prompt: null,
    tags: [],
    title: "Mood entry",
    type: "free_write",
    updated_at: date,
  };
}

function createMoodLog(
  id: string,
  mood: string,
  createdAt: string,
  updatedAt = createdAt,
): MoodLogRow {
  return {
    created_at: createdAt,
    id,
    mood,
    updated_at: updatedAt,
  };
}

const moodAnalytics = buildReportAnalytics({
  dataWasCapped: false,
  entries: [
    createMoodEntry("mood_entry_1", "sad", "2026-06-10T10:00:00.000Z"),
    createMoodEntry("mood_entry_2", "sad", "2026-06-10T12:00:00.000Z"),
  ],
  moodLogs: [
    createMoodLog("mood_log_1", "happy", "2026-06-10T08:00:00.000Z"),
    createMoodLog(
      "mood_log_1_newer",
      "grateful",
      "2026-06-10T09:00:00.000Z",
      "2026-06-10T13:00:00.000Z",
    ),
    createMoodLog("mood_log_2", "calm", "2026-06-11T08:00:00.000Z"),
  ],
  periodEnd: new Date("2026-06-30T23:59:59.999Z"),
  periodStart: new Date("2026-06-01T00:00:00.000Z"),
  timezone: "UTC",
});
const entryDay = moodAnalytics.moodTimeline.find(
  (item) => item.date === "2026-06-10",
);
const moodOnlyDay = moodAnalytics.moodTimeline.find(
  (item) => item.date === "2026-06-11",
);

assert(
  entryDay?.dominantMood === "grateful",
  "The latest-updated Home mood check-in must override the day's dominant entry mood.",
);
assert(
  moodOnlyDay?.dominantMood === "calm" && moodOnlyDay.entryCount === 0,
  "A Home mood check-in must create a mood timeline day without an entry.",
);
