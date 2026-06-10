import { useJournalStore } from "@/store/journal-store";
import { useAchievementStore } from "@/store/useAchievementStore";

export async function clearCurrentUserLocalData() {
  useJournalStore.getState().clearCurrentUserEntries();
  useAchievementStore.getState().resetAchievementNotifications();
}

export async function clearEntriesForUser(userId: string) {
  useJournalStore.getState().clearEntriesForUser(userId);
  useAchievementStore.getState().resetAchievementNotifications();
}
