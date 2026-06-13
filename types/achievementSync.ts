export type AchievementState = {
  achievementId: string;
  createdAt: string;
  firstUnlockedAt: string | null;
  id: string;
  isNotified: boolean;
  notifiedAt: string | null;
  updatedAt: string;
  userId: string;
};

export type AchievementStateRow = {
  achievement_id: string;
  created_at: string;
  first_unlocked_at: string | null;
  id: string;
  is_notified: boolean;
  notified_at: string | null;
  updated_at: string;
  user_id: string;
};
