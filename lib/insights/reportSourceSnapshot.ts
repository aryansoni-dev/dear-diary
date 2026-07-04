type ReportSource = {
  id: string;
  updatedAt: string;
};

export function buildReportSourceSnapshotInput(
  entries: ReportSource[],
  moodLogs: ReportSource[],
) {
  return [
    ...entries.map(
      (entry) =>
        `entry:${entry.id}:${normalizeReportSourceTimestamp(entry.updatedAt)}`,
    ),
    ...moodLogs.map(
      (moodLog) =>
        `mood:${moodLog.id}:${normalizeReportSourceTimestamp(moodLog.updatedAt)}`,
    ),
  ]
    .sort()
    .join("|");
}

export function normalizeReportSourceTimestamp(timestamp: string) {
  const parsedTimestamp = Date.parse(timestamp);

  return Number.isFinite(parsedTimestamp)
    ? new Date(parsedTimestamp).toISOString()
    : timestamp.trim();
}
