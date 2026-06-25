import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { moodList } from "@/constants/moods";
import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import {
  mergeMoodLogs,
  type MoodLogMergeResult,
} from "@/lib/sync/mergeMoodLogs";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import type { AppError } from "@/types/appError";
import type { MoodId } from "@/types/journal";
import type { MoodLog, MoodLogSyncStatus } from "@/types/moodLog";

const moodLogStorageVersion = 1;
const moodIds = moodList.map((mood) => mood.id);
const syncStatuses: MoodLogSyncStatus[] = ["failed", "pending", "synced"];

type MoodLogInput = {
  intensity?: number | null;
  mood: MoodId;
  note?: string | null;
};

type MoodLogState = {
  addMoodLog: (userId: string, moodLog: MoodLogInput) => MoodLog;
  allMoodLogs: MoodLog[];
  clearMoodLogsForUser: (userId: string) => void;
  hasHydrated: boolean;
  hydrationError: AppError | null;
  markMoodLogsPendingSync: (userId: string, moodLogIds: string[]) => void;
  markMoodLogsSynced: (userId: string, moodLogIds: string[]) => void;
  markMoodLogsSyncFailed: (userId: string, moodLogIds: string[]) => void;
  mergeRemoteMoodLogs: (
    userId: string,
    remoteMoodLogs: MoodLog[],
  ) => MoodLogMergeResult;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
  updateMoodLog: (id: string, userId: string, moodLog: MoodLogInput) => void;
};

function createMoodLogId() {
  return `mood_log_${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function migrateMoodLogState(persistedState: unknown) {
  if (!isRecord(persistedState)) {
    return { allMoodLogs: [] };
  }

  const persistedMoodLogs = Array.isArray(persistedState.allMoodLogs)
    ? persistedState.allMoodLogs
    : [];

  return {
    allMoodLogs: normalizePersistedMoodLogs(persistedMoodLogs),
  };
}

function setSyncStatusForMoodLogs(
  moodLogs: MoodLog[],
  moodLogIds: string[],
  userId: string,
  syncStatus: MoodLogSyncStatus,
) {
  const moodLogIdSet = new Set(moodLogIds);

  return moodLogs.map((moodLog) =>
    moodLog.userId === userId && moodLogIdSet.has(moodLog.id)
      ? { ...moodLog, syncStatus }
      : moodLog,
  );
}

export const useMoodLogStore = create<MoodLogState>()(
  persist(
    (set, get) => ({
      addMoodLog: (userId, moodLog) => {
        if (useAccountDeletionStore.getState().deletionInProgress) {
          throw new Error("Account deletion is in progress.");
        }

        if (!get().hasHydrated) {
          throw new Error("Mood logs are still loading.");
        }

        if (!userId.trim()) {
          throw new Error("A signed-in user is required to save mood logs.");
        }

        const now = new Date().toISOString();
        const newMoodLog: MoodLog = {
          createdAt: now,
          deletedAt: null,
          id: createMoodLogId(),
          intensity: moodLog.intensity ?? null,
          mood: moodLog.mood,
          note: moodLog.note ?? null,
          syncStatus: "pending",
          updatedAt: now,
          userId,
        };

        set((state) => ({
          allMoodLogs: [newMoodLog, ...state.allMoodLogs],
        }));

        return newMoodLog;
      },
      allMoodLogs: [],
      clearMoodLogsForUser: (userId) =>
        set((state) => ({
          allMoodLogs: state.allMoodLogs.filter(
            (moodLog) => moodLog.userId !== userId,
          ),
          hydrationError: null,
        })),
      hasHydrated: false,
      hydrationError: null,
      markMoodLogsPendingSync: (userId, moodLogIds) =>
        set((state) => ({
          allMoodLogs: setSyncStatusForMoodLogs(
            state.allMoodLogs,
            moodLogIds,
            userId,
            "pending",
          ),
        })),
      markMoodLogsSynced: (userId, moodLogIds) =>
        set((state) => ({
          allMoodLogs: setSyncStatusForMoodLogs(
            state.allMoodLogs,
            moodLogIds,
            userId,
            "synced",
          ),
        })),
      markMoodLogsSyncFailed: (userId, moodLogIds) =>
        set((state) => ({
          allMoodLogs: setSyncStatusForMoodLogs(
            state.allMoodLogs,
            moodLogIds,
            userId,
            "failed",
          ),
        })),
      mergeRemoteMoodLogs: (userId, remoteMoodLogs) => {
        let mergeResult: MoodLogMergeResult = {
          addedCount: 0,
          skippedCount: 0,
          updatedCount: 0,
        };

        set((state) => {
          const result = mergeMoodLogs({
            localMoodLogs: state.allMoodLogs,
            remoteMoodLogs,
            userId,
          });

          mergeResult = {
            addedCount: result.addedCount,
            skippedCount: result.skippedCount,
            updatedCount: result.updatedCount,
          };

          return {
            allMoodLogs: result.moodLogs,
          };
        });

        return mergeResult;
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (error) => set({ hydrationError: error }),
      updateMoodLog: (id, userId, moodLog) => {
        if (useAccountDeletionStore.getState().deletionInProgress) {
          return;
        }

        if (!get().hasHydrated) {
          throw new Error("Mood logs are still loading.");
        }

        const now = new Date().toISOString();

        set((state) => ({
          allMoodLogs: state.allMoodLogs.map((currentMoodLog) =>
            currentMoodLog.id === id && currentMoodLog.userId === userId
              ? {
                  ...currentMoodLog,
                  intensity: moodLog.intensity ?? null,
                  mood: moodLog.mood,
                  note: moodLog.note ?? null,
                  syncStatus: "pending",
                  updatedAt: now,
                }
              : currentMoodLog,
          ),
        }));
      },
    }),
    {
      name: "dear-diary-mood-logs",
      migrate: migrateMoodLogState,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useMoodLogStore.setState({
            hasHydrated: true,
            hydrationError: normalizeAppError(error, {
              operation: "local_hydration_mood_logs",
            }),
          });
          return;
        }

        if (!state) {
          useMoodLogStore.setState({
            hasHydrated: true,
            hydrationError: null,
          });
          return;
        }

        useMoodLogStore.setState({
          allMoodLogs: normalizePersistedMoodLogs(state.allMoodLogs),
          hasHydrated: true,
          hydrationError: null,
        });
      },
      partialize: (state) => ({
        allMoodLogs: state.allMoodLogs,
      }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: moodLogStorageVersion,
    },
  ),
);

function normalizePersistedMoodLogs(values: unknown[]): MoodLog[] {
  const moodLogs = values.reduce<MoodLog[]>((validMoodLogs, value) => {
    const moodLog = normalizePersistedMoodLog(value);

    if (moodLog) {
      validMoodLogs.push(moodLog);
    }

    return validMoodLogs;
  }, []);

  return dedupeMoodLogs(moodLogs);
}

function normalizePersistedMoodLog(value: unknown): MoodLog | null {
  if (!isStoredMoodLog(value)) {
    return null;
  }

  return {
    ...value,
    deletedAt: value.deletedAt ?? null,
    intensity: value.intensity ?? null,
    note: value.note ?? null,
    syncStatus: value.syncStatus ?? "pending",
  };
}

function dedupeMoodLogs(moodLogs: MoodLog[]) {
  const moodLogsByScopedId = new Map<string, MoodLog>();

  moodLogs.forEach((moodLog) => {
    const scopedId = `${moodLog.userId}:${moodLog.id}`;
    const existingMoodLog = moodLogsByScopedId.get(scopedId);

    if (!existingMoodLog) {
      moodLogsByScopedId.set(scopedId, moodLog);
      return;
    }

    if (Date.parse(moodLog.updatedAt) > Date.parse(existingMoodLog.updatedAt)) {
      moodLogsByScopedId.set(scopedId, moodLog);
    }
  });

  return Array.from(moodLogsByScopedId.values());
}

function isStoredMoodLog(value: unknown): value is MoodLog {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.userId) &&
    typeof value.mood === "string" &&
    isMoodId(value.mood) &&
    (value.note === undefined ||
      value.note === null ||
      typeof value.note === "string") &&
    (value.intensity === undefined ||
      value.intensity === null ||
      (typeof value.intensity === "number" &&
        Number.isInteger(value.intensity) &&
        value.intensity >= 1 &&
        value.intensity <= 5)) &&
    isValidTimestamp(value.createdAt) &&
    isValidTimestamp(value.updatedAt) &&
    (value.deletedAt === undefined ||
      value.deletedAt === null ||
      isValidTimestamp(value.deletedAt)) &&
    (value.syncStatus === undefined || isMoodLogSyncStatus(value.syncStatus))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isMoodId(value: string): value is MoodId {
  return moodIds.includes(value as MoodId);
}

function isMoodLogSyncStatus(value: unknown): value is MoodLogSyncStatus {
  return (
    typeof value === "string" &&
    syncStatuses.includes(value as MoodLogSyncStatus)
  );
}
