export type AchievementCategory =
  | "journaling"
  | "streak"
  | "mood"
  | "intention"
  | "reflection"
  | "depth";

export type AchievementStatus = AchievementDefinition & {
  progress: number;
  unlocked: boolean;
};

export type AchievementDefinition = {
  category: AchievementCategory;
  description: string;
  icon: string;
  id: string;
  target: number;
  title: string;
};
