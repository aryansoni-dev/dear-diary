import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import { normalizeTags } from "@/lib/tags";
import type { EntryType, JournalEntry, MoodId } from "@/types/journal";

const entryTypes: EntryType[] = [
  "free_write",
  "daily_prompt",
  "morning_intention",
  "evening_reflection",
  "gratitude",
  "ai_reflection",
];
const moodIds: MoodId[] = [
  "happy",
  "calm",
  "sad",
  "motivated",
  "anxious",
  "grateful",
];
const journalEntrySelectWithTags =
  "id, user_id, title, content, mood, type, prompt, tags, created_at, updated_at, deleted_at";
const journalEntrySelectWithoutTags =
  "id, user_id, title, content, mood, type, prompt, created_at, updated_at, deleted_at";

type JournalEntryRow = {
  content: string;
  created_at: string;
  deleted_at: string | null;
  id: string;
  mood: string | null;
  prompt: string | null;
  sync_version?: number | null;
  tags?: string[] | null;
  title: string;
  type: string;
  updated_at: string;
  user_id: string;
};

type PushJournalEntriesParams = {
  entries: JournalEntry[];
  userId: string;
};

type PushJournalEntriesResult = {
  failedEntryIds: string[];
  syncedEntryIds: string[];
};

type PullJournalEntriesParams = {
  userId: string;
};

type PullJournalEntriesResult = {
  entries: JournalEntry[];
  pulledCount: number;
};

const mapJournalEntryRowToEntry = (
  row: JournalEntryRow,
): JournalEntry => ({
  content: row.content,
  createdAt: row.created_at,
  deletedAt: row.deleted_at,
  id: row.id,
  mood: row.mood as JournalEntry["mood"],
  prompt: row.prompt ?? undefined,
  syncStatus: "synced",
  tags: normalizeTags(row.tags ?? []),
  title: row.title,
  type: row.type as JournalEntry["type"],
  updatedAt: row.updated_at,
  userId: row.user_id,
});

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
      tags: normalizeTags(entry.tags ?? []),
      title: entry.title,
      type: entry.type,
      updated_at: entry.updatedAt,
      user_id: entry.userId,
    }));
    const { error } = await client.rpc("merge_journal_entries", {
      entries: cloudEntries,
    });

    if (error) {
      if (__DEV__) {
        console.warn("Journal backup RPC failed", error);
      }

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
    if (__DEV__) {
      console.warn("Journal backup RPC failed", error);
    }

    return {
      failedEntryIds: entryIds,
      syncedEntryIds: [],
    };
  }
}

export async function pullJournalEntriesFromCloud({
  userId,
}: PullJournalEntriesParams): Promise<PullJournalEntriesResult> {
  if (!userId.trim()) {
    throw new Error("A signed-in user is required to restore a journal.");
  }

  const client = getAuthenticatedSupabaseClient();
  const { data, error } = await client
    .from("journal_entries")
    .select(journalEntrySelectWithTags)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  let journalRows: unknown[] | null = data;
  let journalError = error;

  if (journalError && isMissingTagsColumnError(journalError)) {
    const fallbackResult = await client
      .from("journal_entries")
      .select(journalEntrySelectWithoutTags)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    journalRows = fallbackResult.data;
    journalError = fallbackResult.error;
  }

  if (journalError) {
    if (__DEV__) {
      console.warn("Journal restore query failed", journalError);
    }

    throw new Error("Cloud journal entries could not be loaded.");
  }

  const rows: unknown[] = journalRows ?? [];
  const entries = rows
    .map(parseJournalEntryRow)
    .filter((row) => row.user_id === userId)
    .map(mapJournalEntryRowToEntry);

  return {
    entries,
    pulledCount: entries.length,
  };
}

function parseJournalEntryRow(row: unknown): JournalEntryRow {
  if (!isJournalEntryRow(row)) {
    throw new Error("Cloud journal data is invalid.");
  }

  return row;
}

function isJournalEntryRow(row: unknown): row is JournalEntryRow {
  if (!isRecord(row)) {
    return false;
  }

  return (
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.title === "string" &&
    typeof row.content === "string" &&
    (row.mood === null ||
      (typeof row.mood === "string" && isMoodId(row.mood))) &&
    typeof row.type === "string" &&
    isEntryType(row.type) &&
    (row.prompt === null || typeof row.prompt === "string") &&
    (row.tags === undefined ||
      row.tags === null ||
      (Array.isArray(row.tags) &&
        row.tags.every((tag) => typeof tag === "string"))) &&
    isValidTimestamp(row.created_at) &&
    isValidTimestamp(row.updated_at) &&
    (row.deleted_at === null || isValidTimestamp(row.deleted_at)) &&
    (row.sync_version === undefined ||
      row.sync_version === null ||
      typeof row.sync_version === "number")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEntryType(value: string): value is EntryType {
  return entryTypes.includes(value as EntryType);
}

function isMoodId(value: string): value is MoodId {
  return moodIds.includes(value as MoodId);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isMissingTagsColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" &&
    (error.message ?? "").includes("journal_entries.tags")
  );
}
