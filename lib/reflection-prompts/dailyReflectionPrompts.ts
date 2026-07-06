// @ts-expect-error Node's built-in TypeScript test runner requires an explicit extension.
import { dailyReflectionPromptPool } from "../../data/daily-reflection-prompts.ts";
import type {
  DailyReflectionPromptBundle,
  DailyReflectionPrompts,
  ReflectionPeriod,
} from "@/types/dailyReflectionPrompt";
import type { JournalEntry } from "@/types/journal";

export const dailyReflectionPromptMinLength = 15;
export const dailyReflectionPromptMaxLength = 160;
export const dailyReflectionPromptHistoryDays = 14;

const periods: ReflectionPeriod[] = ["morning", "afternoon", "evening"];
const unsafePromptPattern =
  /\b(anxi(?:ety|ous)|depress(?:ed|ion|ive)|diagnos(?:e|ed|is)|medical advice|self[- ]harm|suicid(?:e|al)|therap(?:y|ist|eutic)|trauma(?:tic)?|password|home address|bank account|credit card|financial information)\b/i;
const providerErrorPattern =
  /\b(error|bad gateway|rate limit|request failed|service unavailable|unauthorized)\b/i;

export function getReflectionPeriod(date: Date): ReflectionPeriod {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }

  return "evening";
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function hasAnsweredReflectionPrompt(params: {
  date: Date;
  entries: readonly Pick<
    JournalEntry,
    "content" | "createdAt" | "deletedAt" | "prompt" | "type"
  >[];
  prompt: string | null;
}): boolean {
  const prompt = params.prompt?.trim();

  if (!prompt) {
    return false;
  }

  const dateKey = getLocalDateKey(params.date);

  return params.entries.some(
    (entry) =>
      entry.type === "ai_reflection" &&
      !entry.deletedAt &&
      entry.prompt?.trim() === prompt &&
      entry.content.trim().length > 0 &&
      getLocalDateKey(new Date(entry.createdAt)) === dateKey,
  );
}

export function getMillisecondsUntilNextReflectionChange(date: Date): number {
  const candidates = [
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5),
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12),
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17),
  ];
  const nextChange = candidates
    .map((candidate) => candidate.getTime())
    .filter((candidateTime) => candidateTime > date.getTime())
    .sort((left, right) => left - right)[0];

  return Math.max((nextChange ?? date.getTime() + 60_000) - date.getTime(), 1);
}

export function isValidDailyReflectionPrompts(
  value: unknown,
  recentPrompts: readonly string[] = [],
): value is DailyReflectionPrompts {
  if (!isRecord(value)) {
    return false;
  }

  const keys = Object.keys(value).sort();

  if (
    keys.length !== periods.length ||
    !periods.every((period) => keys.includes(period))
  ) {
    return false;
  }

  const promptValues = periods.map((period) => value[period]);

  if (!promptValues.every(isValidReflectionQuestion)) {
    return false;
  }

  const normalizedPrompts = promptValues.map((prompt) =>
    normalizePrompt(prompt as string),
  );

  if (new Set(normalizedPrompts).size !== periods.length) {
    return false;
  }

  if (hasNearDuplicate(normalizedPrompts)) {
    return false;
  }

  const normalizedRecentPrompts = new Set(recentPrompts.map(normalizePrompt));

  return normalizedPrompts.every(
    (prompt) => !normalizedRecentPrompts.has(prompt),
  );
}

export function isValidDailyReflectionPromptBundle(
  value: unknown,
): value is DailyReflectionPromptBundle {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.dateKey === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.dateKey) &&
    typeof value.generatedAt === "string" &&
    Number.isFinite(Date.parse(value.generatedAt)) &&
    (value.source === "ai" || value.source === "fallback") &&
    typeof value.timezone === "string" &&
    value.timezone.trim().length > 0 &&
    isValidDailyReflectionPrompts(value.prompts)
  );
}

export function createStableFallbackBundle(params: {
  date: Date;
  dateKey: string;
  recentPrompts?: readonly string[];
  timezone: string;
  userId: string;
}): DailyReflectionPromptBundle {
  const selectedPrompts = new Set<string>();
  const recentPrompts = new Set(
    (params.recentPrompts ?? []).map(normalizePrompt),
  );
  const prompts = periods.reduce<Partial<DailyReflectionPrompts>>(
    (result, period) => {
      const pool = dailyReflectionPromptPool[period];
      const startIndex = stableHash(
        `${params.userId}:${params.dateKey}:${period}`,
      ) % pool.length;
      const prompt = findAvailablePrompt({
        pool,
        recentPrompts,
        selectedPrompts,
        startIndex,
      });

      result[period] = prompt;
      selectedPrompts.add(normalizePrompt(prompt));

      return result;
    },
    {},
  );

  return {
    dateKey: params.dateKey,
    generatedAt: params.date.toISOString(),
    prompts: prompts as DailyReflectionPrompts,
    source: "fallback",
    timezone: params.timezone,
  };
}

export function getRecentPromptTexts(
  bundles: Record<string, DailyReflectionPromptBundle> | undefined,
  currentDateKey: string,
): string[] {
  if (!bundles) {
    return [];
  }

  return Object.entries(bundles)
    .filter(([dateKey]) => dateKey !== currentDateKey)
    .sort(([leftDateKey], [rightDateKey]) =>
      rightDateKey.localeCompare(leftDateKey),
    )
    .slice(0, dailyReflectionPromptHistoryDays)
    .flatMap(([, bundle]) => periods.map((period) => bundle.prompts[period]));
}

function isValidReflectionQuestion(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const prompt = value.trim();
  const questionMarkCount = [...prompt].filter(
    (character) => character === "?",
  ).length;

  return (
    prompt.length >= dailyReflectionPromptMinLength &&
    prompt.length <= dailyReflectionPromptMaxLength &&
    questionMarkCount === 1 &&
    prompt.endsWith("?") &&
    !/[.!]/.test(prompt.slice(0, -1)) &&
    !/[\r\n]/.test(prompt) &&
    !prompt.includes("```") &&
    !prompt.startsWith("{") &&
    !unsafePromptPattern.test(prompt) &&
    !providerErrorPattern.test(prompt)
  );
}

function hasNearDuplicate(prompts: string[]) {
  for (let firstIndex = 0; firstIndex < prompts.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < prompts.length;
      secondIndex += 1
    ) {
      if (getWordOverlap(prompts[firstIndex], prompts[secondIndex]) >= 0.8) {
        return true;
      }
    }
  }

  return false;
}

function getWordOverlap(firstPrompt: string, secondPrompt: string) {
  const firstWords = new Set(firstPrompt.split(" ").filter(Boolean));
  const secondWords = new Set(secondPrompt.split(" ").filter(Boolean));
  const smallerSet =
    firstWords.size <= secondWords.size ? firstWords : secondWords;
  const largerSet = smallerSet === firstWords ? secondWords : firstWords;
  let sharedWordCount = 0;

  smallerSet.forEach((word) => {
    if (largerSet.has(word)) {
      sharedWordCount += 1;
    }
  });

  return smallerSet.size === 0 ? 0 : sharedWordCount / smallerSet.size;
}

function findAvailablePrompt(params: {
  pool: readonly string[];
  recentPrompts: Set<string>;
  selectedPrompts: Set<string>;
  startIndex: number;
}) {
  for (let offset = 0; offset < params.pool.length; offset += 1) {
    const prompt = params.pool[(params.startIndex + offset) % params.pool.length];
    const normalizedPrompt = normalizePrompt(prompt);

    if (
      !params.recentPrompts.has(normalizedPrompt) &&
      !params.selectedPrompts.has(normalizedPrompt)
    ) {
      return prompt;
    }
  }

  return params.pool[params.startIndex];
}

function normalizePrompt(prompt: string) {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function stableHash(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
