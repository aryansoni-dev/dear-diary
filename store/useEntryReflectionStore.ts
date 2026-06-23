import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import {
  isNonEmptyString,
  isValidTimestamp,
} from "@/lib/validation/persistedDataValidators";
import type { EntryAIReflection } from "@/types/entryReflection";

const entryReflectionStorageVersion = 1;

type EntryReflectionState = {
  clearReflectionsForUser: (userId: string) => void;
  getReflectionByEntryId: (
    userId: string,
    entryId: string,
  ) => EntryAIReflection | undefined;
  hasHydrated: boolean;
  reflections: EntryAIReflection[];
  removeReflectionForEntry: (userId: string, entryId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  upsertReflection: (reflection: EntryAIReflection) => void;
};

function migrateEntryReflectionState(persistedState: unknown) {
  if (!isRecord(persistedState) || !Array.isArray(persistedState.reflections)) {
    return { reflections: [] };
  }

  return {
    reflections: persistedState.reflections.filter(isEntryAIReflection),
  };
}

export const useEntryReflectionStore = create<EntryReflectionState>()(
  persist(
    (set, get) => ({
      clearReflectionsForUser: (userId) =>
        set((state) => ({
          reflections: state.reflections.filter(
            (reflection) => reflection.userId !== userId,
          ),
        })),
      getReflectionByEntryId: (userId, entryId) =>
        get().reflections.find(
          (reflection) =>
            reflection.userId === userId && reflection.entryId === entryId,
        ),
      hasHydrated: false,
      reflections: [],
      removeReflectionForEntry: (userId, entryId) =>
        set((state) => ({
          reflections: state.reflections.filter(
            (reflection) =>
              reflection.userId !== userId || reflection.entryId !== entryId,
          ),
        })),
      upsertReflection: (reflection) =>
        set((state) => {
          const nextReflections = state.reflections.filter(
            (currentReflection) =>
              currentReflection.userId !== reflection.userId ||
              currentReflection.entryId !== reflection.entryId,
          );

          return {
            reflections: [reflection, ...nextReflections],
          };
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "deardiary-entry-reflections-v1",
      migrate: migrateEntryReflectionState,
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ reflections: state.reflections }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: entryReflectionStorageVersion,
    },
  ),
);

function isEntryAIReflection(value: unknown): value is EntryAIReflection {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.userId) &&
    isNonEmptyString(value.entryId) &&
    typeof value.summary === "string" &&
    Array.isArray(value.emotions) &&
    value.emotions.every((emotion) => typeof emotion === "string") &&
    Array.isArray(value.themes) &&
    value.themes.every((theme) => typeof theme === "string") &&
    (value.observation === null || typeof value.observation === "string") &&
    (value.followUpQuestion === null ||
      typeof value.followUpQuestion === "string") &&
    (value.suggestion === null || typeof value.suggestion === "string") &&
    (value.model === null || typeof value.model === "string") &&
    isValidTimestamp(value.sourceEntryUpdatedAt) &&
    isValidTimestamp(value.createdAt) &&
    isValidTimestamp(value.updatedAt)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
