import type { AIInsightReport } from "@/types/aiInsightReport";
import type { EntryAIReflection } from "@/types/entryReflection";

export function getEntryReflectionTextLength(reflection: EntryAIReflection) {
  return getCombinedTextLength([
    reflection.summary,
    ...reflection.emotions,
    ...reflection.themes,
    reflection.observation,
    reflection.followUpQuestion,
    reflection.suggestion,
  ]);
}

export function getAIInsightReportTextLength(report: AIInsightReport) {
  const narrative = report.narrative;

  return getCombinedTextLength([
    narrative.overview,
    ...narrative.activities,
    narrative.emotionalJourney,
    ...narrative.emotionalFlow,
    ...narrative.enjoyed,
    ...narrative.challenges,
    ...narrative.wins,
    ...narrative.patterns,
    ...narrative.improvements,
    narrative.nextFocus,
    narrative.reflectionPrompt,
    narrative.dataQualityNote,
  ]);
}

function getCombinedTextLength(values: (string | null)[]) {
  return values.reduce(
    (total, value) => total + (typeof value === "string" ? value.length : 0),
    0,
  );
}

