import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ReminderKey = "morning" | "evening";

type NotificationPreferencesState = {
  eveningReminderTime: string;
  hasHydrated: boolean;
  isEnabled: boolean;
  morningReminderTime: string;
  setHasHydrated: (hasHydrated: boolean) => void;
  setIsEnabled: (isEnabled: boolean) => void;
  setReminderTime: (key: ReminderKey, time: string) => void;
};

export const useNotificationPreferencesStore =
  create<NotificationPreferencesState>()(
    persist(
      (set) => ({
        eveningReminderTime: "20:00",
        hasHydrated: false,
        isEnabled: false,
        morningReminderTime: "08:00",
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        setIsEnabled: (isEnabled) => set({ isEnabled }),
        setReminderTime: (key, time) => {
          if (key === "morning") {
            set({ morningReminderTime: time });
            return;
          }

          set({ eveningReminderTime: time });
        },
      }),
      {
        name: "dear-diary-notification-preferences",
        onRehydrateStorage: (state) => () => {
          state?.setHasHydrated(true);
        },
        partialize: (state) => ({
          eveningReminderTime: state.eveningReminderTime,
          isEnabled: state.isEnabled,
          morningReminderTime: state.morningReminderTime,
        }),
        storage: createJSONStorage(() => AsyncStorage),
      },
    ),
  );
