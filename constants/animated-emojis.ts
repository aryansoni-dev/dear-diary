import anxious from "@/assets/animated-emojis/anxious.json";
import calm from "@/assets/animated-emojis/calm.json";
import grateful from "@/assets/animated-emojis/grateful.json";
import happy from "@/assets/animated-emojis/happy.json";
import motivated from "@/assets/animated-emojis/motivated.json";
import sad from "@/assets/animated-emojis/sad.json";
import type { MoodId } from "@/types/journal";
import type { LottieViewProps } from "lottie-react-native";

export const animatedMoodEmojis: Record<MoodId, LottieViewProps["source"]> = {
  anxious,
  calm,
  grateful,
  happy,
  motivated,
  sad,
};
