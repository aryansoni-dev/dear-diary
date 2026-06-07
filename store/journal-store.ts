import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { EntryType, JournalEntry, MoodId } from "@/types/journal";

type JournalEntryInput = {
  content: string;
  mood: MoodId | null;
  prompt?: string;
  title: string;
  type?: EntryType;
};

type JournalEntryUpdate = Partial<JournalEntryInput>;

type JournalState = {
  addEntry: (entry: JournalEntryInput) => JournalEntry;
  deleteEntry: (id: string) => void;
  entries: JournalEntry[];
  getEntryById: (id: string) => JournalEntry | undefined;
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  updateEntry: (id: string, entry: JournalEntryUpdate) => void;
};

function createEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      addEntry: (entry) => {
        const now = new Date().toISOString();
        const newEntry: JournalEntry = {
          ...entry,
          createdAt: now,
          id: createEntryId(),
          type: entry.type ?? "free_write",
          updatedAt: now,
        };

        set((state) => ({
          entries: [newEntry, ...state.entries],
        }));

        return newEntry;
      },
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      entries: [],
      getEntryById: (id) => get().entries.find((entry) => entry.id === id),
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      updateEntry: (id, entry) => {
        const now = new Date().toISOString();

        set((state) => ({
          entries: state.entries.map((currentEntry) =>
            currentEntry.id === id
              ? {
                  ...currentEntry,
                  ...entry,
                  updatedAt: now,
                }
              : currentEntry,
          ),
        }));
      },
    }),
    {
      name: "dear-diary-journal",
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        entries: state.entries,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
