import type { AIInsightPeriodType } from "@/types/aiInsightReport";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

export function formatReportDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return dateFormatter.format(parsedDate);
}

export function formatMoodLabel(mood: string | null) {
  if (!mood) {
    return "No mood";
  }

  return mood
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function formatEntryTypeLabel(type: string) {
  return type
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function getReportTitle(periodType: AIInsightPeriodType) {
  return periodType === "weekly" ? "Weekly Reflection" : "Monthly Reflection";
}

export function getGenerateLabel(periodType: AIInsightPeriodType) {
  return periodType === "weekly"
    ? "Generate Weekly Reflection"
    : "Generate Monthly Reflection";
}
