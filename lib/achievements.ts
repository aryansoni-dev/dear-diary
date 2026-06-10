import { achievementDefinitions } from "@/data/achievements";
import type { AchievementStatus } from "@/types/achievement";
import type { EntryType, JournalEntry } from "@/types/journal";

export function getAchievements(
  entries: JournalEntry[],
  currentStreak: number,
): AchievementStatus[] {
  return achievementDefinitions.map((achievement) => {
    const progress = getAchievementProgress(
      achievement.id,
      entries,
      currentStreak,
    );
    const clampedProgress = Math.min(progress, achievement.target);

    return {
      ...achievement,
      progress: clampedProgress,
      unlocked: clampedProgress >= achievement.target,
    };
  });
}

export function getUnlockedAchievements(
  entries: JournalEntry[],
  currentStreak: number,
) {
  return getAchievements(entries, currentStreak).filter(
    (achievement) => achievement.unlocked,
  );
}

export function getLockedAchievements(
  entries: JournalEntry[],
  currentStreak: number,
) {
  return getAchievements(entries, currentStreak).filter(
    (achievement) => !achievement.unlocked,
  );
}

export function getWordCount(content: string) {
  const words = content.trim().match(/\S+/g);

  return words?.length ?? 0;
}

function getAchievementProgress(
  achievementId: string,
  entries: JournalEntry[],
  currentStreak: number,
) {
  switch (achievementId) {
    case "journaling-first-reflection":
    case "journaling-getting-started":
    case "journaling-thought-collector":
    case "journaling-inner-library":
    case "journaling-reflection-keeper":
    case "journaling-deardiary-devotee":
      return entries.length;
    case "streak-two-quiet-days":
    case "streak-gentle-habit":
    case "streak-one-week-within":
    case "streak-consistent-soul":
    case "streak-monthly-ritual":
      return currentStreak;
    case "mood-noticed":
    case "mood-emotion-explorer":
    case "mood-pattern-seeker":
    case "mood-self-aware":
      return entries.filter((entry) => entry.mood !== null).length;
    case "intention-first-intention":
    case "intention-morning-spark":
    case "intention-purposeful-week":
      return getEntryTypeCount(entries, "morning_intention");
    case "reflection-grateful-heart":
      return getEntryTypeCount(entries, "gratitude");
    case "reflection-evening-check-in":
      return getEntryTypeCount(entries, "evening_reflection");
    case "reflection-prompt-explorer":
      return getEntryTypeCount(entries, "daily_prompt");
    case "reflection-ai-companion":
      return getEntryTypeCount(entries, "ai_reflection");
    case "depth-honest-paragraph":
      return hasEntryWithWords(entries, 50) ? 1 : 0;
    case "depth-deep-reflection":
      return hasEntryWithWords(entries, 150) ? 1 : 0;
    case "depth-open-heart":
      return entries.filter((entry) => getWordCount(entry.content) >= 100)
        .length;
    case "depth-long-thought":
      return hasEntryWithWords(entries, 300) ? 1 : 0;
    default:
      return 0;
  }
}

function getEntryTypeCount(entries: JournalEntry[], type: EntryType) {
  return entries.filter((entry) => entry.type === type).length;
}

function hasEntryWithWords(entries: JournalEntry[], minimumWordCount: number) {
  return entries.some((entry) => getWordCount(entry.content) >= minimumWordCount);
}
