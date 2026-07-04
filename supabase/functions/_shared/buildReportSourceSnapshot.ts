import type {
  JournalEntryRow,
  MoodLogRow,
} from "./buildReportAnalytics.ts";

export async function buildReportSourceSnapshot(
  entries: JournalEntryRow[],
  moodLogs: MoodLogRow[],
) {
  const snapshotInput = buildReportSourceSnapshotInput(entries, moodLogs);
  const latestUpdatedAt =
    [...entries, ...moodLogs]
      .map((source) => source.updated_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
  const bytes = new TextEncoder().encode(snapshotInput);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return { hash, latestUpdatedAt };
}

export function buildReportSourceSnapshotInput(
  entries: JournalEntryRow[],
  moodLogs: MoodLogRow[],
) {
  return [
    ...entries.map(
      (entry) =>
        `entry:${entry.id}:${normalizeReportSourceTimestamp(entry.updated_at)}`,
    ),
    ...moodLogs.map(
      (moodLog) =>
        `mood:${moodLog.id}:${normalizeReportSourceTimestamp(moodLog.updated_at)}`,
    ),
  ]
    .sort()
    .join("|");
}

function normalizeReportSourceTimestamp(timestamp: string) {
  const parsedTimestamp = Date.parse(timestamp);

  return Number.isFinite(parsedTimestamp)
    ? new Date(parsedTimestamp).toISOString()
    : timestamp.trim();
}
