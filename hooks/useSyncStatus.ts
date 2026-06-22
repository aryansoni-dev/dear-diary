import { useMemo } from "react";

import { useConnectivity } from "@/hooks/useConnectivity";
import { useJournalStore } from "@/store/journal-store";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { SyncStatusSnapshot, UserSyncStatus } from "@/types/syncStatus";

export function useSyncStatus(userId: string | null | undefined) {
  const connectivity = useConnectivity();
  const allEntries = useJournalStore((state) => state.allEntries);
  const journalHasHydrated = useJournalStore((state) => state.hasHydrated);
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

    if (!journalHasHydrated || !syncHasHydrated) {
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
    const metadataBelongsToUser = lastSyncUserId === currentUserId;
    const scopedLastSyncedAt = metadataBelongsToUser ? lastSyncedAt : null;
    const scopedLastAttemptAt = metadataBelongsToUser ? lastAttemptAt : null;
    const scopedLastFailureAt = metadataBelongsToUser ? lastSyncFailedAt : null;
    const scopedErrorCode = metadataBelongsToUser ? lastSyncErrorCode : null;
    const hasFreshFailure =
      Boolean(scopedLastFailureAt) &&
      (!scopedLastSyncedAt ||
        Date.parse(scopedLastFailureAt ?? "") > Date.parse(scopedLastSyncedAt));
    const hasRetryableFailure = failedCount > 0 || hasFreshFailure;
    const status = getUserSyncStatus({
      connectivityStatus: connectivity.status,
      hasRetryableFailure,
      isSyncing,
      pendingCount,
      scopedLastSyncedAt,
    });

    return {
      canRetry:
        Boolean(currentUserId) &&
        !isSyncing &&
        !deletionInProgress &&
        connectivity.status !== "offline" &&
        (pendingCount > 0 || hasRetryableFailure),
      errorCode: scopedErrorCode,
      failedCount,
      lastAttemptAt: scopedLastAttemptAt,
      lastSuccessfulSyncAt: scopedLastSyncedAt,
      pendingCount,
      status,
    };
  }, [
    allEntries,
    connectivity.status,
    deletionInProgress,
    isSyncing,
    journalHasHydrated,
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
