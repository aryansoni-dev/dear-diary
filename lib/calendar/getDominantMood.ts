import type { JournalEntry, MoodId } from "@/types/journal";

export const getDominantMood = (entries: JournalEntry[]): MoodId | null => {
  const moodCounts = entries.reduce<Partial<Record<MoodId, number>>>(
    (counts, entry) => {
      if (entry.mood) {
        counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      }

      return counts;
    },
    {},
  );
  let dominantMood: MoodId | null = null;
  let dominantCount = 0;

  for (const [mood, count] of Object.entries(moodCounts) as [
    MoodId,
    number,
  ][]) {
    if (count > dominantCount) {
      dominantMood = mood;
      dominantCount = count;
    }
  }

  if (!dominantMood) {
    return null;
  }

  const tiedMoods = Object.entries(moodCounts)
    .filter(([, count]) => count === dominantCount)
    .map(([mood]) => mood as MoodId);

  if (tiedMoods.length <= 1) {
    return dominantMood;
  }

  const latestTiedEntry = [...entries]
    .filter((entry) => entry.mood && tiedMoods.includes(entry.mood))
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    )[0];

  return latestTiedEntry?.mood ?? dominantMood;
};
