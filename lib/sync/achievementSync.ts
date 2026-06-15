import { Base64 } from "js-base64";

import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import type {
  AchievementState,
  AchievementStateRow,
} from "@/types/achievementSync";

type PullAchievementStatesParams = {
  userId: string;
};

type PushAchievementStatesParams = {
  notifiedAchievementIds: string[];
  unlockedAchievementIds: string[];
  userId: string;
};

type PushAchievementStatesResult = {
  failedCount: number;
  syncedCount: number;
};

type SyncAchievementStatesResult = PushAchievementStatesResult & {
  pulledNotifiedIds: string[];
};

export async function pullAchievementStatesFromCloud({
  userId,
}: PullAchievementStatesParams): Promise<AchievementState[]> {
  if (!userId.trim()) {
    throw new Error("A signed-in user is required to sync achievements.");
  }

  const client = getAuthenticatedSupabaseClient();
  const { data, error } = await client
    .from("achievement_states")
    .select(
      "id, user_id, achievement_id, is_notified, notified_at, first_unlocked_at, created_at, updated_at",
    )
    .eq("user_id", userId);

  if (error) {
    if (__DEV__) {
      console.warn("Achievement state pull failed", error);
    }

    throw new Error("Cloud achievement states could not be loaded.");
  }

  const rows: unknown[] = data ?? [];

  return rows
    .map(parseAchievementStateRow)
    .filter((row) => row.user_id === userId)
    .map(mapAchievementStateRowToState);
}

export async function pushAchievementStatesToCloud({
  notifiedAchievementIds,
  unlockedAchievementIds,
  userId,
}: PushAchievementStatesParams): Promise<PushAchievementStatesResult> {
  const existingStates = await pullAchievementStatesFromCloud({ userId });

  return upsertAchievementStates({
    existingStates,
    notifiedAchievementIds,
    unlockedAchievementIds,
    userId,
  });
}

export async function syncAchievementStatesTwoWay({
  notifiedAchievementIds,
  unlockedAchievementIds,
  userId,
}: PushAchievementStatesParams): Promise<SyncAchievementStatesResult> {
  const cloudStates = await pullAchievementStatesFromCloud({ userId });
  const pulledNotifiedIds = cloudStates
    .filter((state) => state.userId === userId && state.isNotified)
    .map((state) => state.achievementId);
  const mergedNotifiedIds = Array.from(
    new Set([...notifiedAchievementIds, ...pulledNotifiedIds]),
  );
  const pushResult = await upsertAchievementStates({
    existingStates: cloudStates,
    notifiedAchievementIds: mergedNotifiedIds,
    unlockedAchievementIds,
    userId,
  });

  return {
    ...pushResult,
    pulledNotifiedIds,
  };
}

function createAchievementStateId(userId: string, achievementId: string) {
  const encodedUserId = Base64.fromUint8Array(
    new TextEncoder().encode(userId),
    true,
  );

  return `achievement_state_${encodedUserId}_${achievementId}`;
}

function mapAchievementStateRowToState(
  row: AchievementStateRow,
): AchievementState {
  return {
    achievementId: row.achievement_id,
    createdAt: row.created_at,
    firstUnlockedAt: row.first_unlocked_at,
    id: row.id,
    isNotified: row.is_notified,
    notifiedAt: row.notified_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

async function upsertAchievementStates({
  existingStates,
  notifiedAchievementIds,
  unlockedAchievementIds,
  userId,
}: PushAchievementStatesParams & {
  existingStates: AchievementState[];
}): Promise<PushAchievementStatesResult> {
  if (!userId.trim()) {
    throw new Error("A signed-in user is required to sync achievements.");
  }

  const achievementIds = Array.from(
    new Set([...notifiedAchievementIds, ...unlockedAchievementIds]),
  ).filter((achievementId) => achievementId.trim().length > 0);

  if (achievementIds.length === 0) {
    return {
      failedCount: 0,
      syncedCount: 0,
    };
  }

  const currentUserStates = existingStates.filter(
    (state) => state.userId === userId,
  );
  const existingByAchievementId = new Map(
    currentUserStates.map((state) => [state.achievementId, state]),
  );
  const notifiedIdSet = new Set(notifiedAchievementIds);
  const unlockedIdSet = new Set(unlockedAchievementIds);
  const now = new Date().toISOString();
  const rows = achievementIds.map((achievementId) => {
    const existing = existingByAchievementId.get(achievementId);
    const isNotified =
      notifiedIdSet.has(achievementId) || existing?.isNotified === true;

    return {
      achievement_id: achievementId,
      first_unlocked_at:
        existing?.firstUnlockedAt ??
        (unlockedIdSet.has(achievementId) || isNotified ? now : null),
      id: existing?.id ?? createAchievementStateId(userId, achievementId),
      is_notified: isNotified,
      notified_at: isNotified ? (existing?.notifiedAt ?? now) : null,
      updated_at: now,
      user_id: userId,
    };
  });
  const client = getAuthenticatedSupabaseClient();
  const { error } = await client.from("achievement_states").upsert(rows, {
    onConflict: "user_id,achievement_id",
  });

  if (error) {
    if (__DEV__) {
      console.warn("Achievement state push failed", error);
    }

    return {
      failedCount: rows.length,
      syncedCount: 0,
    };
  }

  return {
    failedCount: 0,
    syncedCount: rows.length,
  };
}

function parseAchievementStateRow(row: unknown): AchievementStateRow {
  if (!isAchievementStateRow(row)) {
    throw new Error("Cloud achievement state data is invalid.");
  }

  return row;
}

function isAchievementStateRow(row: unknown): row is AchievementStateRow {
  if (!isRecord(row)) {
    return false;
  }

  return (
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    typeof row.achievement_id === "string" &&
    typeof row.is_notified === "boolean" &&
    isNullableTimestamp(row.notified_at) &&
    isNullableTimestamp(row.first_unlocked_at) &&
    isValidTimestamp(row.created_at) &&
    isValidTimestamp(row.updated_at)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

function isNullableTimestamp(value: unknown) {
  return value === null || isValidTimestamp(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
