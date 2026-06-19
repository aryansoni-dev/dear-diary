export const reportColors = {
  activityEmpty: "#F4EFFA",
  activityHigh: "#FF2056",
  activityLow: "#FFDDE8",
  activityMedium: "#FF8AA8",
  background: "#FAF7F2",
  border: "#F0E7EE",
  card: "#FFFFFF",
  disabled: "#E4E4E7",
  errorText: "#A60033",
  explanationText: "#52525B",
  heading: "#18181B",
  ivory: "#FFF8F1",
  lavender: "#F4EFFA",
  muted: "#71717B",
  pinkSoft: "#FFDDE8",
  primary: "#FF2056",
  rose: "#FFE2EA",
  text: "#3F3F46",
} as const;

export const moodDistributionColors = {
  emptyText: reportColors.muted,
  labelText: reportColors.text,
  noteText: reportColors.muted,
  valueText: reportColors.muted,
  track: reportColors.lavender,
} as const;

export const moodJourneyColors = {
  cardDateText: reportColors.muted,
  emptyText: reportColors.muted,
  explanationText: reportColors.explanationText,
  entryCountText: reportColors.muted,
  moodText: reportColors.heading,
} as const;

export const moodReportColors = [
  "#FF2056",
  "#8B5CF6",
  "#0284C7",
  "#16A34A",
  "#F59E0B",
  "#DB2777",
  "#64748B",
] as const;
