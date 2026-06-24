import { useAuth } from "@clerk/expo";
import { useEffect, useMemo, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useConnectivity } from "@/hooks/useConnectivity";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useJournalStore } from "@/store/journal-store";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import { useSyncStore } from "@/store/useSyncStore";

const journalChangeDebounceMs = 1500;
const reconnectSyncDelayMs = 1200;
const retryDelaysMs = [5000, 15000];

export function AutoSyncManager() {
  const { isLoaded, userId } = useAuth();
  const connectivity = useConnectivity();
  const { runAutoSync } = useAutoSync();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const previousConnectivityStatusRef = useRef(connectivity.status);
  const retryAttemptRef = useRef(0);
  const allEntries = useJournalStore((state) => state.allEntries);
  const allMoodLogs = useMoodLogStore((state) => state.allMoodLogs);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const lastSyncFailedAt = useSyncStore((state) => state.lastSyncFailedAt);
  const lastSyncUserId = useSyncStore((state) => state.lastSyncUserId);
  const deletionInProgress = useAccountDeletionStore(
    (state) => state.deletionInProgress,
  );
  const pendingEntryKey = useMemo(() => {
    if (!userId) {
      return "";
    }

    return allEntries
      .filter(
        (entry) =>
          entry.userId === userId && entry.syncStatus !== "synced",
      )
      .map((entry) => `${entry.id}:${entry.updatedAt}`)
      .sort()
      .join("|");
  }, [allEntries, userId]);
  const pendingMoodLogKey = useMemo(() => {
    if (!userId) {
      return "";
    }

    return allMoodLogs
      .filter(
        (moodLog) =>
          moodLog.userId === userId && moodLog.syncStatus !== "synced",
      )
      .map((moodLog) => `${moodLog.id}:${moodLog.updatedAt}`)
      .sort()
      .join("|");
  }, [allMoodLogs, userId]);
  const hasPendingChanges =
    pendingEntryKey.length > 0 || pendingMoodLogKey.length > 0;

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    void runAutoSync("app_start");
  }, [isLoaded, runAutoSync, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasInactive = appStateRef.current !== "active";
      appStateRef.current = nextState;

      if (wasInactive && nextState === "active") {
        void runAutoSync("foreground");
      }
    });

    return () => subscription.remove();
  }, [runAutoSync]);

  useEffect(() => {
    if (!userId || !hasPendingChanges) {
      return;
    }

    const timeout = setTimeout(() => {
      void runAutoSync("journal_change");
    }, journalChangeDebounceMs);

    return () => clearTimeout(timeout);
  }, [
    hasPendingChanges,
    pendingEntryKey,
    pendingMoodLogKey,
    runAutoSync,
    userId,
  ]);

  useEffect(() => {
    const previousStatus = previousConnectivityStatusRef.current;
    previousConnectivityStatusRef.current = connectivity.status;

    if (
      previousStatus !== "offline" ||
      connectivity.status !== "online" ||
      !userId ||
      !hasPendingChanges ||
      isSyncing ||
      deletionInProgress
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      void runAutoSync("reconnect");
    }, reconnectSyncDelayMs);

    return () => clearTimeout(timeout);
  }, [
    connectivity.status,
    deletionInProgress,
    hasPendingChanges,
    isSyncing,
    runAutoSync,
    userId,
  ]);

  useEffect(() => {
    if (!userId || lastSyncUserId !== userId) {
      retryAttemptRef.current = 0;
      return;
    }

    if (
      !lastSyncedAt ||
      !lastSyncFailedAt ||
      Date.parse(lastSyncedAt) < Date.parse(lastSyncFailedAt)
    ) {
      return;
    }

    retryAttemptRef.current = 0;
  }, [lastSyncFailedAt, lastSyncedAt, lastSyncUserId, userId]);

  useEffect(() => {
    if (
      !userId ||
      lastSyncUserId !== userId ||
      !lastSyncFailedAt ||
      !hasPendingChanges ||
      isSyncing ||
      deletionInProgress ||
      connectivity.status === "offline"
    ) {
      return;
    }

    const delay = retryDelaysMs[retryAttemptRef.current];

    if (delay === undefined) {
      return;
    }

    const timeout = setTimeout(() => {
      retryAttemptRef.current += 1;
      void runAutoSync("retry");
    }, delay);

    return () => clearTimeout(timeout);
  }, [
    connectivity.status,
    deletionInProgress,
    hasPendingChanges,
    isSyncing,
    lastSyncFailedAt,
    lastSyncUserId,
    runAutoSync,
    userId,
  ]);

  return null;
}
