import { useMemo } from "react";

import { useConnectivity } from "@/hooks/useConnectivity";
import {
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { SyncStatusSnapshot, UserSyncStatus } from "@/types/syncStatus";

export function useSyncStatus(userId: string | null | undefined) {
  const connectivity = useConnectivity();
  const allEntries = useJournalStore((state) => state.allEntries);
  const allMoodLogs = useMoodLogStore((state) => state.allMoodLogs);
  const journalHasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const moodLogHasHydrated = useMoodLogStore((state) => state.hasHydrated);
  const syncHasHydrated = useSyncStore((state) => state.hasHydrated);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const lastAttemptAt = useSyncStore((state) => state.lastAttemptAt);
  const lastSyncErrorCode = useSyncStore((state) => state.lastSyncErrorCode);
  const lastSyncFailedAt = useSyncStore((state) => state.lastSyncFailedAt);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const lastSyncUserId = useSyncStore((state) => state.lastSyncUserId);
  const deletionInProgress = useAccountDeletionStore(
    (state) => state.deletionInProgress,
  );

  return useMemo<SyncStatusSnapshot>(() => {
    const currentUserId = userId ?? null;

    if (!currentUserId || deletionInProgress) {
      return createSnapshot({
        status: deletionInProgress ? "paused" : "idle",
      });
    }

    if (!journalHasHydrated || !moodLogHasHydrated || !syncHasHydrated) {
      return createSnapshot({ status: "idle" });
    }

    const currentUserEntries = allEntries.filter(
      (entry) => entry.userId === currentUserId,
    );
    const pendingCount = currentUserEntries.filter(
      (entry) => entry.syncStatus !== "synced",
    ).length;
    const failedCount = currentUserEntries.filter(
      (entry) => entry.syncStatus === "failed",
    ).length;
    const currentUserMoodLogs = allMoodLogs.filter(
      (moodLog) => moodLog.userId === currentUserId,
    );
    const pendingMoodLogCount = currentUserMoodLogs.filter(
      (moodLog) => moodLog.syncStatus !== "synced",
    ).length;
    const failedMoodLogCount = currentUserMoodLogs.filter(
      (moodLog) => moodLog.syncStatus === "failed",
    ).length;
    const totalPendingCount = pendingCount + pendingMoodLogCount;
    const totalFailedCount = failedCount + failedMoodLogCount;
    const metadataBelongsToUser = lastSyncUserId === currentUserId;
    const scopedLastSyncedAt = metadataBelongsToUser ? lastSyncedAt : null;
    const scopedLastAttemptAt = metadataBelongsToUser ? lastAttemptAt : null;
    const scopedLastFailureAt = metadataBelongsToUser ? lastSyncFailedAt : null;
    const scopedErrorCode = metadataBelongsToUser ? lastSyncErrorCode : null;
    const hasFreshFailure =
      Boolean(scopedLastFailureAt) &&
      (!scopedLastSyncedAt ||
        Date.parse(scopedLastFailureAt ?? "") > Date.parse(scopedLastSyncedAt));
    const hasRetryableFailure = totalFailedCount > 0 || hasFreshFailure;
    const status = getUserSyncStatus({
      connectivityStatus: connectivity.status,
      hasRetryableFailure,
      isSyncing,
      pendingCount: totalPendingCount,
      scopedLastSyncedAt,
    });

    return {
      canRetry:
        Boolean(currentUserId) &&
        !isSyncing &&
        !deletionInProgress &&
        connectivity.status !== "offline" &&
        (totalPendingCount > 0 || hasRetryableFailure),
      errorCode: scopedErrorCode,
      failedCount: totalFailedCount,
      lastAttemptAt: scopedLastAttemptAt,
      lastSuccessfulSyncAt: scopedLastSyncedAt,
      pendingCount: totalPendingCount,
      status,
    };
  }, [
    allEntries,
    allMoodLogs,
    connectivity.status,
    deletionInProgress,
    isSyncing,
    journalHasHydrated,
    moodLogHasHydrated,
    lastAttemptAt,
    lastSyncErrorCode,
    lastSyncFailedAt,
    lastSyncUserId,
    lastSyncedAt,
    syncHasHydrated,
    userId,
  ]);
}

function getUserSyncStatus({
  connectivityStatus,
  hasRetryableFailure,
  isSyncing,
  pendingCount,
  scopedLastSyncedAt,
}: {
  connectivityStatus: string;
  hasRetryableFailure: boolean;
  isSyncing: boolean;
  pendingCount: number;
  scopedLastSyncedAt: string | null;
}): UserSyncStatus {
  if (isSyncing) {
    return "syncing";
  }

  if (connectivityStatus === "offline" && pendingCount > 0) {
    return "waiting_for_network";
  }

  if (hasRetryableFailure) {
    return "failed";
  }

  if (pendingCount > 0) {
    return "saved_locally";
  }

  if (scopedLastSyncedAt) {
    return "synced";
  }

  return "idle";
}

function createSnapshot({
  status,
}: {
  status: UserSyncStatus;
}): SyncStatusSnapshot {
  return {
    canRetry: false,
    errorCode: null,
    failedCount: 0,
    lastAttemptAt: null,
    lastSuccessfulSyncAt: null,
    pendingCount: 0,
    status,
  };
}
