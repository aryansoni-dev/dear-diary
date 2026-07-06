// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import * as dailyPromptUtils from "../lib/reflection-prompts/dailyReflectionPrompts.ts";

const {
  createStableFallbackBundle,
  getLocalDateKey,
  getMillisecondsUntilNextReflectionChange,
  getReflectionPeriod,
  hasAnsweredReflectionPrompt,
  isValidDailyReflectionPrompts,
} = dailyPromptUtils;

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function localDate(hour: number, minute: number) {
  return new Date(2026, 6, 6, hour, minute, 0, 0);
}

const periodCases = [
  { date: localDate(4, 59), expected: "evening" },
  { date: localDate(5, 0), expected: "morning" },
  { date: localDate(11, 59), expected: "morning" },
  { date: localDate(12, 0), expected: "afternoon" },
  { date: localDate(16, 59), expected: "afternoon" },
  { date: localDate(17, 0), expected: "evening" },
  { date: localDate(23, 59), expected: "evening" },
  { date: localDate(0, 0), expected: "evening" },
] as const;

periodCases.forEach(({ date, expected }) => {
  assert(
    getReflectionPeriod(date) === expected,
    `${date.toString()} must resolve to ${expected}.`,
  );
});

assert(
  getLocalDateKey(new Date(2026, 6, 6, 23, 59)) === "2026-07-06",
  "The date key must use local date parts rather than UTC.",
);
assert(
  getLocalDateKey(new Date(2026, 7, 1, 0, 0)) === "2026-08-01",
  "The date key must handle month boundaries.",
);
assert(
  getLocalDateKey(new Date(2027, 0, 1, 0, 0)) === "2027-01-01",
  "The date key must handle year boundaries.",
);
assert(
  getMillisecondsUntilNextReflectionChange(localDate(11, 59)) === 60_000,
  "The reflection clock must schedule the noon boundary without polling.",
);

const answeredPrompt = "What would make today feel meaningful to you?";
const answeredEntry = {
  content: "Making time for an unhurried walk would feel meaningful.",
  createdAt: localDate(9, 30).toISOString(),
  prompt: answeredPrompt,
  type: "ai_reflection" as const,
};

assert(
  hasAnsweredReflectionPrompt({
    date: localDate(10, 0),
    entries: [answeredEntry],
    prompt: answeredPrompt,
  }),
  "A saved answer for the current local date must hide its prompt.",
);
assert(
  !hasAnsweredReflectionPrompt({
    date: localDate(10, 0),
    entries: [{ ...answeredEntry, content: "" }],
    prompt: answeredPrompt,
  }),
  "Saving only the prompt without an answer must not hide it.",
);
assert(
  !hasAnsweredReflectionPrompt({
    date: new Date(2026, 6, 7, 10),
    entries: [answeredEntry],
    prompt: answeredPrompt,
  }),
  "An answer from another local date must not hide today's prompt.",
);
assert(
  !hasAnsweredReflectionPrompt({
    date: localDate(14, 0),
    entries: [answeredEntry],
    prompt: "What has taken most of your attention so far today?",
  }),
  "Answering one period must not hide a different period's prompt.",
);
assert(
  !hasAnsweredReflectionPrompt({
    date: localDate(10, 0),
    entries: [{ ...answeredEntry, deletedAt: localDate(10, 30).toISOString() }],
    prompt: answeredPrompt,
  }),
  "A deleted answer must not keep its prompt hidden.",
);

const validPrompts = {
  afternoon: "What has taken most of your attention so far today?",
  evening: "What part of today would you like to understand better?",
  morning: "What would make today feel meaningful to you?",
};

assert(
  isValidDailyReflectionPrompts(validPrompts),
  "Three distinct, concise questions must be valid.",
);
assert(
  !isValidDailyReflectionPrompts({
    afternoon: validPrompts.afternoon,
    evening: validPrompts.evening,
  }),
  "A missing morning prompt must be rejected.",
);
assert(
  !isValidDailyReflectionPrompts({
    ...validPrompts,
    afternoon: "",
  }),
  "An empty prompt must be rejected.",
);
assert(
  !isValidDailyReflectionPrompts({
    afternoon: validPrompts.morning,
    evening: validPrompts.morning,
    morning: validPrompts.morning,
  }),
  "Duplicate prompts must be rejected.",
);
assert(
  !isValidDailyReflectionPrompts({
    ...validPrompts,
    evening: `${"What would you like to notice about this day and carry forward ".repeat(4)}?`,
  }),
  "A prompt over 160 characters must be rejected rather than truncated.",
);
assert(
  !isValidDailyReflectionPrompts({
    ...validPrompts,
    morning: 42,
  }),
  "A non-string prompt must be rejected.",
);
assert(
  !isValidDailyReflectionPrompts({
    ...validPrompts,
    morning: "```json What would make today meaningful to you? ```",
  }),
  "Markdown-fenced content must be rejected.",
);
assert(
  !isValidDailyReflectionPrompts({
    ...validPrompts,
    morning: "Why did the service unavailable error happen today?",
  }),
  "Provider error text must be rejected.",
);
assert(
  !isValidDailyReflectionPrompts(validPrompts, [validPrompts.morning]),
  "An exact recent prompt must be rejected.",
);

const fallbackParams = {
  date: localDate(9, 0),
  dateKey: "2026-07-06",
  timezone: "Asia/Kolkata",
  userId: "user_a",
};
const firstFallback = createStableFallbackBundle(fallbackParams);
const repeatedFallback = createStableFallbackBundle({
  ...fallbackParams,
  date: localDate(10, 30),
});
const nextDayFallback = createStableFallbackBundle({
  ...fallbackParams,
  date: new Date(2026, 6, 7, 9),
  dateKey: "2026-07-07",
});
const secondUserFallback = createStableFallbackBundle({
  ...fallbackParams,
  userId: "user_b",
});

assert(
  JSON.stringify(firstFallback.prompts) ===
    JSON.stringify(repeatedFallback.prompts),
  "The same user and date must receive a stable fallback bundle.",
);
assert(
  new Set(Object.values(firstFallback.prompts)).size === 3,
  "Fallback periods must contain three distinct prompts.",
);
assert(
  JSON.stringify(firstFallback.prompts) !==
    JSON.stringify(nextDayFallback.prompts),
  "A different local date should vary the fallback bundle.",
);
assert(
  JSON.stringify(firstFallback.prompts) !==
    JSON.stringify(secondUserFallback.prompts),
  "Fallback selection must be user-scoped.",
);

const recentAwareFallback = createStableFallbackBundle({
  ...fallbackParams,
  recentPrompts: Object.values(firstFallback.prompts),
});

assert(
  Object.values(recentAwareFallback.prompts).every(
    (prompt) => !Object.values(firstFallback.prompts).includes(prompt),
  ),
  "Fallback selection must avoid exact recent repeats when alternatives exist.",
);
