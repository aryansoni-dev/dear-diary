import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { isRecord } from "@/lib/utils/typeGuards";
import { isNonEmptyString } from "@/lib/validation/persistedDataValidators";
import type { AppError } from "@/types/appError";

const achievementStorageVersion = 2;

type UserAchievementNotifications = {
  hasInitialized: boolean;
  notifiedAchievementIds: string[];
};

type AchievementNotificationState = {
  achievementNotificationsByUserId: Record<
    string,
    UserAchievementNotifications
  >;
  achievementSyncUserId: string | null;
  initializeAchievementNotifications: (
    userId: string,
    unlockedIds: string[],
  ) => void;
  markAchievementAsNotified: (userId: string, id: string) => void;
  mergeNotifiedAchievementIds: (userId: string, ids: string[]) => void;
  resetAchievementNotifications: (userId: string) => void;
  setAchievementSyncUserId: (userId: string | null) => void;
};

type AchievementHydrationState = {
  hasHydrated: boolean;
  hydrationError: AppError | null;
  setHasHydrated: (value: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
};

export const useAchievementHydrationStore =
  create<AchievementHydrationState>()((set) => ({
    hasHydrated: false,
    hydrationError: null,
    setHasHydrated: (value) => set({ hasHydrated: value }),
    setHydrationError: (error) => set({ hydrationError: error }),
  }));

export const useAchievementStore = create<AchievementNotificationState>()(
  persist(
    (set) => ({
      achievementNotificationsByUserId: {},
      achievementSyncUserId: null,
      initializeAchievementNotifications: (userId, unlockedIds) =>
        set((state) => {
          const currentNotifications =
            state.achievementNotificationsByUserId[userId];

          if (currentNotifications?.hasInitialized) {
            return state;
          }

          return {
            achievementNotificationsByUserId: {
              ...state.achievementNotificationsByUserId,
              [userId]: {
                hasInitialized: true,
                notifiedAchievementIds: Array.from(new Set(unlockedIds)),
              },
            },
          };
        }),
      markAchievementAsNotified: (userId, id) =>
        set((state) => {
          const currentNotifications =
            state.achievementNotificationsByUserId[userId];

          if (
            !currentNotifications ||
            currentNotifications.notifiedAchievementIds.includes(id)
          ) {
            return state;
          }

          return {
            achievementNotificationsByUserId: {
              ...state.achievementNotificationsByUserId,
              [userId]: {
                ...currentNotifications,
                notifiedAchievementIds: [
                  ...currentNotifications.notifiedAchievementIds,
                  id,
                ],
              },
            },
          };
        }),
      mergeNotifiedAchievementIds: (userId, ids) =>
        set((state) => {
          if (ids.length === 0) {
            return state;
          }

          const currentNotifications =
            state.achievementNotificationsByUserId[userId];
          const notifiedAchievementIds = Array.from(
            new Set([
              ...(currentNotifications?.notifiedAchievementIds ?? []),
              ...ids,
            ]),
          );

          return {
            achievementNotificationsByUserId: {
              ...state.achievementNotificationsByUserId,
              [userId]: {
                hasInitialized: true,
                notifiedAchievementIds,
              },
            },
          };
        }),
      resetAchievementNotifications: (userId) =>
        set((state) => {
          if (!state.achievementNotificationsByUserId[userId]) {
            return state;
          }

          const achievementNotificationsByUserId = {
            ...state.achievementNotificationsByUserId,
          };
          delete achievementNotificationsByUserId[userId];

          return { achievementNotificationsByUserId };
        }),
      setAchievementSyncUserId: (userId) =>
        set({ achievementSyncUserId: userId }),
    }),
    {
      name: "deardiary-achievement-store-v1",
      merge: (persistedState, currentState) => ({
        ...currentState,
        achievementNotificationsByUserId:
          getSanitizedAchievementNotifications(persistedState),
      }),
      migrate: (persistedState, version) => {
        if (version > achievementStorageVersion) {
          return { achievementNotificationsByUserId: {} };
        }

        return {
          achievementNotificationsByUserId:
            getSanitizedAchievementNotifications(persistedState),
        };
      },
      onRehydrateStorage: (state) => (_persistedState, error) => {
        if (error) {
          useAchievementHydrationStore.setState({
            hydrationError: normalizeAppError(error, {
              operation: "local_hydration_achievements",
            }),
          });
        } else {
          useAchievementHydrationStore.setState({ hydrationError: null });
        }

        useAchievementHydrationStore.setState({ hasHydrated: true });
      },
      partialize: (state) => ({
        achievementNotificationsByUserId:
          state.achievementNotificationsByUserId,
      }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: achievementStorageVersion,
    },
  ),
);

function getSanitizedAchievementNotifications(
  persistedState: unknown,
): Record<string, UserAchievementNotifications> {
  if (
    !isRecord(persistedState) ||
    !isRecord(persistedState.achievementNotificationsByUserId)
  ) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(
      persistedState.achievementNotificationsByUserId,
    ).filter((entry): entry is [string, UserAchievementNotifications] =>
      isUserAchievementNotifications(entry[1]),
    ),
  );
}

function isUserAchievementNotifications(
  value: unknown,
): value is UserAchievementNotifications {
  return (
    isRecord(value) &&
    typeof value.hasInitialized === "boolean" &&
    Array.isArray(value.notifiedAchievementIds) &&
    value.notifiedAchievementIds.every(isNonEmptyString)
  );
}
