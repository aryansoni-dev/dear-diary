import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import type { JournalEntry } from "@/types/journal";

type PushJournalEntriesParams = {
  entries: JournalEntry[];
  userId: string;
};

type PushJournalEntriesResult = {
  failedEntryIds: string[];
  syncedEntryIds: string[];
};

export async function pushJournalEntriesToCloud({
  entries,
  userId,
}: PushJournalEntriesParams): Promise<PushJournalEntriesResult> {
  if (!userId) {
    return {
      failedEntryIds: [],
      syncedEntryIds: [],
    };
  }

  const currentUserEntries = entries.filter(
    (entry) => entry.userId === userId,
  );
  const entryIds = currentUserEntries.map((entry) => entry.id);

  if (currentUserEntries.length === 0) {
    return {
      failedEntryIds: [],
      syncedEntryIds: [],
    };
  }

  try {
    const client = getAuthenticatedSupabaseClient();
    const cloudEntries = currentUserEntries.map((entry) => ({
      content: entry.content,
      created_at: entry.createdAt,
      deleted_at: entry.deletedAt ?? null,
      id: entry.id,
      mood: entry.mood,
      prompt: entry.prompt ?? null,
      title: entry.title,
      type: entry.type,
      updated_at: entry.updatedAt,
      user_id: entry.userId,
    }));
    const { error } = await client.rpc("merge_journal_entries", {
      entries: cloudEntries,
    });

    if (error) {
      console.warn("Journal sync RPC failed", error);
      return {
        failedEntryIds: entryIds,
        syncedEntryIds: [],
      };
    }

    return {
      failedEntryIds: [],
      syncedEntryIds: entryIds,
    };
  } catch (error) {
    console.warn("Journal sync RPC failed", error);
    return {
      failedEntryIds: entryIds,
      syncedEntryIds: [],
    };
  }
}
