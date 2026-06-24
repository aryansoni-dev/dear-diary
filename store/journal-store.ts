import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import {
  mergeJournalEntries,
  type MergeResult,
} from "@/lib/sync/mergeJournalEntries";
import { normalizeTags } from "@/lib/tags";
import { normalizePersistedJournalEntries } from "@/lib/validation/persistedDataValidators";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import type {
  EntryType,
  JournalEntry,
  MoodId,
  JournalSyncStatus,
} from "@/types/journal";
import type { AppError } from "@/types/appError";

const journalStorageVersion = 3;
const entryTypes: EntryType[] = [
  "free_write",
  "daily_prompt",
  "morning_intention",
  "evening_reflection",
  "gratitude",
  "ai_reflection",
];
const moodIds: MoodId[] = [
  "happy",
  "calm",
  "sad",
  "motivated",
  "anxious",
  "grateful",
];

type JournalEntryInput = {
  content: string;
  mood: MoodId | null;
  prompt?: string;
  tags?: string[];
  title: string;
  type?: EntryType;
};

type JournalEntryUpdate = Partial<JournalEntryInput>;

type JournalState = {
  activeUserId: string | null;
  addEntry: (entry: JournalEntryInput) => JournalEntry;
  allEntries: JournalEntry[];
  clearCurrentUserEntries: () => void;
  clearEntriesForUser: (userId: string) => void;
  deleteEntry: (id: string) => void;
  entries: JournalEntry[];
  getEntryById: (id: string) => JournalEntry | undefined;
  hasHydrated: boolean;
  hydrationError: AppError | null;
  markEntriesPendingSync: (userId: string, entryIds: string[]) => void;
  markEntriesSynced: (userId: string, entryIds: string[]) => void;
  markEntriesSyncFailed: (userId: string, entryIds: string[]) => void;
  mergeRemoteEntries: (
    userId: string,
    remoteEntries: JournalEntry[],
  ) => MergeResult;
  setActiveUserId: (userId: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
  updateEntry: (id: string, entry: JournalEntryUpdate) => void;
};

function createEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getEntriesForUser(entries: JournalEntry[], userId: string | null) {
  if (!userId) {
    return [];
  }

  return entries.filter(
    (entry) => entry.userId === userId && !entry.deletedAt,
  );
}

function migrateJournalState(persistedState: unknown) {
  if (!isRecord(persistedState)) {
    return { allEntries: [], entries: [] };
  }

  const persistedEntries = Array.isArray(persistedState.allEntries)
    ? persistedState.allEntries
    : Array.isArray(persistedState.entries)
      ? persistedState.entries
      : [];

  return {
    allEntries: normalizePersistedJournalEntries(persistedEntries),
    entries: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function setSyncStatusForEntries(
  entries: JournalEntry[],
  entryIds: string[],
  userId: string,
  syncStatus: JournalSyncStatus,
) {
  const entryIdSet = new Set(entryIds);

  return entries.map((entry) =>
    entry.userId === userId && entryIdSet.has(entry.id)
      ? { ...entry, syncStatus }
      : entry,
  );
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      activeUserId: null,
      addEntry: (entry) => {
        if (useAccountDeletionStore.getState().deletionInProgress) {
          throw new Error("Account deletion is in progress.");
        }

        const userId = get().activeUserId;

        if (!userId) {
          throw new Error("A signed-in user is required to save journal entries.");
        }

        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          ...entry,
          createdAt: now,
          id: createEntryId(),
          deletedAt: null,
          syncStatus: "pending",
          tags: normalizeTags(entry.tags ?? []),
          type: entry.type ?? "free_write",
          updatedAt: now,
          userId,
        };

        set((state) => ({
          allEntries: [newEntry, ...state.allEntries],
          entries: [newEntry, ...state.entries],
        }));

        return newEntry;
      },
      allEntries: [],
      clearCurrentUserEntries: () =>
        set((state) => {
          if (!state.activeUserId) {
            return { entries: [] };
          }

          return {
            allEntries: state.allEntries.filter(
              (entry) => entry.userId !== state.activeUserId,
            ),
            entries: [],
          };
        }),
      clearEntriesForUser: (userId) =>
        set((state) => {
          const allEntries = state.allEntries.filter(
            (entry) => entry.userId !== userId,
          );

          return {
            allEntries,
            entries:
              state.activeUserId === userId
                ? []
                : getEntriesForUser(allEntries, state.activeUserId),
          };
        }),
      deleteEntry: (id) => {
        if (useAccountDeletionStore.getState().deletionInProgress) {
          return;
        }

        const now = new Date().toISOString();

        set((state) => ({
          allEntries: state.allEntries.map((entry) =>
            entry.id === id && entry.userId === state.activeUserId
              ? {
                  ...entry,
                  deletedAt: now,
                  syncStatus: "pending",
                  updatedAt: now,
                }
              : entry,
          ),
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      entries: [],
      getEntryById: (id) => get().entries.find((entry) => entry.id === id),
      hasHydrated: false,
      hydrationError: null,
      markEntriesPendingSync: (userId, entryIds) =>
        set((state) => ({
          allEntries: setSyncStatusForEntries(
            state.allEntries,
            entryIds,
            userId,
            "pending",
          ),
          entries: setSyncStatusForEntries(
            state.entries,
            entryIds,
            userId,
            "pending",
          ),
        })),
      markEntriesSynced: (userId, entryIds) =>
        set((state) => ({
          allEntries: setSyncStatusForEntries(
            state.allEntries,
            entryIds,
            userId,
            "synced",
          ),
          entries: setSyncStatusForEntries(
            state.entries,
            entryIds,
            userId,
            "synced",
          ),
        })),
      markEntriesSyncFailed: (userId, entryIds) =>
        set((state) => ({
          allEntries: setSyncStatusForEntries(
            state.allEntries,
            entryIds,
            userId,
            "failed",
          ),
          entries: setSyncStatusForEntries(
            state.entries,
            entryIds,
            userId,
            "failed",
          ),
        })),
      mergeRemoteEntries: (userId, remoteEntries) => {
        let mergeResult: MergeResult = {
          addedCount: 0,
          skippedCount: 0,
          updatedCount: 0,
        };

        set((state) => {
          const result = mergeJournalEntries({
            localEntries: state.allEntries,
            remoteEntries,
            userId,
          });

          mergeResult = {
            addedCount: result.addedCount,
            skippedCount: result.skippedCount,
            updatedCount: result.updatedCount,
          };

          return {
            allEntries: result.entries,
            entries: getEntriesForUser(result.entries, state.activeUserId),
          };
        });

        return mergeResult;
      },
      setActiveUserId: (userId) =>
        set((state) => ({
          activeUserId: userId,
          entries: getEntriesForUser(state.allEntries, userId),
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (error) => set({ hydrationError: error }),
      updateEntry: (id, entry) => {
        if (useAccountDeletionStore.getState().deletionInProgress) {
          return;
        }

        const now = new Date().toISOString();

        set((state) => ({
          allEntries: state.allEntries.map((currentEntry) =>
            currentEntry.id === id &&
            currentEntry.userId === state.activeUserId
              ? getUpdatedJournalEntry(currentEntry, entry, now)
              : currentEntry,
          ),
          entries: state.entries.map((currentEntry) =>
            currentEntry.id === id
              ? getUpdatedJournalEntry(currentEntry, entry, now)
              : currentEntry,
          ),
        }));
      },
    }),
    {
      name: "dear-diary-journal",
      migrate: migrateJournalState,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useJournalStore.setState({
            hasHydrated: true,
            hydrationError: normalizeAppError(error, {
              operation: "local_hydration_journal",
            }),
          });
          return;
        }

        if (!state) {
          useJournalStore.setState({
            hasHydrated: true,
            hydrationError: null,
          });
          return;
        }

        const allEntries = normalizePersistedJournalEntries(state.allEntries);

        useJournalStore.setState({
          allEntries,
          entries: getEntriesForUser(allEntries, state.activeUserId),
          hasHydrated: true,
          hydrationError: null,
        });
      },
      partialize: (state) => ({
        allEntries: state.allEntries,
      }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: journalStorageVersion,
    },
  ),
);

function getUpdatedJournalEntry(
  currentEntry: JournalEntry,
  entry: JournalEntryUpdate,
  updatedAt: string,
): JournalEntry {
  return {
    ...currentEntry,
    ...entry,
    syncStatus: "pending",
    tags:
      entry.tags === undefined
        ? currentEntry.tags
        : normalizeTags(entry.tags),
    updatedAt,
  };
}
