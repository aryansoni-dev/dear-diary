import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  EntryType,
  JournalEntry,
  JournalSyncStatus,
  MoodId,
} from "@/types/journal";

const journalStorageVersion = 2;
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
  markEntriesPendingSync: (entryIds: string[]) => void;
  markEntriesSynced: (entryIds: string[]) => void;
  markEntriesSyncFailed: (entryIds: string[]) => void;
  setActiveUserId: (userId: string | null) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
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
    allEntries: persistedEntries.filter(isJournalEntry),
    entries: [],
  };
}

function isJournalEntry(entry: unknown): entry is JournalEntry {
  if (!isRecord(entry)) {
    return false;
  }

  const prompt = entry.prompt;
  const deletedAt = entry.deletedAt;
  const syncStatus = entry.syncStatus;

  return (
    typeof entry.id === "string" &&
    typeof entry.userId === "string" &&
    typeof entry.title === "string" &&
    typeof entry.content === "string" &&
    (entry.mood === null ||
      (typeof entry.mood === "string" && isMoodId(entry.mood))) &&
    typeof entry.type === "string" &&
    isEntryType(entry.type) &&
    (prompt === undefined || typeof prompt === "string") &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string" &&
    (deletedAt === undefined ||
      deletedAt === null ||
      typeof deletedAt === "string") &&
    (syncStatus === undefined || isJournalSyncStatus(syncStatus))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEntryType(value: string): value is EntryType {
  return entryTypes.includes(value as EntryType);
}

function isMoodId(value: string): value is MoodId {
  return moodIds.includes(value as MoodId);
}

function isJournalSyncStatus(value: unknown): value is JournalSyncStatus {
  return value === "failed" || value === "pending" || value === "synced";
}

function setSyncStatusForEntries(
  entries: JournalEntry[],
  entryIds: string[],
  activeUserId: string | null,
  syncStatus: JournalSyncStatus,
) {
  const entryIdSet = new Set(entryIds);

  return entries.map((entry) =>
    entry.userId === activeUserId && entryIdSet.has(entry.id)
      ? { ...entry, syncStatus }
      : entry,
  );
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      activeUserId: null,
      addEntry: (entry) => {
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
      markEntriesPendingSync: (entryIds) =>
        set((state) => ({
          allEntries: setSyncStatusForEntries(
            state.allEntries,
            entryIds,
            state.activeUserId,
            "pending",
          ),
          entries: setSyncStatusForEntries(
            state.entries,
            entryIds,
            state.activeUserId,
            "pending",
          ),
        })),
      markEntriesSynced: (entryIds) =>
        set((state) => ({
          allEntries: setSyncStatusForEntries(
            state.allEntries,
            entryIds,
            state.activeUserId,
            "synced",
          ),
          entries: setSyncStatusForEntries(
            state.entries,
            entryIds,
            state.activeUserId,
            "synced",
          ),
        })),
      markEntriesSyncFailed: (entryIds) =>
        set((state) => ({
          allEntries: setSyncStatusForEntries(
            state.allEntries,
            entryIds,
            state.activeUserId,
            "failed",
          ),
          entries: setSyncStatusForEntries(
            state.entries,
            entryIds,
            state.activeUserId,
            "failed",
          ),
        })),
      setActiveUserId: (userId) =>
        set((state) => ({
          activeUserId: userId,
          entries: getEntriesForUser(state.allEntries, userId),
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      updateEntry: (id, entry) => {
        const now = new Date().toISOString();

        set((state) => ({
          allEntries: state.allEntries.map((currentEntry) =>
            currentEntry.id === id &&
            currentEntry.userId === state.activeUserId
              ? {
                  ...currentEntry,
                  ...entry,
                  syncStatus: "pending",
                  updatedAt: now,
                }
              : currentEntry,
          ),
          entries: state.entries.map((currentEntry) =>
            currentEntry.id === id
              ? {
                  ...currentEntry,
                  ...entry,
                  syncStatus: "pending",
                  updatedAt: now,
                }
              : currentEntry,
          ),
        }));
      },
    }),
    {
      name: "dear-diary-journal",
      migrate: migrateJournalState,
      onRehydrateStorage: (state) => () => {
        state?.setActiveUserId(state.activeUserId);
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        allEntries: state.allEntries,
      }),
      storage: createJSONStorage(() => AsyncStorage),
      version: journalStorageVersion,
    },
  ),
);
