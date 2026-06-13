import { useEffect, useMemo, useState } from "react";

import { useAppDialog } from "@/hooks/useAppDialog";
import { getAchievements } from "@/lib/achievements";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useJournalStore } from "@/store/journal-store";
import type { JournalEntry } from "@/types/journal";

type AchievementWatcherProps = {
  userId: string;
};

export function AchievementWatcher({ userId }: AchievementWatcherProps) {
  const { showDialog } = useAppDialog();
  const activeUserId = useJournalStore((state) => state.activeUserId);
  const entries = useJournalStore((state) => state.entries);
  const journalHasHydrated = useJournalStore((state) => state.hasHydrated);
  const achievementHasHydrated = useAchievementStore(
    (state) => state.hasHydrated,
  );
  const achievementNotifications = useAchievementStore(
    (state) => state.achievementNotificationsByUserId[userId],
  );
  const initializeAchievementNotifications = useAchievementStore(
    (state) => state.initializeAchievementNotifications,
  );
  const markAchievementAsNotified = useAchievementStore(
    (state) => state.markAchievementAsNotified,
  );
  const currentStreak = useMemo(() => getReflectionStreak(entries), [entries]);
  const achievements = useMemo(
    () => getAchievements(entries, currentStreak),
    [currentStreak, entries],
  );
  const [visibleAchievementId, setVisibleAchievementId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      !journalHasHydrated ||
      !achievementHasHydrated ||
      activeUserId !== userId
    ) {
      return;
    }

    const unlockedAchievements = achievements.filter(
      (achievement) => achievement.unlocked,
    );
    const unlockedIds = unlockedAchievements.map((achievement) => achievement.id);

    if (!achievementNotifications?.hasInitialized) {
      initializeAchievementNotifications(userId, unlockedIds);
      return;
    }

    if (visibleAchievementId) {
      return;
    }

    const notifiedIds = new Set(
      achievementNotifications.notifiedAchievementIds,
    );
    const newlyUnlockedAchievements = unlockedAchievements.filter(
      (achievement) => !notifiedIds.has(achievement.id),
    );

    if (newlyUnlockedAchievements.length === 0) {
      return;
    }

    const firstAchievement = newlyUnlockedAchievements[0];
    setVisibleAchievementId(firstAchievement.id);
    markAchievementAsNotified(userId, firstAchievement.id);

    function handleAchievementSeen() {
      setVisibleAchievementId(null);
    }

    showDialog({
      confirmText: "Lovely",
      icon: firstAchievement.icon,
      message: firstAchievement.description,
      onCancel: handleAchievementSeen,
      onConfirm: handleAchievementSeen,
      subtitle: firstAchievement.title,
      title: "Achievement Unlocked",
      variant: "success",
    });
  }, [
    achievementNotifications,
    achievementHasHydrated,
    achievements,
    activeUserId,
    initializeAchievementNotifications,
    journalHasHydrated,
    markAchievementAsNotified,
    showDialog,
    userId,
    visibleAchievementId,
  ]);

  return null;
}

function getReflectionStreak(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const entryDays = new Set(
    entries.map((entry) => getLocalDateKey(new Date(entry.createdAt))),
  );
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let cursor = startOfLocalDay(today);

  if (!entryDays.has(getLocalDateKey(cursor))) {
    if (!entryDays.has(getLocalDateKey(yesterday))) {
      return 0;
    }

    cursor = startOfLocalDay(yesterday);
  }

  let streak = 0;

  while (entryDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
