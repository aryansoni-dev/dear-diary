import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import type { MoodId } from "@/types/journal";
import type { MoodLog } from "@/types/moodLog";

const moodIds: MoodId[] = [
  "happy",
  "calm",
  "sad",
  "motivated",
  "anxious",
  "grateful",
];

const moodLogSelect =
  "id, user_id, mood, note, intensity, created_at, updated_at, deleted_at";

type MoodLogRow = {
  created_at: string;
  deleted_at: string | null;
  id: string;
  intensity: number | null;
  mood: string;
  note: string | null;
  updated_at: string;
  user_id: string;
};

type PushMoodLogsParams = {
  moodLogs: MoodLog[];
  userId: string;
};

type PushMoodLogsResult = {
  failedMoodLogIds: string[];
  syncedMoodLogIds: string[];
};

type PullMoodLogsParams = {
  userId: string;
};

type PullMoodLogsResult = {
  moodLogs: MoodLog[];
  pulledCount: number;
};

const mapMoodLogRowToMoodLog = (row: MoodLogRow): MoodLog => ({
  createdAt: row.created_at,
  deletedAt: row.deleted_at,
  id: row.id,
  intensity: row.intensity,
  mood: row.mood as MoodId,
  note: row.note,
  syncStatus: "synced",
  updatedAt: row.updated_at,
  userId: row.user_id,
});

export async function pushMoodLogsToCloud({
  moodLogs,
  userId,
}: PushMoodLogsParams): Promise<PushMoodLogsResult> {
  if (!userId) {
    return {
      failedMoodLogIds: [],
      syncedMoodLogIds: [],
    };
  }

  const currentUserMoodLogs = moodLogs.filter(
    (moodLog) => moodLog.userId === userId,
  );
  const moodLogIds = currentUserMoodLogs.map((moodLog) => moodLog.id);

  if (currentUserMoodLogs.length === 0) {
    return {
      failedMoodLogIds: [],
      syncedMoodLogIds: [],
    };
  }

  try {
    const client = getAuthenticatedSupabaseClient();
    const rows = currentUserMoodLogs.map((moodLog) => ({
      created_at: moodLog.createdAt,
      deleted_at: moodLog.deletedAt ?? null,
      id: moodLog.id,
      intensity: moodLog.intensity,
      mood: moodLog.mood,
      note: moodLog.note,
      updated_at: moodLog.updatedAt,
      user_id: moodLog.userId,
    }));
    const { error } = await client.from("mood_logs").upsert(rows, {
      onConflict: "id",
    });

    if (error) {
      if (__DEV__) {
        console.warn("Mood log backup failed", error);
      }

      return {
        failedMoodLogIds: moodLogIds,
        syncedMoodLogIds: [],
      };
    }

    return {
      failedMoodLogIds: [],
      syncedMoodLogIds: moodLogIds,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("Mood log backup failed", error);
    }

    return {
      failedMoodLogIds: moodLogIds,
      syncedMoodLogIds: [],
    };
  }
}

export async function pullMoodLogsFromCloud({
  userId,
}: PullMoodLogsParams): Promise<PullMoodLogsResult> {
  if (!userId.trim()) {
    throw new Error("A signed-in user is required to restore mood logs.");
  }

  const client = getAuthenticatedSupabaseClient();
  const { data, error } = await client
    .from("mood_logs")
    .select(moodLogSelect)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (__DEV__) {
      console.warn("Mood log restore query failed", error);
    }

    throw new Error("Cloud mood logs could not be loaded.");
  }

  const rows: unknown[] = data ?? [];
  const moodLogs = rows
    .map(parseMoodLogRow)
    .filter((row) => row.user_id === userId)
    .map(mapMoodLogRowToMoodLog);

  return {
    moodLogs,
    pulledCount: moodLogs.length,
  };
}

function parseMoodLogRow(row: unknown): MoodLogRow {
  if (!isMoodLogRow(row)) {
    throw new Error("Cloud mood log data is invalid.");
  }

  return row;
}

function isMoodLogRow(row: unknown): row is MoodLogRow {
  if (!isRecord(row)) {
    return false;
  }

  return (
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.mood === "string" &&
    isMoodId(row.mood) &&
    (row.note === null || typeof row.note === "string") &&
    (row.intensity === null ||
      (typeof row.intensity === "number" &&
        Number.isInteger(row.intensity) &&
        row.intensity >= 1 &&
        row.intensity <= 5)) &&
    isValidTimestamp(row.created_at) &&
    isValidTimestamp(row.updated_at) &&
    (row.deleted_at === null || isValidTimestamp(row.deleted_at))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMoodId(value: string): value is MoodId {
  return moodIds.includes(value as MoodId);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
