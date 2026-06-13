import type { JournalEntry } from "@/types/journal";

export type MergeResult = {
  addedCount: number;
  skippedCount: number;
  updatedCount: number;
};

type MergeJournalEntriesParams = {
  localEntries: JournalEntry[];
  remoteEntries: JournalEntry[];
  userId: string;
};

type MergeJournalEntriesResult = MergeResult & {
  entries: JournalEntry[];
};

export function mergeJournalEntries({
  localEntries,
  remoteEntries,
  userId,
}: MergeJournalEntriesParams): MergeJournalEntriesResult {
  const entries = [...localEntries];
  const currentUserEntryIndexes = new Map<string, number>();
  let addedCount = 0;
  let skippedCount = 0;
  let updatedCount = 0;

  entries.forEach((entry, index) => {
    if (entry.userId === userId) {
      currentUserEntryIndexes.set(entry.id, index);
    }
  });

  remoteEntries.forEach((remoteEntry) => {
    if (remoteEntry.userId !== userId) {
      skippedCount += 1;
      return;
    }

    const syncedRemoteEntry: JournalEntry = {
      ...remoteEntry,
      syncStatus: "synced",
    };
    const localEntryIndex = currentUserEntryIndexes.get(remoteEntry.id);

    if (localEntryIndex === undefined) {
      entries.push(syncedRemoteEntry);
      currentUserEntryIndexes.set(remoteEntry.id, entries.length - 1);
      addedCount += 1;
      return;
    }

    const localEntry = entries[localEntryIndex];
    const parsedLocalUpdatedAt = new Date(localEntry.updatedAt).getTime();
    const localUpdatedAt = Number.isFinite(parsedLocalUpdatedAt)
      ? parsedLocalUpdatedAt
      : Number.NEGATIVE_INFINITY;
    const remoteUpdatedAt = new Date(remoteEntry.updatedAt).getTime();

    if (remoteUpdatedAt > localUpdatedAt) {
      entries[localEntryIndex] = syncedRemoteEntry;
      updatedCount += 1;
      return;
    }

    if (
      remoteUpdatedAt === localUpdatedAt &&
      entriesHaveMatchingCloudData(localEntry, remoteEntry)
    ) {
      entries[localEntryIndex] = {
        ...localEntry,
        syncStatus: "synced",
      };
    }

    skippedCount += 1;
  });

  return {
    addedCount,
    entries,
    skippedCount,
    updatedCount,
  };
}

function entriesHaveMatchingCloudData(
  localEntry: JournalEntry,
  remoteEntry: JournalEntry,
) {
  return (
    localEntry.id === remoteEntry.id &&
    localEntry.userId === remoteEntry.userId &&
    localEntry.title === remoteEntry.title &&
    localEntry.content === remoteEntry.content &&
    localEntry.mood === remoteEntry.mood &&
    localEntry.type === remoteEntry.type &&
    (localEntry.prompt ?? null) === (remoteEntry.prompt ?? null) &&
    localEntry.createdAt === remoteEntry.createdAt &&
    localEntry.updatedAt === remoteEntry.updatedAt &&
    (localEntry.deletedAt ?? null) === (remoteEntry.deletedAt ?? null)
  );
}
