import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { EntryAIReflection } from "@/types/entryReflection";

const entryReflectionStorageVersion = 1;

type EntryReflectionState = {
  clearReflectionsForUser: (userId: string) => void;
  getReflectionByEntryId: (
    userId: string,
    entryId: string,
  ) => EntryAIReflection | undefined;
  reflections: EntryAIReflection[];
  removeReflectionForEntry: (userId: string, entryId: string) => void;
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
    }),
    {
      name: "deardiary-entry-reflections-v1",
      migrate: migrateEntryReflectionState,
      storage: createJSONStorage(() => AsyncStorage),
      version: entryReflectionStorageVersion,
    },
  ),
);

function isEntryAIReflection(value: unknown): value is EntryAIReflection {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.entryId === "string" &&
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
    typeof value.sourceEntryUpdatedAt === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
