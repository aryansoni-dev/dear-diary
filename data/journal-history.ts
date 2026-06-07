import type { MoodId } from "@/types/journal";

export type JournalMoodFilter = {
  backgroundColor: string;
  emoji?: string;
  id: MoodId | "all";
  label: string;
};

export const journalMoodFilters: JournalMoodFilter[] = [
  { id: "all", label: "All", backgroundColor: "#FF2056" },
  { emoji: "😊", id: "happy", label: "Happy", backgroundColor: "#FFDDE8" },
  { emoji: "😌", id: "calm", label: "Calm", backgroundColor: "#D8EEDB" },
  { emoji: "😔", id: "sad", label: "Sad", backgroundColor: "#DDEFFF" },
  {
    emoji: "🔥",
    id: "motivated",
    label: "Motivated",
    backgroundColor: "#FFE8D8",
  },
  { emoji: "😰", id: "anxious", label: "Anxious", backgroundColor: "#F4EFFA" },
  {
    emoji: "🙏",
    id: "grateful",
    label: "Grateful",
    backgroundColor: "#DDEFFF",
  },
];
