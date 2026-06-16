export type ChatIntent =
  | "crisis"
  | "small_talk"
  | "date_time"
  | "app_capability"
  | "prompt_generation"
  | "follow_up"
  | "journal_summary"
  | "journal_analysis"
  | "journal_search"
  | "emotional_reflection"
  | "gratitude"
  | "stress"
  | "mood"
  | "recent_entries"
  | "unsupported"
  | "general"
;

export type ClientContext = {
  currentDateTimeISO: string;
  locale?: string;
  timezone?: string;
};

export type RecentChatMessage = {
  content: string;
  relatedEntryIds?: string[];
  role: "user" | "assistant";
};

const smallTalkMessages = new Set([
  "hi",
  "hello",
  "hey",
  "hii",
  "bhai",
  "bhai yaar",
  "bro",
  "yo",
  "sup",
  "namaste",
  "haan",
  "hmm",
  "ok",
  "okay",
]);

export function detectChatIntent(
  message: string,
  recentMessages: RecentChatMessage[] = [],
): ChatIntent {
  const text = message.trim().toLowerCase();
  const casualText = text.replace(/[^\p{L}\p{N}\s']/gu, "").replace(/\s+/g, " ");

  if (
    includesAny(text, [
      "suicide",
      "suicidal",
      "kill myself",
      "hurt myself",
      "want to die",
      "self harm",
      "self-harm",
      "end my life",
      "don't want to live",
      "do not want to live",
    ])
  ) {
    return "crisis";
  }

  const hasRecentAssistantMessage = recentMessages
    .slice(-4)
    .some((recentMessage) => recentMessage.role === "assistant");
  const shortFollowUps = new Set([
    "yes",
    "yeah",
    "explain",
    "more",
    "why",
    "how",
  ]);

  if (
    hasRecentAssistantMessage &&
    (shortFollowUps.has(casualText) ||
      includesAny(text, [
        "what are they",
        "which ones",
        "tell me more",
        "explain more",
        "what do you mean",
        "go on",
        "continue",
      ]) ||
      /\b(that|they|those|them)\b/.test(text))
  ) {
    return "follow_up";
  }

  if (
    /\b(date|today's date|todays date|what day|which day|time)\b/.test(text) ||
    text.includes("what is today's date") ||
    text.includes("what's today's date")
  ) {
    return "date_time";
  }

  if (
    includesAny(text, [
      "write a prompt",
      "give me a prompt",
      "journaling prompt",
      "journal prompt",
      "reflection prompt",
      "suggest a prompt",
      "prompt for me",
    ])
  ) {
    return "prompt_generation";
  }

  if (
    includesAny(text, [
      "write code",
      "python",
      "javascript",
      "solve this math",
      "stock price",
      "news",
      "essay",
      "assignment",
      "recipe",
      "travel plan",
      "quicksort",
    ])
  ) {
    return "unsupported";
  }

  if (
    includesAny(text, [
      "what can you do",
      "your features",
      "what are you built for",
      "what can you help",
      "limits",
    ])
  ) {
    return "app_capability";
  }

  if (
    includesAny(text, ["summarize", "summarise", "summary", "recap", "review"]) ||
    /\bsum up\b/.test(text)
  ) {
    return "journal_summary";
  }

  if (includesAny(text, ["grateful", "gratitude", "thankful"])) {
    return "gratitude";
  }

  if (
    includesAny(text, [
      "stress",
      "stressed",
      "challenge",
      "challenged",
      "hard",
      "difficult",
      "pressure",
      "worry",
      "worried",
    ])
  ) {
    return "stress";
  }

  if (
    includesAny(text, [
      "i feel",
      "i am feeling",
      "i'm feeling",
      "today was",
      "i had a",
    ])
  ) {
    return "emotional_reflection";
  }

  if (
    includesAny(text, [
      "mood",
      "emotion",
      "feeling",
      "happy",
      "sad",
      "calm",
      "anxious",
    ])
  ) {
    return "mood";
  }

  if (
    includesAny(text, [
      "recent",
      "lately",
      "last few",
      "what did i write",
      "been writing about",
    ])
  ) {
    return "recent_entries";
  }

  if (
    includesAny(text, [
      "pattern",
      "notice",
      "trend",
      "insight",
      "analyze",
      "analyse",
      "analysis",
      "summary",
      "summarize",
      "summarise",
      "my journal",
      "my entries",
    ])
  ) {
    return "journal_analysis";
  }

  if (
    includesAny(text, [
      "search my journal",
      "find entries",
      "find entry",
      "look up",
      "show me entries",
    ])
  ) {
    return "journal_search";
  }

  if (
    smallTalkMessages.has(casualText) ||
    (casualText.length <= 10 && casualText.split(" ").length <= 2)
  ) {
    return "small_talk";
  }

  return "general";
}

export function shouldUseJournalContext(intent: ChatIntent) {
  return (
    intent === "follow_up" ||
    intent === "journal_summary" ||
    intent === "journal_analysis" ||
    intent === "journal_search" ||
    intent === "emotional_reflection" ||
    intent === "gratitude" ||
    intent === "stress" ||
    intent === "mood" ||
    intent === "recent_entries"
  );
}

export function getSmallTalkResponse(message: string) {
  const text = message.trim().toLowerCase();

  if (text.includes("bhai") || text.includes("bro")) {
    return "Haan bhai, I'm here. Want to reflect on something or just talk for a bit?";
  }

  return "Hi, I'm here. Want to reflect on something or just talk for a bit?";
}

export function getCapabilityResponse() {
  return "I'm built to help with journaling, reflection, mood patterns, gratitude, stress themes, recent entries, and your DearDiary insights. I'm not meant for coding, news, medical advice, finance, or general homework tasks.";
}

export function getUnsupportedResponse() {
  return "I'm focused on DearDiary: journaling, reflection, moods, habits, and insights from your entries. I can't help much with that request here, but I can help you reflect on your day or understand patterns in your journal.";
}

export function getPromptGenerationResponse() {
  return 'Here’s one for today:\n\n“What is one feeling you carried today, and what was it trying to tell you?”';
}

export function getDateTimeResponse(params: {
  clientContext?: ClientContext;
  message: string;
}) {
  const date = getClientDate(params.clientContext);
  const locale = params.clientContext?.locale || "en-IN";
  const timezone = params.clientContext?.timezone;
  const text = params.message.toLowerCase();
  const wantsTime = /\btime\b/.test(text);
  const wantsDate =
    /\bdate\b/.test(text) ||
    text.includes("what day") ||
    text.includes("which day") ||
    text.includes("today");
  const dateFormatOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  };
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
  };

  if (timezone) {
    dateFormatOptions.timeZone = timezone;
    timeFormatOptions.timeZone = timezone;
  }

  const formattedDate = safeFormatDate(date, locale, dateFormatOptions);
  const formattedTime = safeFormatDate(date, locale, timeFormatOptions);

  if (wantsTime && wantsDate) {
    return `Today is ${formattedDate}, and it's around ${formattedTime}.`;
  }

  if (wantsTime) {
    return `It's around ${formattedTime}.`;
  }

  return `Today is ${formattedDate}.`;
}

function getClientDate(clientContext?: ClientContext) {
  const parsedDate = clientContext?.currentDateTimeISO
    ? new Date(clientContext.currentDateTimeISO)
    : new Date();

  return Number.isFinite(parsedDate.getTime()) ? parsedDate : new Date();
}

function safeFormatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch {
    const { timeZone: _timeZone, ...fallbackOptions } = options;

    return new Intl.DateTimeFormat("en-IN", fallbackOptions).format(date);
  }
}

function includesAny(value: string, terms: readonly string[]) {
  return terms.some((term) => value.includes(term));
}
