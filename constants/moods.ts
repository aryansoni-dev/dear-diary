import type { MoodId } from "@/types/journal";

export type MoodMetadata = {
  backgroundColor: string;
  dotColor: string;
  emoji: string;
  id: MoodId;
  label: string;
  markerBackgroundColor: string;
};

export const moodMetadata: Record<MoodId, MoodMetadata> = {
  anxious: {
    backgroundColor: "#F4EFFA",
    dotColor: "#A98FD0",
    emoji: "😰",
    id: "anxious",
    label: "Anxious",
    markerBackgroundColor: "#F4EFFA",
  },
  calm: {
    backgroundColor: "#D8EEDB",
    dotColor: "#86C99B",
    emoji: "😌",
    id: "calm",
    label: "Calm",
    markerBackgroundColor: "#D8EEDB",
  },
  grateful: {
    backgroundColor: "#DDEFFF",
    dotColor: "#7C9FD9",
    emoji: "🙏",
    id: "grateful",
    label: "Grateful",
    markerBackgroundColor: "#DDEFFF",
  },
  happy: {
    backgroundColor: "#FFDDE8",
    dotColor: "#FF2056",
    emoji: "😊",
    id: "happy",
    label: "Happy",
    markerBackgroundColor: "#FFDDE8",
  },
  motivated: {
    backgroundColor: "#FFE8D8",
    dotColor: "#FF8A3D",
    emoji: "🔥",
    id: "motivated",
    label: "Motivated",
    markerBackgroundColor: "#FFE8D8",
  },
  sad: {
    backgroundColor: "#DDEFFF",
    dotColor: "#7C9FD9",
    emoji: "😔",
    id: "sad",
    label: "Sad",
    markerBackgroundColor: "#DDEFFF",
  },
};

export const moodList: MoodMetadata[] = [
  moodMetadata.happy,
  moodMetadata.calm,
  moodMetadata.sad,
  moodMetadata.motivated,
  moodMetadata.anxious,
  moodMetadata.grateful,
];

export const moodLabels: Record<MoodId, string> = {
  anxious: moodMetadata.anxious.label,
  calm: moodMetadata.calm.label,
  grateful: moodMetadata.grateful.label,
  happy: moodMetadata.happy.label,
  motivated: moodMetadata.motivated.label,
  sad: moodMetadata.sad.label,
};

export const fallbackMoodMetadata = {
  backgroundColor: "#F4F4F5",
  dotColor: "#A1A1AA",
  emoji: "✍️",
  label: "No mood",
  markerBackgroundColor: "#F4F4F5",
};
