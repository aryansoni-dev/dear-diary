import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AchievementNotificationState = {
  hasInitializedAchievementNotifications: boolean;
  hasHydrated: boolean;
  markAchievementAsNotified: (id: string) => void;
  markAchievementsAsNotified: (ids: string[]) => void;
  notifiedAchievementIds: string[];
  resetAchievementNotifications: () => void;
  setAchievementNotificationsInitialized: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  syncNotifiedAchievementIds: (unlockedIds: string[]) => void;
};

export const useAchievementStore = create<AchievementNotificationState>()(
  persist(
    (set) => ({
      hasInitializedAchievementNotifications: false,
      hasHydrated: false,
      markAchievementAsNotified: (id) =>
        set((state) => ({
          notifiedAchievementIds: state.notifiedAchievementIds.includes(id)
            ? state.notifiedAchievementIds
            : [...state.notifiedAchievementIds, id],
        })),
      markAchievementsAsNotified: (ids) =>
        set((state) => ({
          notifiedAchievementIds: Array.from(
            new Set([...state.notifiedAchievementIds, ...ids]),
          ),
        })),
      notifiedAchievementIds: [],
      resetAchievementNotifications: () =>
        set({
          hasInitializedAchievementNotifications: false,
          notifiedAchievementIds: [],
        }),
      setAchievementNotificationsInitialized: (value) =>
        set({ hasInitializedAchievementNotifications: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      syncNotifiedAchievementIds: (unlockedIds) =>
        set((state) => {
          const unlockedIdSet = new Set(unlockedIds);
          const nextNotifiedAchievementIds =
            state.notifiedAchievementIds.filter((id) => unlockedIdSet.has(id));

          if (
            nextNotifiedAchievementIds.length ===
            state.notifiedAchievementIds.length
          ) {
            return state;
          }

          return { notifiedAchievementIds: nextNotifiedAchievementIds };
        }),
    }),
    {
      name: "deardiary-achievement-store-v1",
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
