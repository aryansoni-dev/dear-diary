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

export type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: MoodId | null;
  type: EntryType;
  prompt?: string;
  createdAt: string;
  updatedAt: string;
};
