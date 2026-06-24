import type { MoodLog } from "@/types/moodLog";

export type MoodLogMergeResult = {
  addedCount: number;
  skippedCount: number;
  updatedCount: number;
};

type MergeMoodLogsParams = {
  localMoodLogs: MoodLog[];
  remoteMoodLogs: MoodLog[];
  userId: string;
};

type MergeMoodLogsResult = MoodLogMergeResult & {
  moodLogs: MoodLog[];
};

export function mergeMoodLogs({
  localMoodLogs,
  remoteMoodLogs,
  userId,
}: MergeMoodLogsParams): MergeMoodLogsResult {
  const moodLogs = [...localMoodLogs];
  const currentUserMoodLogIndexes = new Map<string, number>();
  let addedCount = 0;
  let skippedCount = 0;
  let updatedCount = 0;

  moodLogs.forEach((moodLog, index) => {
    if (moodLog.userId === userId) {
      currentUserMoodLogIndexes.set(moodLog.id, index);
    }
  });

  remoteMoodLogs.forEach((remoteMoodLog) => {
    if (remoteMoodLog.userId !== userId) {
      skippedCount += 1;
      return;
    }

    const syncedRemoteMoodLog: MoodLog = {
      ...remoteMoodLog,
      syncStatus: "synced",
    };
    const localMoodLogIndex = currentUserMoodLogIndexes.get(remoteMoodLog.id);

    if (localMoodLogIndex === undefined) {
      moodLogs.push(syncedRemoteMoodLog);
      currentUserMoodLogIndexes.set(remoteMoodLog.id, moodLogs.length - 1);
      addedCount += 1;
      return;
    }

    const localMoodLog = moodLogs[localMoodLogIndex];
    const localUpdatedAt = getTimestamp(localMoodLog.updatedAt);
    const remoteUpdatedAt = getTimestamp(remoteMoodLog.updatedAt);

    if (remoteUpdatedAt > localUpdatedAt) {
      moodLogs[localMoodLogIndex] = syncedRemoteMoodLog;
      updatedCount += 1;
      return;
    }

    if (
      remoteUpdatedAt === localUpdatedAt &&
      moodLogsHaveMatchingCloudData(localMoodLog, remoteMoodLog)
    ) {
      moodLogs[localMoodLogIndex] = {
        ...localMoodLog,
        syncStatus: "synced",
      };
    }

    skippedCount += 1;
  });

  return {
    addedCount,
    moodLogs,
    skippedCount,
    updatedCount,
  };
}

function moodLogsHaveMatchingCloudData(
  localMoodLog: MoodLog,
  remoteMoodLog: MoodLog,
) {
  return (
    localMoodLog.id === remoteMoodLog.id &&
    localMoodLog.userId === remoteMoodLog.userId &&
    localMoodLog.mood === remoteMoodLog.mood &&
    (localMoodLog.note ?? null) === (remoteMoodLog.note ?? null) &&
    (localMoodLog.intensity ?? null) === (remoteMoodLog.intensity ?? null) &&
    localMoodLog.createdAt === remoteMoodLog.createdAt &&
    localMoodLog.updatedAt === remoteMoodLog.updatedAt &&
    (localMoodLog.deletedAt ?? null) === (remoteMoodLog.deletedAt ?? null)
  );
}

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}
