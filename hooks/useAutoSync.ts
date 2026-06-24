import { useAuth, useUser } from "@clerk/expo";
import { useCallback } from "react";

import { useConnectivity } from "@/hooks/useConnectivity";
import { requestSync } from "@/lib/sync/requestSync";
import { useJournalStore } from "@/store/journal-store";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import { useSyncStore } from "@/store/useSyncStore";

export type AutoSyncReason =
  | "app_start"
  | "foreground"
  | "journal_change"
  | "mood_change"
  | "achievement_change"
  | "manual_background"
  | "reconnect"
  | "retry";

const autoSyncCooldownMs = 60 * 1000;

export function useAutoSync() {
  const { getToken, isLoaded, userId: authUserId } = useAuth();
  const { user } = useUser();
  const connectivity = useConnectivity();
  const journalHasHydrated = useJournalStore((state) => state.hasHydrated);
  const moodLogHasHydrated = useMoodLogStore((state) => state.hasHydrated);
  const activeUserId = useJournalStore((state) => state.activeUserId);
  const achievementHasHydrated = useAchievementStore(
    (state) => state.hasHydrated,
  );
  const syncHasHydrated = useSyncStore((state) => state.hasHydrated);
  const isAutoSyncing = useSyncStore((state) => state.isSyncing);
  const lastAutoSyncedAt = useSyncStore((state) => state.lastSyncedAt);

  const runAutoSync = useCallback(
    async (reason: AutoSyncReason = "manual_background") => {
      if (
        !isLoaded ||
        !user ||
        authUserId !== user.id ||
        !journalHasHydrated ||
        !moodLogHasHydrated ||
        !achievementHasHydrated ||
        !syncHasHydrated ||
        activeUserId !== user.id
      ) {
        return;
      }

      const userId = user.id;
      const syncState = useSyncStore.getState();

      if (useAccountDeletionStore.getState().deletionInProgress) {
        return;
      }

      if (syncState.isSyncing || connectivity.status === "offline") {
        return;
      }

      const currentUserEntries = useJournalStore
        .getState()
        .allEntries.filter((entry) => entry.userId === userId);
      const currentUserMoodLogs = useMoodLogStore
        .getState()
        .allMoodLogs.filter((moodLog) => moodLog.userId === userId);
      const hasPendingJournalChanges = currentUserEntries.some(
        (entry) => entry.syncStatus !== "synced",
      );
      const hasPendingMoodLogChanges = currentUserMoodLogs.some(
        (moodLog) => moodLog.syncStatus !== "synced",
      );
      const shouldBypassCooldown =
        (reason === "journal_change" ||
          reason === "mood_change" ||
          reason === "manual_background" ||
          reason === "reconnect" ||
          reason === "retry") &&
        (hasPendingJournalChanges || hasPendingMoodLogChanges);

      if (
        !shouldBypassCooldown &&
        syncState.lastSyncUserId === userId &&
        isWithinAutoSyncCooldown(syncState.lastSyncedAt)
      ) {
        return;
      }

      await requestSync({
        avatarUrl: user.imageUrl,
        connectivityStatus: connectivity.status,
        email: user.primaryEmailAddress?.emailAddress,
        fullName: user.fullName,
        getToken,
        reason: reason === "manual_background" ? "retry" : reason,
        userId,
      });
    },
    [
      achievementHasHydrated,
      activeUserId,
      authUserId,
      connectivity.status,
      getToken,
      isLoaded,
      journalHasHydrated,
      moodLogHasHydrated,
      syncHasHydrated,
      user,
    ],
  );

  return {
    isAutoSyncing,
    lastAutoSyncedAt,
    runAutoSync,
  };
}

function isWithinAutoSyncCooldown(lastSyncedAt: string | null) {
  if (!lastSyncedAt) {
    return false;
  }

  const timestamp = Date.parse(lastSyncedAt);

  return (
    Number.isFinite(timestamp) &&
    Date.now() - timestamp < autoSyncCooldownMs
  );
}
