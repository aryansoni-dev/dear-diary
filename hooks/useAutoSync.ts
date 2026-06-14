import { useAuth, useUser } from "@clerk/expo";
import { useCallback } from "react";

import { getAchievements } from "@/lib/achievements";
import {
  isSupabaseConfigured,
  setSupabaseAccessTokenProvider,
} from "@/lib/supabase";
import { syncAchievementStatesTwoWay } from "@/lib/sync/achievementSync";
import { syncJournalEntriesTwoWay } from "@/lib/sync/journalTwoWaySync";
import { syncProfileToCloud } from "@/lib/sync/profileSync";
import { useJournalStore } from "@/store/journal-store";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { JournalEntry } from "@/types/journal";

export type AutoSyncReason =
  | "app_start"
  | "foreground"
  | "journal_change"
  | "achievement_change"
  | "manual_background";

const autoSyncCooldownMs = 60 * 1000;
const autoSyncErrorMessage = "Auto sync failed";

export function useAutoSync() {
  const { getToken, isLoaded, userId: authUserId } = useAuth();
  const { user } = useUser();
  const journalHasHydrated = useJournalStore((state) => state.hasHydrated);
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
        !achievementHasHydrated ||
        !syncHasHydrated
      ) {
        return;
      }

      const userId = user.id;
      const syncState = useSyncStore.getState();

      if (syncState.isSyncing) {
        return;
      }

      const currentUserEntries = useJournalStore
        .getState()
        .allEntries.filter((entry) => entry.userId === userId);
      const hasPendingJournalChanges = currentUserEntries.some(
        (entry) => entry.syncStatus !== "synced",
      );
      const shouldBypassCooldown =
        reason === "journal_change" && hasPendingJournalChanges;

      if (
        !shouldBypassCooldown &&
        syncState.lastSyncUserId === userId &&
        isWithinAutoSyncCooldown(syncState.lastSyncedAt)
      ) {
        return;
      }

      const now = new Date().toISOString();

      if (!isSupabaseConfigured) {
        syncState.setSyncFailure(now, autoSyncErrorMessage, userId);
        return;
      }

      syncState.setIsSyncing(true);
      useAchievementStore.getState().setAchievementSyncUserId(userId);
      setSupabaseAccessTokenProvider(() => getToken());

      try {
        await syncProfileToCloud({
          avatarUrl: user.imageUrl,
          email: user.primaryEmailAddress?.emailAddress,
          fullName: user.fullName,
          userId,
        });

        const journalResult = await syncJournalEntriesTwoWay({
          localEntries: currentUserEntries,
          userId,
        });
        const journalStore = useJournalStore.getState();

        journalStore.markEntriesSynced(userId, journalResult.syncedEntryIds);
        journalStore.markEntriesSyncFailed(
          userId,
          journalResult.failedEntryIds,
        );

        if (journalResult.pullSucceeded) {
          journalStore.mergeRemoteEntries(userId, journalResult.remoteEntries);
        }

        const syncedUserEntries = useJournalStore
          .getState()
          .entries.filter(
            (entry) => entry.userId === userId && !entry.deletedAt,
          );
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

        if (
          !journalResult.pullSucceeded ||
          journalResult.pushFailedCount > 0 ||
          achievementResult.failedCount > 0
        ) {
          throw new Error(autoSyncErrorMessage);
        }

        useSyncStore
          .getState()
          .setSyncSuccess(new Date().toISOString(), userId);
      } catch (error) {
        if (__DEV__) {
          console.warn(`Auto sync failed (${reason})`, error);
        }

        useSyncStore
          .getState()
          .setSyncFailure(
            new Date().toISOString(),
            autoSyncErrorMessage,
            userId,
          );
      } finally {
        useAchievementStore.getState().setAchievementSyncUserId(null);
        useSyncStore.getState().setIsSyncing(false);
      }
    },
    [
      achievementHasHydrated,
      authUserId,
      getToken,
      isLoaded,
      journalHasHydrated,
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
