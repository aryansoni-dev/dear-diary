export type ReportNarrative = {
  overview: string;
  activities: string[];
  emotionalJourney: string;
  emotionalFlow: string[];
  enjoyed: string[];
  challenges: string[];
  wins: string[];
  patterns: string[];
  improvements: string[];
  nextFocus: string;
  reflectionPrompt: string | null;
  dataQualityNote: string | null;
};

export type ReportNarrativeParseResult =
  | { narrative: ReportNarrative; ok: true }
  | { ok: false; reason: string };

const danglingEndingWords = new Set([
  "a",
  "about",
  "an",
  "and",
  "as",
  "at",
  "because",
  "being",
  "but",
  "by",
  "for",
  "from",
  "if",
  "in",
  "into",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "which",
  "while",
  "with",
]);

export function parseReportNarrative(
  value: string,
  dataWasCapped: boolean,
): ReportNarrativeParseResult {
  const parsedValue = parseJsonObjectFromText(value);

  if (!parsedValue) {
    return { ok: false, reason: "invalid_json" };
  }

  const overview = getRequiredString(parsedValue.overview);
  const emotionalJourney = getRequiredString(parsedValue.emotionalJourney);
  const nextFocus = getRequiredString(parsedValue.nextFocus);
  const activities = getStringArray(parsedValue.activities);
  const challenges = getStringArray(parsedValue.challenges);
  const emotionalFlow = getStringArray(parsedValue.emotionalFlow);
  const enjoyed = getStringArray(parsedValue.enjoyed);
  const improvements = getStringArray(parsedValue.improvements);
  const patterns = getStringArray(parsedValue.patterns);
  const wins = getStringArray(parsedValue.wins);
  const reflectionPrompt = getNullableString(parsedValue.reflectionPrompt);
  const providerDataQualityNote = getNullableString(
    parsedValue.dataQualityNote,
  );

  if (!overview) {
    return { ok: false, reason: "invalid_overview" };
  }

  if (!emotionalJourney) {
    return { ok: false, reason: "invalid_emotional_journey" };
  }

  if (!nextFocus) {
    return { ok: false, reason: "invalid_next_focus" };
  }

  if (!activities) {
    return { ok: false, reason: "invalid_activities" };
  }

  if (!challenges) {
    return { ok: false, reason: "invalid_challenges" };
  }

  if (!emotionalFlow) {
    return { ok: false, reason: "invalid_emotional_flow" };
  }

  if (!enjoyed) {
    return { ok: false, reason: "invalid_enjoyed" };
  }

  if (!improvements) {
    return { ok: false, reason: "invalid_improvements" };
  }

  if (!patterns) {
    return { ok: false, reason: "invalid_patterns" };
  }

  if (!wins) {
    return { ok: false, reason: "invalid_wins" };
  }

  if (!reflectionPrompt.ok) {
    return { ok: false, reason: "invalid_reflection_prompt" };
  }

  if (!providerDataQualityNote.ok) {
    return { ok: false, reason: "invalid_data_quality_note" };
  }

  return {
    narrative: {
      activities,
      challenges,
      dataQualityNote: dataWasCapped
        ? "This report was generated from the first 250 entries in the selected period."
        : providerDataQualityNote.value,
      emotionalFlow,
      emotionalJourney,
      enjoyed,
      improvements,
      nextFocus,
      overview,
      patterns,
      reflectionPrompt: reflectionPrompt.value,
      wins,
    },
    ok: true,
  };
}

function parseJsonObjectFromText(value: string) {
  const cleanedValue = stripJsonCodeFence(value);

  try {
    const parsedValue: unknown = JSON.parse(cleanedValue);

    return isRecord(parsedValue) ? parsedValue : null;
  } catch {
    const objectStartIndex = cleanedValue.indexOf("{");
    const objectEndIndex = cleanedValue.lastIndexOf("}");

    if (objectStartIndex < 0 || objectEndIndex <= objectStartIndex) {
      return null;
    }

    try {
      const parsedValue: unknown = JSON.parse(
        cleanedValue.slice(objectStartIndex, objectEndIndex + 1),
      );

      return isRecord(parsedValue) ? parsedValue : null;
    } catch {
      return null;
    }
  }
}

function stripJsonCodeFence(value: string) {
  const trimmedValue = value.trim();
  const fenceMatch = trimmedValue.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fenceMatch?.[1]?.trim() ?? trimmedValue;
}

function getRequiredString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return isCompleteNarrativeText(trimmedValue) ? trimmedValue : null;
}

function getNullableString(value: unknown) {
  if (value === null || value === undefined) {
    return { ok: true as const, value: null };
  }

  if (typeof value !== "string") {
    return { ok: false as const };
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { ok: true as const, value: null };
  }

  return isCompleteNarrativeText(trimmedValue)
    ? { ok: true as const, value: trimmedValue }
    : { ok: false as const };
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  if (!value.every((item) => typeof item === "string")) {
    return null;
  }

  const items = value.map((item) => item.trim()).filter(Boolean);

  return items.every(isCompleteNarrativeText) ? items : null;
}

function isCompleteNarrativeText(value: string) {
  if (!value || /[,;:]$/.test(value) || /(?:\.{3}|…)$/.test(value)) {
    return false;
  }

  const lastWord = value
    .match(/[A-Za-z]+[.!?\"']?$/)?.[0]
    .replace(/[.!?\"']+$/g, "")
    .toLowerCase();

  return !lastWord || !danglingEndingWords.has(lastWord);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
