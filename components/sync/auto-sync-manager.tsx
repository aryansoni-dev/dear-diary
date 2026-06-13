import { useAuth } from "@clerk/expo";
import { useEffect, useMemo, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { useAutoSync } from "@/hooks/useAutoSync";
import { useJournalStore } from "@/store/journal-store";

const journalChangeDebounceMs = 1500;

export function AutoSyncManager() {
  const { isLoaded, userId } = useAuth();
  const { runAutoSync } = useAutoSync();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const allEntries = useJournalStore((state) => state.allEntries);
  const pendingEntryKey = useMemo(() => {
    if (!userId) {
      return "";
    }

    return allEntries
      .filter(
        (entry) =>
          entry.userId === userId && entry.syncStatus === "pending",
      )
      .map((entry) => `${entry.id}:${entry.updatedAt}`)
      .sort()
      .join("|");
  }, [allEntries, userId]);

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
    if (!userId || !pendingEntryKey) {
      return;
    }

    const timeout = setTimeout(() => {
      void runAutoSync("journal_change");
    }, journalChangeDebounceMs);

    return () => clearTimeout(timeout);
  }, [pendingEntryKey, runAutoSync, userId]);

  return null;
}
