import type { JournalEntry, MoodId } from "@/types/journal";

const latestEntryCount = 3;

const moodLabels: Record<MoodId, string> = {
  anxious: "Anxious",
  calm: "Calm",
  grateful: "Grateful",
  happy: "Happy",
  motivated: "Motivated",
  sad: "Sad",
};

const moodWords = [
  "mood",
  "emotion",
  "feeling",
  "happy",
  "sad",
  "calm",
  "anxious",
  "stressed",
] as const;

const recentWords = [
  "recent",
  "lately",
  "last few entries",
  "what did i write",
] as const;

const stressWords = [
  "stress",
  "stressed",
  "challenge",
  "hard",
  "difficult",
  "anxious",
  "worry",
  "pressure",
] as const;

const gratitudeWords = ["gratitude", "grateful", "thankful"] as const;

const patternWords = ["pattern", "notice", "trend", "insight"] as const;

const topicStopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "been",
  "feel",
  "felt",
  "from",
  "have",
  "into",
  "just",
  "like",
  "more",
  "that",
  "the",
  "this",
  "today",
  "what",
  "when",
  "with",
  "work",
  "your",
]);

export const generateLocalJournalResponse = (params: {
  message: string;
  entries: JournalEntry[];
}): {
  response: string;
  relatedEntryIds: string[];
} => {
  const visibleEntries = params.entries.filter((entry) => !entry.deletedAt);
  const sortedEntries = getEntriesNewestFirst(visibleEntries);
  const normalizedMessage = params.message.toLowerCase();

  if (sortedEntries.length === 0) {
    return {
      relatedEntryIds: [],
      response:
        "I don't have enough journal entries to reflect on yet. Write a few reflections, and I'll help you notice patterns.",
    };
  }

  if (hasAnyTerm(normalizedMessage, recentWords)) {
    return getRecentEntriesResponse(sortedEntries);
  }

  if (hasAnyTerm(normalizedMessage, gratitudeWords)) {
    return getGratitudeResponse(sortedEntries);
  }

  if (hasAnyTerm(normalizedMessage, stressWords)) {
    return getStressResponse(sortedEntries);
  }

  if (hasAnyTerm(normalizedMessage, moodWords)) {
    return getMoodResponse(sortedEntries);
  }

  if (hasAnyTerm(normalizedMessage, patternWords)) {
    return getPatternResponse(sortedEntries);
  }

  return {
    relatedEntryIds: [],
    response:
      "I looked through your reflections. I can help you explore your moods, recent entries, gratitude moments, stress patterns, or recurring themes.",
  };
};

function getRecentEntriesResponse(entries: JournalEntry[]) {
  const recentEntries = entries.slice(0, latestEntryCount);
  const summaries = recentEntries
    .map(
      (entry) =>
        `${formatEntryDate(entry.createdAt)}: ${entry.title || "Untitled"} - ${getEntryPreview(entry)}`,
    )
    .join("\n");

  return {
    relatedEntryIds: recentEntries.map((entry) => entry.id),
    response: `Here are your latest ${recentEntries.length} reflections:\n${summaries}`,
  };
}

function getMoodResponse(entries: JournalEntry[]) {
  const moodCounts = entries.reduce<Partial<Record<MoodId, number>>>(
    (counts, entry) => {
      if (!entry.mood) {
        return counts;
      }

      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const topMood = getTopMood(moodCounts);

  if (!topMood) {
    return {
      relatedEntryIds: [],
      response:
        "I found your reflections, but they don't have mood tags yet. Add moods to future entries and I'll help you notice emotional patterns.",
    };
  }

  const count = moodCounts[topMood] ?? 0;
  const relatedEntryIds = entries
    .filter((entry) => entry.mood === topMood)
    .slice(0, latestEntryCount)
    .map((entry) => entry.id);

  return {
    relatedEntryIds,
    response: `Your most common recent mood has been ${moodLabels[topMood]}. It appeared in ${count} ${count === 1 ? "reflection" : "reflections"}.`,
  };
}

function getStressResponse(entries: JournalEntry[]) {
  const matchedEntries = entries.filter((entry) =>
    hasAnyTerm(getSearchableEntryText(entry), stressWords),
  );
  const latestEntry = matchedEntries[0];

  if (!latestEntry) {
    return {
      relatedEntryIds: [],
      response:
        "I didn't find clear mentions of stress or challenge in your reflections yet. If it helps, try writing about what felt heavy today.",
    };
  }

  return {
    relatedEntryIds: matchedEntries
      .slice(0, latestEntryCount)
      .map((entry) => entry.id),
    response: `I found a few reflections that mention stress or challenge. The most recent one was about ${latestEntry.title || getEntryPreview(latestEntry)}.`,
  };
}

function getGratitudeResponse(entries: JournalEntry[]) {
  const matchedEntries = entries.filter((entry) => {
    return (
      entry.type === "gratitude" ||
      hasAnyTerm(getSearchableEntryText(entry), gratitudeWords)
    );
  });

  if (matchedEntries.length === 0) {
    return {
      relatedEntryIds: [],
      response:
        "I didn't find gratitude reflections yet. You could start with one small thing that felt supportive, kind, or steady today.",
    };
  }

  const latestEntry = matchedEntries[0];

  return {
    relatedEntryIds: matchedEntries
      .slice(0, latestEntryCount)
      .map((entry) => entry.id),
    response: `I found ${matchedEntries.length} ${matchedEntries.length === 1 ? "gratitude moment" : "gratitude moments"} in your reflections. The most recent one was about ${latestEntry.title || getEntryPreview(latestEntry)}.`,
  };
}

function getPatternResponse(entries: JournalEntry[]) {
  const topMood = getTopMood(
    entries.reduce<Partial<Record<MoodId, number>>>((counts, entry) => {
      if (entry.mood) {
        counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      }

      return counts;
    }, {}),
  );
  const recurringTopic = getRecurringTopic(entries);
  const streak = getReflectionStreak(entries);

  if (topMood && recurringTopic) {
    return {
      relatedEntryIds: entries.slice(0, latestEntryCount).map((entry) => entry.id),
      response: `One pattern I noticed: ${moodLabels[topMood]} shows up often, and "${recurringTopic}" appears as a recurring theme. Your current reflection streak is ${streak} ${streak === 1 ? "day" : "days"}.`,
    };
  }

  if (topMood) {
    return {
      relatedEntryIds: entries
        .filter((entry) => entry.mood === topMood)
        .slice(0, latestEntryCount)
        .map((entry) => entry.id),
      response: `One pattern I noticed: ${moodLabels[topMood]} is your most common mood. Your current reflection streak is ${streak} ${streak === 1 ? "day" : "days"}.`,
    };
  }

  return {
    relatedEntryIds: entries.slice(0, latestEntryCount).map((entry) => entry.id),
    response: `One pattern I noticed: you have ${entries.length} ${entries.length === 1 ? "reflection" : "reflections"} saved locally. Keep writing and I'll be able to spot clearer mood and theme trends.`,
  };
}

function getEntriesNewestFirst(entries: JournalEntry[]) {
  return [...entries].sort(
    (entryA, entryB) =>
      new Date(entryB.createdAt).getTime() -
      new Date(entryA.createdAt).getTime(),
  );
}

function getTopMood(moodCounts: Partial<Record<MoodId, number>>) {
  return Object.entries(moodCounts).reduce<MoodId | null>(
    (currentMood, [mood, count]) => {
      if (!currentMood) {
        return mood as MoodId;
      }

      return count > (moodCounts[currentMood] ?? 0)
        ? (mood as MoodId)
        : currentMood;
    },
    null,
  );
}

function getRecurringTopic(entries: JournalEntry[]) {
  const wordCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    const words = entry.content.toLowerCase().match(/[a-z']+/g) ?? [];

    words.forEach((word) => {
      if (word.length < 4 || topicStopWords.has(word)) {
        return;
      }

      counts[word] = (counts[word] ?? 0) + 1;
    });

    return counts;
  }, {});

  const [word, count] =
    Object.entries(wordCounts).sort((topicA, topicB) => {
      const countDifference = topicB[1] - topicA[1];

      if (countDifference !== 0) {
        return countDifference;
      }

      return topicA[0].localeCompare(topicB[0]);
    })[0] ?? [];

  return count && count > 1 ? word : null;
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

function getSearchableEntryText(entry: JournalEntry) {
  return `${entry.title} ${entry.content} ${entry.prompt ?? ""}`.toLowerCase();
}

function hasAnyTerm(value: string, terms: readonly string[]) {
  return terms.some((term) => value.includes(term));
}

function getEntryPreview(entry: JournalEntry) {
  const preview = entry.content.replace(/\s+/g, " ").trim();

  if (preview.length <= 90) {
    return preview || "a saved reflection";
  }

  return `${preview.slice(0, 87).trim()}...`;
}

function formatEntryDate(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));
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
