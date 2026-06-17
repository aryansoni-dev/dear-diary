import type { JournalEntry, MoodId } from "@/types/journal";

import {
  type ClientContext,
  detectChatIntent,
  getCapabilityResponse,
  getDateTimeResponse,
  getPromptGenerationResponse,
  getSmallTalkResponse,
  getUnsupportedResponse,
  type RecentChatMessage,
  shouldUseJournalContext,
} from "@/lib/ai/chatIntent";

const latestEntryCount = 5;
type SummaryPeriod = "today" | "week" | "month" | "year" | "all_time";

const moodLabels: Record<MoodId, string> = {
  anxious: "Anxious",
  calm: "Calm",
  grateful: "Grateful",
  happy: "Happy",
  motivated: "Motivated",
  sad: "Sad",
};

const stressWords = [
  "stress",
  "stressed",
  "challenge",
  "challenged",
  "hard",
  "difficult",
  "anxious",
  "worry",
  "pressure",
] as const;

const gratitudeWords = ["gratitude", "grateful", "thankful"] as const;

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
  clientContext?: ClientContext;
  message: string;
  entries: JournalEntry[];
  recentMessages?: RecentChatMessage[];
}): {
  response: string;
  relatedEntryIds: string[];
  usedJournalContext: boolean;
} => {
  const recentMessages = params.recentMessages ?? [];
  const intent = detectChatIntent(params.message, recentMessages);
  const usedJournalContext = shouldUseJournalContext(intent);

  if (intent === "crisis") {
    return {
      relatedEntryIds: [],
      response:
        "I'm really sorry you're feeling this way. If you might hurt yourself or feel unsafe, please contact emergency services in your area or reach out to someone you trust right now. If you can, move near another person and tell them what's going on.",
      usedJournalContext: false,
    };
  }

  if (intent === "small_talk") {
    return {
      relatedEntryIds: [],
      response: getSmallTalkResponse(params.message),
      usedJournalContext: false,
    };
  }

  if (intent === "date_time") {
    return {
      relatedEntryIds: [],
      response: getDateTimeResponse({
        clientContext: params.clientContext,
        message: params.message,
      }),
      usedJournalContext: false,
    };
  }

  if (intent === "app_capability") {
    return {
      relatedEntryIds: [],
      response: getCapabilityResponse(),
      usedJournalContext: false,
    };
  }

  if (intent === "prompt_generation") {
    return {
      relatedEntryIds: [],
      response: getPromptGenerationResponse(),
      usedJournalContext: false,
    };
  }

  if (intent === "unsupported") {
    return {
      relatedEntryIds: [],
      response: getUnsupportedResponse(),
      usedJournalContext: false,
    };
  }

  if (intent === "general") {
    return {
      relatedEntryIds: [],
      response:
        "I'm here with you. Tell me a little more about what's on your mind.",
      usedJournalContext: false,
    };
  }

  const visibleEntries = params.entries.filter((entry) => !entry.deletedAt);
  const sortedEntries = getEntriesNewestFirst(visibleEntries);

  if (intent === "follow_up") {
    return {
      ...getFollowUpResponse(sortedEntries, recentMessages),
      usedJournalContext,
    };
  }

  if (sortedEntries.length === 0) {
    return {
      relatedEntryIds: [],
      response:
        "I don't have enough journal entries to reflect on yet. Write a few reflections, and I'll help you notice patterns.",
      usedJournalContext,
    };
  }

  if (intent === "journal_summary") {
    return {
      ...getJournalSummaryResponse(
        sortedEntries,
        params.message,
        params.clientContext,
      ),
      usedJournalContext,
    };
  }

  if (intent === "recent_entries") {
    return {
      ...getRecentEntriesResponse(sortedEntries),
      usedJournalContext,
    };
  }

  if (intent === "gratitude") {
    return {
      ...getGratitudeResponse(sortedEntries),
      usedJournalContext,
    };
  }

  if (intent === "stress") {
    return {
      ...getStressResponse(sortedEntries, params.message, params.clientContext),
      usedJournalContext,
    };
  }

  if (intent === "mood") {
    return {
      ...getMoodResponse(sortedEntries, params.message, params.clientContext),
      usedJournalContext,
    };
  }

  if (intent === "journal_analysis") {
    return {
      ...getPatternResponse(sortedEntries),
      usedJournalContext,
    };
  }

  if (intent === "journal_search") {
    const matchedEntries = rankEntriesByMessage(sortedEntries, params.message, {
      fallbackToAll: false,
    }).slice(0, latestEntryCount);

    if (matchedEntries.length === 0) {
      return {
        relatedEntryIds: [],
        response: "I couldn't find matching reflections for that search yet.",
        usedJournalContext,
      };
    }

    return {
      ...getEntryListResponse(
        "I found these matching reflections:",
        matchedEntries,
      ),
      usedJournalContext,
    };
  }

  return {
    relatedEntryIds: [],
    response:
      "That sounds worth sitting with. What part of it feels most important right now?",
    usedJournalContext,
  };
};

function getFollowUpResponse(
  entries: JournalEntry[],
  recentMessages: RecentChatMessage[],
) {
  const previousRelatedEntryIds = [...recentMessages]
    .reverse()
    .find(
      (recentMessage) =>
        recentMessage.role === "assistant" &&
        (recentMessage.relatedEntryIds?.length ?? 0) > 0,
    )?.relatedEntryIds;
  const relatedEntries = previousRelatedEntryIds
    ?.map((entryId) => entries.find((entry) => entry.id === entryId))
    .filter((entry): entry is JournalEntry => entry !== undefined);

  if (!relatedEntries?.length) {
    return {
      relatedEntryIds: [],
      response:
        "I couldn't recover the specific journal entries from the previous answer while offline. Please ask the full question again.",
    };
  }

  return getEntryListResponse(
    "The reflections I was referring to are:",
    relatedEntries,
  );
}

function getJournalSummaryResponse(
  entries: JournalEntry[],
  message: string,
  clientContext?: ClientContext,
) {
  const period = detectSummaryPeriod(message);
  const matchingEntries = filterEntriesByRequestedPeriod(
    entries,
    message,
    clientContext,
  );
  const periodLabel = getSummaryPeriodLabel(
    period,
    message,
    getClientDate(clientContext),
  );

  if (matchingEntries.length === 0) {
    return {
      relatedEntryIds: [],
      response: `I don't have any journal entries from ${periodLabel} to summarize yet.`,
    };
  }

  const selectedEntries = matchingEntries.slice(0, latestEntryCount);
  const topMood = getTopMood(
    matchingEntries.reduce<Partial<Record<MoodId, number>>>((counts, entry) => {
      if (entry.mood) {
        counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      }

      return counts;
    }, {}),
  );
  const gratitudeCount = matchingEntries.filter(
    (entry) =>
      entry.type === "gratitude" ||
      hasAnyTerm(getSearchableEntryText(entry), gratitudeWords),
  ).length;
  const challengeCount = matchingEntries.filter(
    (entry) =>
      hasAnyTerm(getSearchableEntryText(entry), stressWords) ||
      entry.mood === "anxious" ||
      entry.mood === "sad",
  ).length;
  const recurringTopic = getRecurringTopic(matchingEntries);
  const exampleTitles = selectedEntries
    .map((entry) => entry.title || getEntryPreview(entry))
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return {
    relatedEntryIds: selectedEntries.map((entry) => entry.id),
    response: [
      `Here’s your ${periodLabel} reflection summary:`,
      "",
      "1. Overall Theme",
      recurringTopic
        ? `A recurring thread was "${recurringTopic}", based on ${matchingEntries.length} ${matchingEntries.length === 1 ? "entry" : "entries"}.`
        : `You have ${matchingEntries.length} ${matchingEntries.length === 1 ? "entry" : "entries"} in this period, but the themes are still light.`,
      "",
      "2. Things You Did",
      exampleTitles
        ? `You reflected on moments like ${exampleTitles}.`
        : "Not enough data for this yet.",
      "",
      "3. How You Felt",
      topMood
        ? `${moodLabels[topMood]} showed up most often.`
        : "Not enough mood-tagged data for this yet.",
      "",
      "4. Mood Shifts",
      "Not enough data for this yet.",
      "",
      "5. What You Enjoyed",
      gratitudeCount > 0
        ? `Gratitude or wins appeared in ${gratitudeCount} ${gratitudeCount === 1 ? "entry" : "entries"}.`
        : "Not enough data for this yet.",
      "",
      "6. What Challenged You",
      challengeCount > 0
        ? `Challenge or heavier emotion appeared in ${challengeCount} ${challengeCount === 1 ? "entry" : "entries"}.`
        : "Not enough data for this yet.",
      "",
      "7. What You Could Have Done Better",
      "Writing one extra detail in each entry would make future summaries deeper.",
      "",
      "8. Patterns I Noticed",
      recurringTopic
        ? `"${recurringTopic}" seems worth watching as a pattern.`
        : "Keep writing and clearer patterns will emerge.",
      "",
      "9. Gentle Next Step",
      'Try ending your next entry with: "What felt heavy today, and what helped me move through it?"',
    ].join("\n"),
  };
}

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

function getMoodResponse(
  entries: JournalEntry[],
  message: string,
  clientContext?: ClientContext,
) {
  const matchingEntries = filterEntriesByRequestedPeriod(
    entries,
    message,
    clientContext,
  );
  const moodCounts = matchingEntries.reduce<Partial<Record<MoodId, number>>>(
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
      response: message.toLowerCase().includes("week")
        ? "I don't have enough journal entries from this week to answer that clearly yet."
        : "I found your reflections, but they don't have mood tags yet. Add moods to future entries and I'll help you notice emotional patterns.",
    };
  }

  const count = moodCounts[topMood] ?? 0;
  const relatedEntryIds = matchingEntries
    .filter((entry) => entry.mood === topMood)
    .slice(0, latestEntryCount)
    .map((entry) => entry.id);

  return {
    relatedEntryIds,
    response: `Your most common recent mood has been ${moodLabels[topMood]}. It appeared in ${count} ${count === 1 ? "reflection" : "reflections"}.`,
  };
}

function getStressResponse(
  entries: JournalEntry[],
  message: string,
  clientContext?: ClientContext,
) {
  const periodEntries = filterEntriesByRequestedPeriod(
    entries,
    message,
    clientContext,
  );
  const matchedEntries = periodEntries
    .filter(
      (entry) =>
        hasAnyTerm(getSearchableEntryText(entry), stressWords) ||
        entry.mood === "anxious" ||
        entry.mood === "sad" ||
        entry.type === "evening_reflection",
    )
    .slice(0, latestEntryCount);

  if (matchedEntries.length === 0) {
    return {
      relatedEntryIds: [],
      response: message.toLowerCase().includes("week")
        ? "I don't have enough journal entries from this week to answer that clearly yet."
        : "I didn't find clear mentions of stress or challenge in your reflections yet.",
    };
  }

  return getEntryListResponse(
    "I found these likely stress or challenge points:",
    matchedEntries,
  );
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
    const words =
      `${entry.tags.join(" ")} ${entry.content}`
        .toLowerCase()
        .match(/[a-z']+/g) ?? [];

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
  return [
    entry.title,
    entry.content,
    entry.prompt ?? "",
    entry.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
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

function getEntryListResponse(title: string, entries: JournalEntry[]) {
  const items = entries
    .map(
      (entry, index) =>
        `${index + 1}. ${entry.title || "Untitled"} - ${getEntryPreview(entry)}`,
    )
    .join("\n");

  return {
    relatedEntryIds: entries.map((entry) => entry.id),
    response: `${title}\n\n${items}`,
  };
}

function filterEntriesByRequestedPeriod(
  entries: JournalEntry[],
  message: string,
  clientContext?: ClientContext,
) {
  const period = detectSummaryPeriod(message);
  const requestedMonthIndex = getRequestedMonthIndex(message);
  const requestedYear = getRequestedYear(message);

  if (period === "today") {
    const todayKey = getLocalDateKey(getClientDate(clientContext));

    return entries.filter(
      (entry) => getLocalDateKey(new Date(entry.createdAt)) === todayKey,
    );
  }

  if (period === "week") {
    const sevenDaysAgo = getClientDate(clientContext);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return entries.filter(
      (entry) => new Date(entry.createdAt).getTime() >= sevenDaysAgo.getTime(),
    );
  }

  if (period === "month") {
    if (requestedMonthIndex !== null) {
      const year = requestedYear ?? getClientDate(clientContext).getFullYear();

      return entries.filter((entry) => {
        const entryDate = new Date(entry.createdAt);

        return (
          entryDate.getMonth() === requestedMonthIndex &&
          entryDate.getFullYear() === year
        );
      });
    }

    const currentDate = getClientDate(clientContext);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);

      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    });
  }

  if (period === "year") {
    if (requestedYear) {
      return entries.filter(
        (entry) => new Date(entry.createdAt).getFullYear() === requestedYear,
      );
    }

    const currentYear = getClientDate(clientContext).getFullYear();

    return entries.filter(
      (entry) => new Date(entry.createdAt).getFullYear() === currentYear,
    );
  }

  return entries;
}

function detectSummaryPeriod(message: string): SummaryPeriod {
  const text = message.toLowerCase();
  const requestedMonthIndex = getRequestedMonthIndex(message);
  const requestedYear = getRequestedYear(message);

  if (text.includes("today")) {
    return "today";
  }

  if (text.includes("week")) {
    return "week";
  }

  if (text.includes("month")) {
    return "month";
  }

  if (requestedMonthIndex !== null) {
    return "month";
  }

  if (text.includes("year") || requestedYear) {
    return "year";
  }

  return "all_time";
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getRequestedMonthIndex(message: string) {
  const text = message.toLowerCase();
  const monthIndex = monthNames.findIndex((monthName) =>
    text.includes(monthName.toLowerCase()),
  );

  return monthIndex >= 0 ? monthIndex : null;
}

function getRequestedYear(message: string) {
  const yearText = message.match(/\b(20\d{2}|19\d{2})\b/)?.[0];

  if (!yearText) {
    return null;
  }

  const year = Number(yearText);

  return Number.isFinite(year) ? year : null;
}

function getSummaryPeriodLabel(
  period: SummaryPeriod,
  message?: string,
  now = new Date(),
) {
  const requestedMonthIndex = message ? getRequestedMonthIndex(message) : null;
  const requestedYear = message ? getRequestedYear(message) : null;

  if (period === "today") {
    return "today";
  }

  if (period === "week") {
    return "this week";
  }

  if (period === "month") {
    if (requestedMonthIndex !== null) {
      const year = requestedYear ?? now.getFullYear();

      return `${monthNames[requestedMonthIndex]} ${year}`;
    }

    return "this month";
  }

  if (period === "year") {
    if (requestedYear) {
      return String(requestedYear);
    }

    return "this year";
  }

  return "your journal history";
}

function rankEntriesByMessage(
  entries: JournalEntry[],
  message: string,
  options: { fallbackToAll?: boolean } = {},
) {
  const keywords = message.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  const fallbackToAll = options.fallbackToAll ?? true;

  if (keywords.length === 0) {
    return fallbackToAll ? entries : [];
  }

  const rankedEntries = entries
    .map((entry, index) => {
      const searchableText = getSearchableEntryText(entry);
      const score = keywords.reduce(
        (total, keyword) =>
          total + (searchableText.includes(keyword) ? 1 : 0),
        0,
      );

      return { entry, index, score };
    })
    .filter((match) => match.score > 0)
    .sort(
      (matchA, matchB) =>
        matchB.score - matchA.score || matchA.index - matchB.index,
    )
    .map((match) => match.entry);

  return rankedEntries.length > 0 || !fallbackToAll ? rankedEntries : entries;
}

function getClientDate(clientContext?: ClientContext) {
  const parsedDate = clientContext?.currentDateTimeISO
    ? new Date(clientContext.currentDateTimeISO)
    : new Date();

  return Number.isFinite(parsedDate.getTime()) ? parsedDate : new Date();
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
