import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { isRecord } from "@/lib/utils/typeGuards";
import { normalizeReminderTime } from "@/lib/validation/persistedDataValidators";

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
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...getSanitizedNotificationPreferences(persistedState),
        }),
        onRehydrateStorage: (state) => () => {
          state?.setHasHydrated(true);
        },
        partialize: (state) => ({
          eveningReminderTime: state.eveningReminderTime,
          isEnabled: state.isEnabled,
          morningReminderTime: state.morningReminderTime,
        }),
        storage: createJSONStorage(() => createPersistStorage()),
      },
    ),
  );

function getSanitizedNotificationPreferences(persistedState: unknown) {
  if (!isRecord(persistedState)) {
    return defaultNotificationPreferences;
  }

  return {
    eveningReminderTime: normalizeReminderTime(
      persistedState.eveningReminderTime,
      defaultNotificationPreferences.eveningReminderTime,
    ),
    isEnabled:
      typeof persistedState.isEnabled === "boolean"
        ? persistedState.isEnabled
        : defaultNotificationPreferences.isEnabled,
    morningReminderTime: normalizeReminderTime(
      persistedState.morningReminderTime,
      defaultNotificationPreferences.morningReminderTime,
    ),
  };
}
