import type { JournalSyncStatus, MoodId } from "@/types/journal";

export type MoodLogSyncStatus = JournalSyncStatus;

export type MoodLog = {
  id: string;
  userId: string;
  mood: MoodId;
  note: string | null;
  intensity: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus?: MoodLogSyncStatus;
};
