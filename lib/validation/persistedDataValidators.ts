import { isFaultEnabled } from "@/lib/dev/faultInjection";
import { normalizeTags } from "@/lib/tags";
import { isRecord } from "@/lib/utils/typeGuards";
import type {
  ChatMessage,
  ChatMessageRole,
  ChatMessageSource,
} from "@/types/chat";
import type {
  EntryType,
  JournalEntry,
  JournalSyncStatus,
  MoodId,
} from "@/types/journal";

type StoredJournalEntry = Omit<JournalEntry, "tags"> & {
  tags?: string[];
};

type QuarantineDiagnostic = {
  area: string;
  reason: string;
  reference: string;
};

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

const syncStatuses: JournalSyncStatus[] = ["failed", "pending", "synced"];
const chatMessageRoles: ChatMessageRole[] = ["user", "assistant"];
const chatMessageSources: ChatMessageSource[] = [
  "local",
  "remote_ai",
  "local_fallback",
];

export function normalizePersistedJournalEntries(
  values: unknown[],
): JournalEntry[] {
  const diagnostics: QuarantineDiagnostic[] = [];
  const valuesToNormalize = isFaultEnabled("malformed_local_record")
    ? [...values, { id: "" }]
    : values;
  const entries = valuesToNormalize.reduce<JournalEntry[]>(
    (validEntries, value, index) => {
      const entry = normalizePersistedJournalEntry(value);

      if (!entry) {
        diagnostics.push({
          area: "journal",
          reason: "invalid_shape",
          reference: `index:${index}`,
        });
        return validEntries;
      }

      validEntries.push(entry);
      return validEntries;
    },
    [],
  );

  const dedupedEntries = dedupeJournalEntries(entries, diagnostics);
  reportQuarantineDiagnostics(diagnostics);

  return dedupedEntries;
}

export function normalizePersistedChatMessages(
  values: unknown[],
): ChatMessage[] {
  const diagnostics: QuarantineDiagnostic[] = [];
  const messages = values.reduce<ChatMessage[]>((validMessages, value, index) => {
    const message = normalizePersistedChatMessage(value);

    if (!message) {
      diagnostics.push({
        area: "chat",
        reason: "invalid_shape",
        reference: `index:${index}`,
      });
      return validMessages;
    }

    validMessages.push(message);
    return validMessages;
  }, []);

  reportQuarantineDiagnostics(diagnostics);

  return messages;
}

export function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeReminderTime(
  value: unknown,
  fallback: string,
): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : fallback;
}

function normalizePersistedJournalEntry(
  value: unknown,
): JournalEntry | null {
  if (!isStoredJournalEntry(value)) {
    return null;
  }

  return {
    ...value,
    deletedAt: value.deletedAt ?? null,
    prompt: value.prompt,
    syncStatus: value.syncStatus ?? "pending",
    tags: normalizeTags(value.tags ?? []),
  };
}

function isStoredJournalEntry(value: unknown): value is StoredJournalEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.userId) &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    (value.mood === null ||
      (typeof value.mood === "string" && isMoodId(value.mood))) &&
    typeof value.type === "string" &&
    isEntryType(value.type) &&
    (value.prompt === undefined || typeof value.prompt === "string") &&
    (value.tags === undefined ||
      (Array.isArray(value.tags) &&
        value.tags.every((tag) => typeof tag === "string"))) &&
    isValidTimestamp(value.createdAt) &&
    isValidTimestamp(value.updatedAt) &&
    (value.deletedAt === undefined ||
      value.deletedAt === null ||
      isValidTimestamp(value.deletedAt)) &&
    (value.syncStatus === undefined || isJournalSyncStatus(value.syncStatus))
  );
}

function normalizePersistedChatMessage(value: unknown): ChatMessage | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.userId) ||
    typeof value.role !== "string" ||
    !chatMessageRoles.includes(value.role as ChatMessageRole) ||
    typeof value.content !== "string" ||
    !isValidTimestamp(value.createdAt)
  ) {
    return null;
  }

  if (
    value.relatedEntryIds !== undefined &&
    (!Array.isArray(value.relatedEntryIds) ||
      !value.relatedEntryIds.every(isNonEmptyString))
  ) {
    return null;
  }

  if (value.isPartial !== undefined && typeof value.isPartial !== "boolean") {
    return null;
  }

  if (
    value.source !== undefined &&
    (typeof value.source !== "string" ||
      !chatMessageSources.includes(value.source as ChatMessageSource))
  ) {
    return null;
  }

  return {
    content: value.content,
    createdAt: value.createdAt,
    id: value.id,
    isPartial: value.isPartial as boolean | undefined,
    relatedEntryIds: value.relatedEntryIds as string[] | undefined,
    role: value.role as ChatMessageRole,
    source: value.source as ChatMessageSource | undefined,
    userId: value.userId,
  };
}

function dedupeJournalEntries(
  entries: JournalEntry[],
  diagnostics: QuarantineDiagnostic[],
): JournalEntry[] {
  const entriesByScopedId = new Map<string, JournalEntry>();

  entries.forEach((entry) => {
    const scopedId = `${entry.userId}:${entry.id}`;
    const existingEntry = entriesByScopedId.get(scopedId);

    if (!existingEntry) {
      entriesByScopedId.set(scopedId, entry);
      return;
    }

    diagnostics.push({
      area: "journal",
      reason: "duplicate_id",
      reference: hashDiagnosticReference(scopedId),
    });

    entriesByScopedId.set(scopedId, chooseJournalEntryWinner(existingEntry, entry));
  });

  return Array.from(entriesByScopedId.values());
}

function chooseJournalEntryWinner(
  firstEntry: JournalEntry,
  secondEntry: JournalEntry,
) {
  const firstUpdatedAt = Date.parse(firstEntry.updatedAt);
  const secondUpdatedAt = Date.parse(secondEntry.updatedAt);

  if (secondUpdatedAt > firstUpdatedAt) {
    return secondEntry;
  }

  return firstEntry;
}

function reportQuarantineDiagnostics(diagnostics: QuarantineDiagnostic[]) {
  if (!__DEV__ || diagnostics.length === 0) {
    return;
  }

  const summary = diagnostics.reduce<Record<string, number>>(
    (counts, diagnostic) => {
      const key = `${diagnostic.area}:${diagnostic.reason}`;
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    {},
  );

  console.warn("Persisted data quarantine", {
    summary,
    references: diagnostics.map((diagnostic) => diagnostic.reference).slice(0, 5),
  });
}

function hashDiagnosticReference(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return `ref:${hash.toString(16)}`;
}

function isEntryType(value: string): value is EntryType {
  return entryTypes.includes(value as EntryType);
}

function isMoodId(value: string): value is MoodId {
  return moodIds.includes(value as MoodId);
}

function isJournalSyncStatus(value: unknown): value is JournalSyncStatus {
  return typeof value === "string" && syncStatuses.includes(value as JournalSyncStatus);
}
