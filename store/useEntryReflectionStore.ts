import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import {
  isNonEmptyString,
  isValidTimestamp,
} from "@/lib/validation/persistedDataValidators";
import type { EntryAIReflection } from "@/types/entryReflection";
import type { AppError } from "@/types/appError";

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

type EntryReflectionHydrationState = {
  hasHydrated: boolean;
  hydrationError: AppError | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
};

function migrateEntryReflectionState(persistedState: unknown) {
  if (!isRecord(persistedState) || !Array.isArray(persistedState.reflections)) {
    return { reflections: [] };
  }

  return {
    reflections: persistedState.reflections.filter(isEntryAIReflection),
  };
}

export const useEntryReflectionHydrationStore =
  create<EntryReflectionHydrationState>()((set) => ({
    hasHydrated: false,
    hydrationError: null,
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    setHydrationError: (error) => set({ hydrationError: error }),
  }));

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
      onRehydrateStorage: () => (_persistedState, error) => {
        if (error) {
          useEntryReflectionHydrationStore.setState({
            hydrationError: normalizeAppError(error, {
              operation: "local_hydration_entry_reflections",
            }),
          });
        } else {
          useEntryReflectionHydrationStore.setState({ hydrationError: null });
        }

        useEntryReflectionHydrationStore.setState({ hasHydrated: true });
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
