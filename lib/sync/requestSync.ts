import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { reportAppError } from "@/lib/errors/reportAppError";
import { getAchievements } from "@/lib/achievements";
import {
  isFaultEnabled,
  throwIfFaultEnabled,
} from "@/lib/dev/faultInjection";
import {
  isSupabaseConfigured,
  setSupabaseAccessTokenProvider,
  type SupabaseAccessTokenProvider,
} from "@/lib/supabase";
import { syncAchievementStatesTwoWay } from "@/lib/sync/achievementSync";
import { syncJournalEntriesTwoWay } from "@/lib/sync/journalTwoWaySync";
import { syncProfileToCloud } from "@/lib/sync/profileSync";
import { isActiveUser } from "@/lib/validation/activeUser";
import { useJournalStore } from "@/store/journal-store";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { ConnectivityStatus } from "@/types/connectivity";
import type { JournalEntry } from "@/types/journal";
import type { SyncResult } from "@/types/syncResult";

export type SyncRequestReason =
  | "app_start"
  | "foreground"
  | "journal_change"
  | "achievement_change"
  | "manual"
  | "reconnect"
  | "retry";

type RequestSyncParams = {
  avatarUrl?: string | null;
  connectivityStatus?: ConnectivityStatus;
  email?: string | null;
  fullName?: string | null;
  getToken: SupabaseAccessTokenProvider;
  reason: SyncRequestReason;
  userId: string;
};

let activeSync:
  | {
      promise: Promise<SyncResult>;
      userId: string;
    }
  | null = null;

export function requestSync(params: RequestSyncParams): Promise<SyncResult> {
  if (activeSync) {
    if (activeSync.userId === params.userId) {
      return activeSync.promise;
    }

    return Promise.resolve({
      code: "sync_failed",
      localDataPreserved: true,
      retryable: true,
      success: false,
    });
  }

  const promise = runSync(params).finally(() => {
    if (activeSync?.promise === promise) {
      activeSync = null;
    }
  });

  activeSync = {
    promise,
    userId: params.userId,
  };

  return promise;
}

async function runSync({
  avatarUrl,
  connectivityStatus,
  email,
  fullName,
  getToken,
  reason,
  userId,
}: RequestSyncParams): Promise<SyncResult> {
  const now = new Date().toISOString();
  const syncStore = useSyncStore.getState();

  if (useAccountDeletionStore.getState().deletionInProgress) {
    return {
      code: "sync_failed",
      localDataPreserved: true,
      retryable: false,
      success: false,
    };
  }

  if (connectivityStatus === "offline") {
    syncStore.setSyncFailure(now, "offline", userId);
    return {
      code: "offline",
      localDataPreserved: true,
      retryable: true,
      success: false,
    };
  }

  if (!isSupabaseConfigured) {
    syncStore.setSyncFailure(now, "sync_failed", userId);
    return {
      code: "sync_failed",
      localDataPreserved: true,
      retryable: false,
      success: false,
    };
  }

  if (useJournalStore.getState().activeUserId !== userId) {
    return {
      code: "session_expired",
      localDataPreserved: true,
      retryable: false,
      success: false,
    };
  }

  syncStore.setSyncAttempt(now, userId);
  syncStore.setIsSyncing(true);
  useAchievementStore.getState().setAchievementSyncUserId(userId);
  setSupabaseAccessTokenProvider(getToken);

  const currentUserEntries = useJournalStore
    .getState()
    .allEntries.filter((entry) => entry.userId === userId);
  const pendingEntryIds = currentUserEntries
    .filter((entry) => entry.syncStatus !== "synced")
    .map((entry) => entry.id);

  if (pendingEntryIds.length > 0) {
    useJournalStore.getState().markEntriesPendingSync(userId, pendingEntryIds);
  }
  const pendingEntryIdsSet = new Set(pendingEntryIds);

  try {
    if (isFaultEnabled("expired_session")) {
      throw new Error("session expired");
    }

    if (isFaultEnabled("sync_network_failure")) {
      throw new Error("Network request failed");
    }

    throwIfFaultEnabled("sync_timeout");

    await syncProfileToCloud({
      avatarUrl: avatarUrl ?? undefined,
      email: email ?? undefined,
      fullName: fullName ?? undefined,
      userId,
    });

    if (!isActiveUser(userId, useJournalStore.getState().activeUserId)) {
      return {
        code: "session_expired",
        localDataPreserved: true,
        retryable: false,
        success: false,
      };
    }

    throwIfFaultEnabled("sync_remote_failure");

    const journalResult = await syncJournalEntriesTwoWay({
      localEntries: currentUserEntries,
      userId,
    });

    if (!isActiveUser(userId, useJournalStore.getState().activeUserId)) {
      return {
        code: "session_expired",
        localDataPreserved: true,
        retryable: false,
        success: false,
      };
    }

    const journalStore = useJournalStore.getState();

    journalStore.markEntriesSynced(userId, journalResult.syncedEntryIds);
    journalStore.markEntriesSyncFailed(userId, journalResult.failedEntryIds);

    let pulled = 0;

    if (journalResult.pullSucceeded) {
      const mergeResult = journalStore.mergeRemoteEntries(
        userId,
        journalResult.remoteEntries,
      );
      pulled = mergeResult.addedCount + mergeResult.updatedCount;
    }

    const achievementResult = await syncAchievements(userId);

    if (!isActiveUser(userId, useJournalStore.getState().activeUserId)) {
      return {
        code: "session_expired",
        localDataPreserved: true,
        retryable: false,
        success: false,
      };
    }

    if (
      !journalResult.pullSucceeded ||
      journalResult.pushFailedCount > 0 ||
      achievementResult.failedCount > 0
    ) {
      throw new Error("sync_failed");
    }

    const completedAt = new Date().toISOString();

    useSyncStore.getState().setSyncSuccess(completedAt, userId);

    return {
      completedAt,
      conflictsResolved: 0,
      pulled,
      pushed: journalResult.pushedCount,
      success: true,
    };
  } catch (error) {
    const normalizedError = normalizeAppError(error, {
      operation: "sync",
    });

    reportAppError(normalizedError, {
      errorCode: normalizedError.code,
      feature: "sync",
      operation: `sync:${reason}`,
    });

    const failedEntryIds = useJournalStore
      .getState()
      .allEntries.filter(
        (entry) =>
          entry.userId === userId &&
          pendingEntryIdsSet.has(entry.id) &&
          entry.syncStatus !== "synced",
      )
      .map((entry) => entry.id);

    if (failedEntryIds.length > 0) {
      useJournalStore.getState().markEntriesSyncFailed(userId, failedEntryIds);
    }

    useSyncStore
      .getState()
      .setSyncFailure(new Date().toISOString(), normalizedError.code, userId);

    return {
      code: normalizedError.code,
      localDataPreserved: true,
      retryable: normalizedError.retryable,
      success: false,
    };
  } finally {
    useAchievementStore.getState().setAchievementSyncUserId(null);
    useSyncStore.getState().setIsSyncing(false);
  }
}

async function syncAchievements(userId: string) {
  const syncedUserEntries = useJournalStore
    .getState()
    .entries.filter((entry) => entry.userId === userId && !entry.deletedAt);
  const unlockedAchievementIds = getAchievements(
    syncedUserEntries,
    getReflectionStreak(syncedUserEntries),
  )
    .filter((achievement) => achievement.unlocked)
    .map((achievement) => achievement.id);
  const achievementStore = useAchievementStore.getState();
  const notifiedAchievementIds =
    achievementStore.achievementNotificationsByUserId[userId]
      ?.notifiedAchievementIds ?? [];
  const achievementResult = await syncAchievementStatesTwoWay({
    notifiedAchievementIds,
    unlockedAchievementIds,
    userId,
  });

  achievementStore.mergeNotifiedAchievementIds(
    userId,
    achievementResult.pulledNotifiedIds,
  );

  return achievementResult;
}

function getReflectionStreak(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const entryDays = new Set(
    entries.map((entry) => getLocalDateKey(new Date(entry.createdAt))),
  );
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let cursor = startOfLocalDay(today);

  if (!entryDays.has(getLocalDateKey(cursor))) {
    if (!entryDays.has(getLocalDateKey(yesterday))) {
      return 0;
    }

    cursor = startOfLocalDay(yesterday);
  }

  let streak = 0;

  while (entryDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
