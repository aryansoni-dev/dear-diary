import { useJournalStore } from "@/store/journal-store";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useEntryReflectionStore } from "@/store/useEntryReflectionStore";

export async function clearCurrentUserLocalData() {
  const userId = useJournalStore.getState().activeUserId;
  useJournalStore.getState().clearCurrentUserEntries();

  if (userId) {
    useAchievementStore.getState().resetAchievementNotifications(userId);
    useEntryReflectionStore.getState().clearReflectionsForUser(userId);
  }
}

export async function clearEntriesForUser(userId: string) {
  useJournalStore.getState().clearEntriesForUser(userId);
  useAchievementStore.getState().resetAchievementNotifications(userId);
  useEntryReflectionStore.getState().clearReflectionsForUser(userId);
}
