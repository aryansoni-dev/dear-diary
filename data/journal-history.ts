import { moodList } from "@/constants/moods";
import type { MoodId } from "@/types/journal";

export type JournalMoodFilter = {
  backgroundColor: string;
  emoji?: string;
  id: MoodId | "all";
  label: string;
};

export const journalMoodFilters: JournalMoodFilter[] = [
  { id: "all", label: "All", backgroundColor: "#FF2056" },
  ...moodList.map((mood) => ({
    backgroundColor: mood.backgroundColor,
    emoji: mood.emoji,
    id: mood.id,
    label: mood.label,
  })),
];
