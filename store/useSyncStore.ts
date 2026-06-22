import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SyncState = {
  clearSyncError: () => void;
  clearSyncStateForUser: (userId: string) => void;
  hasHydrated: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;
  lastSyncFailedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncUserId: string | null;
  setHasHydrated: (value: boolean) => void;
  setIsSyncing: (value: boolean) => void;
  setSyncFailure: (
    timestamp: string,
    errorMessage: string,
    userId: string,
  ) => void;
  setSyncSuccess: (timestamp: string, userId: string) => void;
};

type PersistedSyncMetadata = Pick<
  SyncState,
  "lastSyncError" | "lastSyncFailedAt" | "lastSyncedAt" | "lastSyncUserId"
>;

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      clearSyncError: () =>
        set({
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
            lastSyncError: null,
            lastSyncFailedAt: null,
            lastSyncedAt: null,
            lastSyncUserId: null,
          };
        }),
      hasHydrated: false,
      isSyncing: false,
      lastSyncError: null,
      lastSyncFailedAt: null,
      lastSyncedAt: null,
      lastSyncUserId: null,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setIsSyncing: (value) => set({ isSyncing: value }),
      setSyncFailure: (timestamp, errorMessage, userId) =>
        set({
          lastSyncError: errorMessage,
          lastSyncFailedAt: timestamp,
          lastSyncUserId: userId,
        }),
      setSyncSuccess: (timestamp, userId) =>
        set({
          lastSyncError: null,
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
        lastSyncError: state.lastSyncError,
        lastSyncFailedAt: state.lastSyncFailedAt,
        lastSyncedAt: state.lastSyncedAt,
        lastSyncUserId: state.lastSyncUserId,
      }),
      storage: createJSONStorage(() => AsyncStorage),
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
    lastSyncError: getNullableString(persistedState.lastSyncError),
    lastSyncFailedAt: getNullableTimestamp(persistedState.lastSyncFailedAt),
    lastSyncedAt: getNullableTimestamp(persistedState.lastSyncedAt),
    lastSyncUserId: getNullableString(persistedState.lastSyncUserId),
  };
}

function createEmptySyncMetadata(): PersistedSyncMetadata {
  return {
    lastSyncError: null,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}
