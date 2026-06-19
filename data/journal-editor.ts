import { moodList } from "@/constants/moods";
import type { MoodId } from "@/types/journal";

export type JournalEditorMood = {
  emoji: string;
  id: MoodId;
  label: string;
};

export const journalEditorMoods: JournalEditorMood[] = moodList.map(
  (mood) => ({
    emoji: mood.emoji,
    id: mood.id,
    label: mood.label,
  }),
);
