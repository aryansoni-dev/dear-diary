import { normalizeTags } from "@/lib/tags";
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
      tags: normalizeTags(remoteEntry.tags ?? []),
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
    const parsedRemoteUpdatedAt = new Date(remoteEntry.updatedAt).getTime();
    const remoteUpdatedAt = Number.isFinite(parsedRemoteUpdatedAt)
      ? parsedRemoteUpdatedAt
      : Number.NEGATIVE_INFINITY;

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
    haveMatchingTags(localEntry.tags, remoteEntry.tags) &&
    localEntry.createdAt === remoteEntry.createdAt &&
    localEntry.updatedAt === remoteEntry.updatedAt &&
    (localEntry.deletedAt ?? null) === (remoteEntry.deletedAt ?? null)
  );
}

function haveMatchingTags(localTags: string[], remoteTags: string[]) {
  const normalizedLocalTags = normalizeTags(localTags);
  const normalizedRemoteTags = normalizeTags(remoteTags);

  return (
    normalizedLocalTags.length === normalizedRemoteTags.length &&
    normalizedLocalTags.every(
      (tag, index) => tag === normalizedRemoteTags[index],
    )
  );
}
