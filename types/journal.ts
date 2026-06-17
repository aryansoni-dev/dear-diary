export type MoodId =
  | "happy"
  | "calm"
  | "sad"
  | "motivated"
  | "anxious"
  | "grateful";

export type EntryType =
  | "free_write"
  | "daily_prompt"
  | "morning_intention"
  | "evening_reflection"
  | "gratitude"
  | "ai_reflection";

export type JournalSyncStatus = "synced" | "pending" | "failed";

export type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: MoodId | null;
  type: EntryType;
  prompt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  syncStatus?: JournalSyncStatus;
  deletedAt?: string | null;
};
