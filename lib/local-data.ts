import { useJournalStore } from "@/store/journal-store";

export async function clearCurrentUserLocalData() {
  useJournalStore.getState().clearCurrentUserEntries();
}

export async function clearEntriesForUser(userId: string) {
  useJournalStore.getState().clearEntriesForUser(userId);
}
