import type { MoodId } from "@/types/journal";

export type JournalEditorMood = {
  emoji: string;
  id: MoodId;
  label: string;
};

export const journalEditorMoods: JournalEditorMood[] = [
  { emoji: "😊", id: "happy", label: "Happy" },
  { emoji: "😌", id: "calm", label: "Calm" },
  { emoji: "😔", id: "sad", label: "Sad" },
  { emoji: "🔥", id: "motivated", label: "Motivated" },
  { emoji: "😰", id: "anxious", label: "Anxious" },
  { emoji: "🙏", id: "grateful", label: "Grateful" },
];
