import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import { useMemo } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Path,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import {
  insightCardStyles,
  insightStatStyles,
  type InsightCard,
  type InsightStat,
  type MoodJourneyPoint,
} from "@/data/insights";
import { useJournalStore } from "@/store/journal-store";
import type { JournalEntry, MoodId } from "@/types/journal";

const primaryColor = "#FF2056";

const chartHeight = 198;
const chartTopPadding = 18;
const chartBottomPadding = 52;
const moodMax = 5;
const moodMin = 1;

const fallbackMoodScore = 3;
const fallbackMoodEmoji = "😐";

const moodScores: Record<MoodId, number> = {
  anxious: 2,
  calm: 3,
  grateful: 4,
  happy: 5,
  motivated: 5,
  sad: 1,
};

const moodEmoji: Record<MoodId, string> = {
  anxious: "😰",
  calm: "😌",
  grateful: "🙏",
  happy: "😊",
  motivated: "🔥",
  sad: "😔",
};

const moodLabels: Record<MoodId, string> = {
  anxious: "Anxious",
  calm: "Calm",
  grateful: "Grateful",
  happy: "Happy",
  motivated: "Motivated",
  sad: "Sad",
};

const stopWords = [
  "the",
  "and",
  "for",
  "you",
  "your",
  "with",
  "that",
  "this",
  "was",
  "are",
  "but",
  "have",
  "had",
  "today",
  "feel",
  "felt",
  "from",
  "just",
  "about",
  "what",
  "when",
  "where",
  "into",
] as const;

const stopWordSet = new Set<string>(stopWords);

type ChartPoint = MoodJourneyPoint & {
  x: number;
  y: number;
};

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const insights = useMemo(
    () => getLocalInsights(entries, hasHydrated),
    [entries, hasHydrated],
  );

  return (
    <View className="flex-1 bg-[#FAF7F2]">
      <StatusBar hidden />
      <ExpoLinearGradient
        colors={["#F4EFFA", "#FAF7F2", "#FAF7F2"]}
        locations={[0, 0.38, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 28,
          paddingHorizontal: 24,
          paddingTop: Math.max(60, insets.top + 22),
        }}
      >
        <View>
          <View className="flex-row items-center gap-2">
            <Text
              allowFontScaling={false}
              className="text-[31px] font-bold leading-9 tracking-normal text-[#18181B]"
            >
              Your Insights
            </Text>
            <Text allowFontScaling={false} className="text-[31px] leading-9">
              ✨
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            className="mt-1 text-[15px] leading-5 text-[#71717B]"
          >
            Powered by your journal entries
          </Text>
        </View>

        <View
          className="mt-7 rounded-[30px] bg-white/80 px-6 py-6"
          style={{ boxShadow: "0 12px 40px rgba(160, 140, 200, 0.2)" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center gap-3">
              <Text className="text-[25px] leading-8">📈</Text>
              <Text
                className="flex-1 text-[18px] font-bold leading-5 text-[#27272A]"
                numberOfLines={1}
              >
                Weekly Mood Journey
              </Text>
            </View>
            <View className="rounded-full bg-[#F4EFFA] px-4 py-2">
              <Text className="text-[12px] font-medium leading-5 text-[#52525B]">
                This Week
              </Text>
            </View>
          </View>

          <MoodJourneyChart data={insights.moodJourney} />
        </View>

        <View className="mt-6 flex-row gap-4">
          {insights.stats.map((stat) => (
            <View
              className="h-[132px] flex-1 items-center justify-center rounded-[28px] px-2"
              key={stat.label}
              style={{
                backgroundColor: stat.backgroundColor,
                boxShadow: `0 8px 24px ${stat.shadowColor}`,
              }}
            >
              <Text className="text-[28px] leading-5">{stat.emoji}</Text>
              <Text className="mt-4 text-center text-[18px] font-bold leading-5 text-[#18181B]">
                {stat.value}
              </Text>
              <Text className="mt-2 text-center text-[12px] font-medium leading-5 text-[#71717B]">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-7 gap-4">
          {insights.cards.map((card) => (
            <InsightMessageCard card={card} key={card.title} />
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Insights" />
    </View>
  );
}

type LocalInsights = {
  cards: InsightCard[];
  moodJourney: MoodJourneyPoint[];
  stats: InsightStat[];
};

function getLocalInsights(
  entries: JournalEntry[],
  hasHydrated: boolean,
): LocalInsights {
  const topMood = getTopMood(entries);
  const streak = hasHydrated ? getReflectionStreak(entries) : 0;
  const statValues = {
    "Current Streak": hasHydrated
      ? `${streak} ${streak === 1 ? "Day" : "Days"}`
      : "…",
    Entries: hasHydrated ? String(entries.length) : "…",
    "Top Emotion": hasHydrated
      ? topMood
        ? moodLabels[topMood]
        : "No data"
      : "Loading...",
  };

  return {
    cards: insightCardStyles.map((card) => ({
      ...card,
      body: getInsightCardBody(card.title, entries, hasHydrated, topMood),
    })),
    moodJourney: getWeeklyMoodJourney(entries),
    stats: insightStatStyles.map((stat) => ({
      ...stat,
      value: statValues[stat.label as keyof typeof statValues],
    })),
  };
}

function getInsightCardBody(
  title: InsightCard["title"],
  entries: JournalEntry[],
  hasHydrated: boolean,
  topMood: MoodId | null,
) {
  if (!hasHydrated) {
    return "Loading your local insights...";
  }

  if (title === "DearDiary AI Says") {
    return getLocalAiInsight(entries, topMood);
  }

  if (title === "Pattern Found") {
    return getPatternInsight(entries);
  }

  return getRecurringTopicInsight(entries);
}

function getWeeklyMoodJourney(entries: JournalEntry[]) {
  const today = startOfLocalDay(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const entry = getLatestMoodEntryForDate(entries, date);
    const mood = entry?.mood ?? null;

    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      emoji: mood ? moodEmoji[mood] : fallbackMoodEmoji,
      mood: mood ? moodScores[mood] : fallbackMoodScore,
    };
  });
}

function getLatestMoodEntryForDate(entries: JournalEntry[], date: Date) {
  return entries
    .filter((entry) => entry.mood && isSameDay(new Date(entry.createdAt), date))
    .sort(
      (entryA, entryB) =>
        new Date(entryB.createdAt).getTime() -
        new Date(entryA.createdAt).getTime(),
    )[0];
}

function getTopMood(entries: JournalEntry[]) {
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

function getLocalAiInsight(entries: JournalEntry[], topMood: MoodId | null) {
  if (entries.length === 0) {
    return "Write a few reflections to unlock deeper insights.";
  }

  if (hasGratitudeEntry(entries)) {
    return "Gratitude has appeared in your reflections recently.";
  }

  if (topMood) {
    return `You've been noticing ${moodLabels[topMood].toLowerCase()} often in your recent reflections.`;
  }

  return "Write a few more reflections to unlock deeper insights.";
}

function hasGratitudeEntry(entries: JournalEntry[]) {
  return entries.some((entry) => {
    const searchableText = `${entry.title} ${entry.content} ${entry.prompt ?? ""}`;

    return (
      entry.type === "gratitude" ||
      /\b(gratitude|grateful|thankful)\b/i.test(searchableText)
    );
  });
}

function getPatternInsight(entries: JournalEntry[]) {
  if (entries.length < 3) {
    return "Patterns will appear as you write more reflections.";
  }

  const calmEntries = entries.filter((entry) => entry.mood === "calm").length;
  const moodEntries = entries.filter((entry) => entry.mood).length;
  const entriesBeforeTen = entries.filter(
    (entry) => new Date(entry.createdAt).getHours() < 22,
  ).length;

  if (moodEntries > 0 && calmEntries >= Math.ceil(moodEntries / 2)) {
    return "Calm appears often in your reflections.";
  }

  if (entriesBeforeTen > entries.length / 2) {
    return "You seem more consistent when you write before 10 PM.";
  }

  return "You are building a steady reflection habit.";
}

function getRecurringTopicInsight(entries: JournalEntry[]) {
  const recurringTopic = getRecurringTopic(entries);

  if (!recurringTopic) {
    return "Recurring topics will appear as you write more.";
  }

  return `${recurringTopic} appeared often in your entries.`;
}

function getRecurringTopic(entries: JournalEntry[]) {
  const wordCounts = entries.reduce<Record<string, number>>((counts, entry) => {
    const words = entry.content.toLowerCase().match(/[a-z']+/g) ?? [];

    words.forEach((word) => {
      if (word.length < 4 || stopWordSet.has(word)) {
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

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function MoodJourneyChart({ data }: { data: MoodJourneyPoint[] }) {
  const { width } = useWindowDimensions();
  const chartWidth = Math.max(250, width - 96);
  const chartInset = 10;
  const usableChartWidth = chartWidth - chartInset * 2;
  const plotHeight = chartHeight - chartTopPadding - chartBottomPadding;
  const points: ChartPoint[] = data.map((item, index) => {
    const x =
      chartInset + (usableChartWidth / Math.max(1, data.length - 1)) * index;
    const moodRatio = (item.mood - moodMin) / (moodMax - moodMin);
    const y = chartTopPadding + (1 - moodRatio) * plotHeight;

    return { ...item, x, y };
  });
  const fillBottom = chartHeight - chartBottomPadding + 2;
  const linePath = getSmoothLinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${fillBottom} L ${points[0].x} ${fillBottom} Z`;

  return (
    <View className="mt-7 items-center">
      <View style={{ height: chartHeight, width: chartWidth }}>
        {[0, 1, 2, 3, 4].map((line) => (
          <View
            className="absolute left-0 right-0 border-t border-dashed border-[#E4E4E7]"
            key={line}
            style={{ top: chartTopPadding + (plotHeight / 4) * line }}
          />
        ))}

        <Svg
          height={chartHeight}
          pointerEvents="none"
          style={{ left: 0, position: "absolute", top: 0 }}
          width={chartWidth}
        >
          <Defs>
            <SvgLinearGradient id="moodFill" x1="0" x2="0" y1="0" y2="1">
              <Stop offset="0" stopColor={primaryColor} stopOpacity="0.2" />
              <Stop offset="1" stopColor={primaryColor} stopOpacity="0.02" />
            </SvgLinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#moodFill)" />
          <Path
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={4}
          />
          {points.map((point) => (
            <Circle
              cx={point.x}
              cy={point.y}
              fill="#FF2D61"
              key={point.day}
              r={4.5}
            />
          ))}
        </Svg>

        {points.map((point) => (
          <Text
            allowFontScaling={false}
            className="absolute w-11 text-center text-[13px] leading-5 text-[#71717B]"
            key={`${point.day}-label`}
            style={{
              left: point.x - 22,
              top: chartHeight - 44,
            }}
          >
            {point.day}
          </Text>
        ))}

        {points.map((point) => (
          <Text
            allowFontScaling={false}
            className="absolute w-11 text-center text-[17px] leading-6"
            key={`${point.day}-emoji`}
            style={{
              left: point.x - 22,
              top: chartHeight - 17,
            }}
          >
            {point.emoji}
          </Text>
        ))}
      </View>
    </View>
  );
}

function getSmoothLinePath(points: ChartPoint[]) {
  if (points.length < 2) {
    return "";
  }

  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[Math.min(points.length - 1, index + 2)];
    const controlPointOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlPointTwo = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };

    commands.push(
      `C ${controlPointOne.x} ${controlPointOne.y}, ${controlPointTwo.x} ${controlPointTwo.y}, ${next.x} ${next.y}`,
    );
  }

  return commands.join(" ");
}

function InsightMessageCard({ card }: { card: InsightCard }) {
  const isAiCard = card.variant === "ai";

  return (
    <View
      className="rounded-[28px] px-7 py-6"
      style={{
        backgroundColor: card.backgroundColor,
        boxShadow: `0 10px 30px ${card.shadowColor}`,
      }}
    >
      <View className="flex-row items-center gap-4">
        {isAiCard ? (
          <View className="size-9 items-center justify-center rounded-full bg-white/70">
            <Sparkles size={19} color={primaryColor} strokeWidth={2.2} />
          </View>
        ) : (
          <Text className="w-9 text-[21px] leading-5">{card.emoji}</Text>
        )}
        <Text className="flex-1 text-[17px] font-bold leading-5 text-[#18181B]">
          {card.title}
        </Text>
      </View>
      <Text className="mt-7 text-[17px] leading-6 text-[#52525B]">
        {card.body}
      </Text>
    </View>
  );
}
