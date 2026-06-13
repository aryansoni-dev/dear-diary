import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  hasHydrated: boolean;
  initializeAchievementNotifications: (
    userId: string,
    unlockedIds: string[],
  ) => void;
  markAchievementAsNotified: (userId: string, id: string) => void;
  mergeNotifiedAchievementIds: (userId: string, ids: string[]) => void;
  resetAchievementNotifications: (userId: string) => void;
  setAchievementSyncUserId: (userId: string | null) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAchievementStore = create<AchievementNotificationState>()(
  persist(
    (set) => ({
      achievementNotificationsByUserId: {},
      achievementSyncUserId: null,
      hasHydrated: false,
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
      setHasHydrated: (value) => set({ hasHydrated: value }),
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
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        achievementNotificationsByUserId:
          state.achievementNotificationsByUserId,
      }),
      storage: createJSONStorage(() => AsyncStorage),
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

function isUserAchievementNotifications(
  value: unknown,
): value is UserAchievementNotifications {
  return (
    isRecord(value) &&
    typeof value.hasInitialized === "boolean" &&
    Array.isArray(value.notifiedAchievementIds) &&
    value.notifiedAchievementIds.every((id) => typeof id === "string")
  );
}
