import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { appErrorCodes, type AppErrorCode } from "@/types/appError";
import { isRecord } from "@/lib/utils/typeGuards";

type SyncState = {
  clearSyncError: () => void;
  clearSyncStateForUser: (userId: string) => void;
  hasHydrated: boolean;
  isSyncing: boolean;
  lastAttemptAt: string | null;
  lastSyncErrorCode: AppErrorCode | null;
  lastSyncError: string | null;
  lastSyncFailedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncUserId: string | null;
  setHasHydrated: (value: boolean) => void;
  setIsSyncing: (value: boolean) => void;
  setSyncAttempt: (timestamp: string, userId: string) => void;
  setSyncFailure: (
    timestamp: string,
    errorCode: AppErrorCode,
    userId: string,
  ) => void;
  setSyncSuccess: (timestamp: string, userId: string) => void;
};

type PersistedSyncMetadata = Pick<
  SyncState,
  | "lastAttemptAt"
  | "lastSyncError"
  | "lastSyncErrorCode"
  | "lastSyncFailedAt"
  | "lastSyncedAt"
  | "lastSyncUserId"
>;

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      clearSyncError: () =>
        set({
          lastSyncErrorCode: null,
          lastSyncError: null,
          lastSyncFailedAt: null,
        }),
      clearSyncStateForUser: (userId) =>
        set((state) => {
          if (state.lastSyncUserId !== userId) {
            return state;
          }

          return {
            isSyncing: false,
            lastAttemptAt: null,
            lastSyncErrorCode: null,
            lastSyncError: null,
            lastSyncFailedAt: null,
            lastSyncedAt: null,
            lastSyncUserId: null,
          };
        }),
      hasHydrated: false,
      isSyncing: false,
      lastAttemptAt: null,
      lastSyncErrorCode: null,
      lastSyncError: null,
      lastSyncFailedAt: null,
      lastSyncedAt: null,
      lastSyncUserId: null,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setIsSyncing: (value) => set({ isSyncing: value }),
      setSyncAttempt: (timestamp, userId) =>
        set({
          lastAttemptAt: timestamp,
          lastSyncUserId: userId,
        }),
      setSyncFailure: (timestamp, errorCode, userId) =>
        set({
          lastAttemptAt: timestamp,
          lastSyncError: getUserSafeSyncErrorLabel(errorCode),
          lastSyncErrorCode: errorCode,
          lastSyncFailedAt: timestamp,
          lastSyncUserId: userId,
        }),
      setSyncSuccess: (timestamp, userId) =>
        set({
          lastAttemptAt: timestamp,
          lastSyncError: null,
          lastSyncErrorCode: null,
          lastSyncFailedAt: null,
          lastSyncedAt: timestamp,
          lastSyncUserId: userId,
        }),
    }),
    {
      name: "deardiary-sync-store-v1",
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...getSanitizedSyncMetadata(persistedState),
      }),
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        lastAttemptAt: state.lastAttemptAt,
        lastSyncError: state.lastSyncError,
        lastSyncErrorCode: state.lastSyncErrorCode,
        lastSyncFailedAt: state.lastSyncFailedAt,
        lastSyncedAt: state.lastSyncedAt,
        lastSyncUserId: state.lastSyncUserId,
      }),
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);

function getSanitizedSyncMetadata(
  persistedState: unknown,
): PersistedSyncMetadata {
  if (!isRecord(persistedState)) {
    return createEmptySyncMetadata();
  }

  return {
    lastAttemptAt: getNullableTimestamp(persistedState.lastAttemptAt),
    lastSyncError: getNullableString(persistedState.lastSyncError),
    lastSyncErrorCode: getNullableAppErrorCode(
      persistedState.lastSyncErrorCode,
    ),
    lastSyncFailedAt: getNullableTimestamp(persistedState.lastSyncFailedAt),
    lastSyncedAt: getNullableTimestamp(persistedState.lastSyncedAt),
    lastSyncUserId: getNullableString(persistedState.lastSyncUserId),
  };
}

function createEmptySyncMetadata(): PersistedSyncMetadata {
  return {
    lastAttemptAt: null,
    lastSyncError: null,
    lastSyncErrorCode: null,
    lastSyncFailedAt: null,
    lastSyncedAt: null,
    lastSyncUserId: null,
  };
}

function getNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNullableTimestamp(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value))
    ? value
    : null;
}

function getNullableAppErrorCode(value: unknown): AppErrorCode | null {
  return typeof value === "string" && isAppErrorCode(value) ? value : null;
}

function getUserSafeSyncErrorLabel(code: AppErrorCode) {
  if (code === "offline") {
    return "Offline";
  }

  if (code === "session_expired") {
    return "Session expired";
  }

  if (code === "permission_denied") {
    return "Permission denied";
  }

  return "Sync failed";
}

function isAppErrorCode(value: string): value is AppErrorCode {
  return appErrorCodes.includes(value as AppErrorCode);
}
