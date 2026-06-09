import AsyncStorage from "@react-native-async-storage/async-storage";

import { useJournalStore } from "@/store/journal-store";
import { useNotificationPreferencesStore } from "@/store/notification-preferences-store";
import { useOnboardingStore } from "@/store/onboarding-store";

export async function clearAllLocalData() {
  useJournalStore.getState().clearAllEntries();
  useNotificationPreferencesStore
    .getState()
    .resetNotificationPreferences();
  useOnboardingStore.getState().resetOnboarding();

  await useJournalStore.persist.clearStorage();
  await useNotificationPreferencesStore.persist.clearStorage();
  await useOnboardingStore.persist.clearStorage();
  await AsyncStorage.clear();
}
