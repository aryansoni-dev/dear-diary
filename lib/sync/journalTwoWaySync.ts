import {
  pullJournalEntriesFromCloud,
  pushJournalEntriesToCloud,
} from "@/lib/sync/journalSync";
import type { JournalEntry } from "@/types/journal";

type SyncJournalEntriesTwoWayParams = {
  localEntries: JournalEntry[];
  userId: string;
};

export type JournalTwoWaySyncResult = {
  failedEntryIds: string[];
  pulledCount: number;
  pushedCount: number;
  pushFailedCount: number;
  pullSucceeded: boolean;
  remoteEntries: JournalEntry[];
  syncedEntryIds: string[];
};

export async function syncJournalEntriesTwoWay({
  localEntries,
  userId,
}: SyncJournalEntriesTwoWayParams): Promise<JournalTwoWaySyncResult> {
  const entriesToPush = localEntries.filter(
    (entry) =>
      entry.userId === userId && entry.syncStatus !== "synced",
  );
  const pushResult = await pushJournalEntriesToCloud({
    entries: entriesToPush,
    userId,
  });

  try {
    const pullResult = await pullJournalEntriesFromCloud({ userId });
    const remoteEntries = pullResult.entries.filter(
      (entry) => entry.userId === userId,
    );

    return {
      failedEntryIds: pushResult.failedEntryIds,
      pulledCount: remoteEntries.length,
      pushedCount: pushResult.syncedEntryIds.length,
      pushFailedCount: pushResult.failedEntryIds.length,
      pullSucceeded: true,
      remoteEntries,
      syncedEntryIds: pushResult.syncedEntryIds,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("Two-way journal pull failed", error);
    }

    return {
      failedEntryIds: pushResult.failedEntryIds,
      pulledCount: 0,
      pushedCount: pushResult.syncedEntryIds.length,
      pushFailedCount: pushResult.failedEntryIds.length,
      pullSucceeded: false,
      remoteEntries: [],
      syncedEntryIds: pushResult.syncedEntryIds,
    };
  }
}
