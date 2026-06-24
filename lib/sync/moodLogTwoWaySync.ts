import {
  pullMoodLogsFromCloud,
  pushMoodLogsToCloud,
} from "@/lib/sync/moodLogSync";
import type { MoodLog } from "@/types/moodLog";

type SyncMoodLogsTwoWayParams = {
  localMoodLogs: MoodLog[];
  userId: string;
};

export type MoodLogTwoWaySyncResult = {
  failedMoodLogIds: string[];
  pulledCount: number;
  pushFailedCount: number;
  pushedCount: number;
  pullSucceeded: boolean;
  remoteMoodLogs: MoodLog[];
  syncedMoodLogIds: string[];
};

export async function syncMoodLogsTwoWay({
  localMoodLogs,
  userId,
}: SyncMoodLogsTwoWayParams): Promise<MoodLogTwoWaySyncResult> {
  const moodLogsToPush = localMoodLogs.filter(
    (moodLog) => moodLog.userId === userId && moodLog.syncStatus !== "synced",
  );
  const pushResult = await pushMoodLogsToCloud({
    moodLogs: moodLogsToPush,
    userId,
  });

  try {
    const pullResult = await pullMoodLogsFromCloud({ userId });
    const remoteMoodLogs = pullResult.moodLogs.filter(
      (moodLog) => moodLog.userId === userId,
    );

    return {
      failedMoodLogIds: pushResult.failedMoodLogIds,
      pulledCount: remoteMoodLogs.length,
      pushedCount: pushResult.syncedMoodLogIds.length,
      pushFailedCount: pushResult.failedMoodLogIds.length,
      pullSucceeded: true,
      remoteMoodLogs,
      syncedMoodLogIds: pushResult.syncedMoodLogIds,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("Two-way mood log pull failed", error);
    }

    return {
      failedMoodLogIds: pushResult.failedMoodLogIds,
      pulledCount: 0,
      pushedCount: pushResult.syncedMoodLogIds.length,
      pushFailedCount: pushResult.failedMoodLogIds.length,
      pullSucceeded: false,
      remoteMoodLogs: [],
      syncedMoodLogIds: pushResult.syncedMoodLogIds,
    };
  }
}
