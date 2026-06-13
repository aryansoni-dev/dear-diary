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
  hasHydrated: boolean;
  initializeAchievementNotifications: (
    userId: string,
    unlockedIds: string[],
  ) => void;
  markAchievementAsNotified: (userId: string, id: string) => void;
  resetAchievementNotifications: (userId: string) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAchievementStore = create<AchievementNotificationState>()(
  persist(
    (set) => ({
      achievementNotificationsByUserId: {},
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
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "deardiary-achievement-store-v1",
      migrate: (persistedState, version) => {
        if (
          version > achievementStorageVersion ||
          !isRecord(persistedState) ||
          !isRecord(persistedState.achievementNotificationsByUserId)
        ) {
          return { achievementNotificationsByUserId: {} };
        }

        return {
          achievementNotificationsByUserId: Object.fromEntries(
            Object.entries(
              persistedState.achievementNotificationsByUserId,
            ).filter((entry): entry is [string, UserAchievementNotifications] =>
              isUserAchievementNotifications(entry[1]),
            ),
          ),
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
