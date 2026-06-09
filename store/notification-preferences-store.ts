import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ReminderKey = "morning" | "evening";

const defaultNotificationPreferences = {
  eveningReminderTime: "20:00",
  isEnabled: false,
  morningReminderTime: "08:00",
};

type NotificationPreferencesState = {
  eveningReminderTime: string;
  hasHydrated: boolean;
  isEnabled: boolean;
  morningReminderTime: string;
  resetNotificationPreferences: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setIsEnabled: (isEnabled: boolean) => void;
  setReminderTime: (key: ReminderKey, time: string) => void;
};

export const useNotificationPreferencesStore =
  create<NotificationPreferencesState>()(
    persist(
      (set) => ({
        eveningReminderTime: defaultNotificationPreferences.eveningReminderTime,
        hasHydrated: false,
        isEnabled: defaultNotificationPreferences.isEnabled,
        morningReminderTime: defaultNotificationPreferences.morningReminderTime,
        resetNotificationPreferences: () =>
          set(defaultNotificationPreferences),
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
