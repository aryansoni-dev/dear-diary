import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { Link, useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { BarChart3, CalendarDays, Sparkles } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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
import { ScreenEmptyState } from "@/components/states/ScreenEmptyState";
import { TabScreenHeader } from "@/components/ui/tab-screen-header";
import {
  insightCardStyles,
  insightStatStyles,
  type InsightCard,
  type InsightStat,
  type MoodJourneyPoint,
} from "@/data/insights";
import { useAIInsightReport } from "@/hooks/useAIInsightReport";
import type { UseAIInsightReportResult } from "@/hooks/useAIInsightReport";
import {
  getCurrentReportPeriod,
  type ReportPeriod,
} from "@/lib/insights/reportPeriods";
import { useJournalStore } from "@/store/journal-store";
import type { AIInsightReport } from "@/types/aiInsightReport";
import type { JournalEntry, MoodId } from "@/types/journal";

const primaryColor = "#FF2056";

const chartHeight = 198;
const chartTopPadding = 18;
const chartBottomPadding = 52;
const moodMax = 5;
const moodMin = 1;

const fallbackMoodScore = 3;
const fallbackMoodEmoji = "😐";
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const reflectionReportCardStyles = {
  cardClassName: "rounded-[28px] bg-white/85 px-5 py-5",
  iconClassName:
    "size-11 items-center justify-center rounded-full bg-[#FFDDE8]",
  shadow: "0 10px 30px rgba(160, 140, 200, 0.16)",
  statusPillClassName: "rounded-full bg-[#F4EFFA] px-3 py-1",
} as const;

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

type ChartPoint = MoodJourneyPoint & {
  x: number;
  y: number;
};

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const todayKey = useTodayKey();
  const reportDate = useMemo(() => getLocalDateFromKey(todayKey), [todayKey]);
  const weeklyPeriod = useMemo(
    () => getCurrentReportPeriod("weekly", reportDate),
    [reportDate],
  );
  const monthlyPeriod = useMemo(
    () => getCurrentReportPeriod("monthly", reportDate),
    [reportDate],
  );
  const weeklyReportState = useAIInsightReport(weeklyPeriod);
  const monthlyReportState = useAIInsightReport(monthlyPeriod);
  const insights = useMemo(
    () => getLocalInsights(entries, hasHydrated),
    [entries, hasHydrated],
  );
  const aiInsightCards = useMemo(
    () =>
      getAIInsightCards({
        hasHydrated,
        localCards: insights.cards,
        monthlyReport: monthlyReportState.report,
        monthlyReportIsLoading:
          monthlyReportState.isLoading || monthlyReportState.isGenerating,
        weeklyReport: weeklyReportState.report,
        weeklyReportIsLoading:
          weeklyReportState.isLoading || weeklyReportState.isGenerating,
      }),
    [
      hasHydrated,
      insights.cards,
      monthlyReportState.isGenerating,
      monthlyReportState.isLoading,
      monthlyReportState.report,
      weeklyReportState.isGenerating,
      weeklyReportState.isLoading,
      weeklyReportState.report,
    ],
  );
  const hasNoEntries = hasHydrated && entries.length === 0;
  const newJournalEntryHref = {
    pathname: "/journal/new",
    params: { source: "insights" },
  } as Href;

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
          paddingBottom: bottomNavHeight + 56,
          paddingHorizontal: 24,
          paddingTop: Math.max(92, insets.top + 44),
        }}
      >
        <TabScreenHeader
          subtitle="Powered by your journal entries"
          title="Your Insights ✨"
        />

        {hasNoEntries ? (
          <View className="mt-7">
            <ScreenEmptyState
              actionLabel="Write an entry"
              message="Write a few entries to begin seeing emotional patterns."
              onAction={() => router.push(newJournalEntryHref)}
              title="Your insights will grow with your journal"
            />
          </View>
        ) : null}

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
          {aiInsightCards.map((card) => (
            <InsightMessageCard card={card} key={card.title} />
          ))}
        </View>

        <View className="mt-7">
          <Text
            allowFontScaling={false}
            className="text-[20px] font-bold leading-7 text-[#18181B]"
          >
            Reflection Reports
          </Text>
          <View className="mt-4 gap-4">
            <ReflectionReportCard
              period={weeklyPeriod}
              reportState={weeklyReportState}
            />
            <ReflectionReportCard
              period={monthlyPeriod}
              reportState={monthlyReportState}
            />
          </View>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Insights" />
    </View>
  );
}

function ReflectionReportCard({
  period,
  reportState,
}: {
  period: ReportPeriod;
  reportState: UseAIInsightReportResult;
}) {
  const periodType = period.type;
  const minimumEntries = periodType === "weekly" ? 2 : 3;
  const hasEnoughEntries = reportState.availableEntryCount >= minimumEntries;
  const title =
    periodType === "weekly" ? "Weekly Reflection" : "Monthly Reflection";
  const description =
    periodType === "weekly"
      ? "A visual review of your moods, activity and patterns this week."
      : "Understand your emotional journey and progress this month.";
  const status = getReportCardStatus({
    hasEnoughEntries,
    isGenerating: reportState.isGenerating,
    isStale: reportState.isStale,
    legacyReportAvailable: reportState.legacyReportAvailable,
    reportExists: Boolean(reportState.report),
  });
  const buttonLabel = reportState.report ? "View" : "Open";
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  function handleButtonPressIn() {
    buttonScale.set(
      withSpring(0.96, {
        damping: 18,
        mass: 0.7,
        stiffness: 240,
      }),
    );
  }

  function handleButtonPressOut() {
    buttonScale.set(
      withSpring(1, {
        damping: 20,
        mass: 0.8,
        stiffness: 170,
      }),
    );
  }

  return (
    <View
      className={reflectionReportCardStyles.cardClassName}
      style={{ boxShadow: reflectionReportCardStyles.shadow }}
    >
      <View className="flex-row gap-4">
        <View className={reflectionReportCardStyles.iconClassName}>
          {periodType === "weekly" ? (
            <CalendarDays color={primaryColor} size={21} strokeWidth={2.3} />
          ) : (
            <BarChart3 color={primaryColor} size={21} strokeWidth={2.3} />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <Text
              allowFontScaling={false}
              className="flex-1 text-[17px] font-bold leading-6 text-[#18181B]"
            >
              {title}
            </Text>
            <View className={reflectionReportCardStyles.statusPillClassName}>
              <Text
                allowFontScaling={false}
                className="text-[11px] font-semibold leading-4 text-[#52525B]"
              >
                {status}
              </Text>
            </View>
          </View>
          <Text
            allowFontScaling={false}
            className="mt-2 text-[14px] leading-6 text-[#71717B]"
          >
            {description}
          </Text>
          <Text
            allowFontScaling={false}
            className="mt-3 text-[13px] font-semibold leading-5 text-[#52525B]"
          >
            {period.label} · {reportState.availableEntryCount}{" "}
            {reportState.availableEntryCount === 1 ? "entry" : "entries"} available
          </Text>
        </View>
      </View>
      <Link
        asChild
        href={{
          pathname: "/insights/report/[periodType]",
          params: { periodType },
        }}
      >
        <Pressable
          accessibilityRole="button"
          className="mt-5 h-12"
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Animated.View
            style={[
              {
                alignItems: "center",
                backgroundColor: primaryColor,
                borderRadius: 999,
                height: "100%",
                justifyContent: "center",
              },
              animatedButtonStyle,
            ]}
          >
            <Text
              allowFontScaling={false}
              className="text-[15px] font-bold leading-5 text-white"
            >
              {buttonLabel}
            </Text>
          </Animated.View>
        </Pressable>
      </Link>
    </View>
  );
}

function getReportCardStatus({
  hasEnoughEntries,
  isGenerating,
  isStale,
  legacyReportAvailable,
  reportExists,
}: {
  hasEnoughEntries: boolean;
  isGenerating: boolean;
  isStale: boolean;
  legacyReportAvailable: boolean;
  reportExists: boolean;
}) {
  if (isGenerating) {
    return "Generating";
  }

  if (legacyReportAvailable) {
    return "Older report format";
  }

  if (!hasEnoughEntries) {
    return "Not enough entries";
  }

  if (isStale) {
    return "Outdated";
  }

  return reportExists ? "Ready" : "Not generated";
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
      body: getAIInsightUnavailableBody(card.title, hasHydrated),
    })),
    moodJourney: getWeeklyMoodJourney(entries),
    stats: insightStatStyles.map((stat) => ({
      ...stat,
      value: statValues[stat.label as keyof typeof statValues],
    })),
  };
}

function useTodayKey() {
  const [todayKey, setTodayKey] = useState(() => getLocalDateKey(new Date()));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNextDayUpdate() {
      const now = new Date();
      const nextDay = startOfLocalDay(now);

      nextDay.setDate(nextDay.getDate() + 1);
      timeoutId = setTimeout(() => {
        setTodayKey(getLocalDateKey(new Date()));
        scheduleNextDayUpdate();
      }, Math.max(1000, nextDay.getTime() - now.getTime() + 1000));
    }

    scheduleNextDayUpdate();

    return () => clearTimeout(timeoutId);
  }, []);

  return todayKey;
}

function getAIInsightCards({
  hasHydrated,
  localCards,
  monthlyReport,
  monthlyReportIsLoading,
  weeklyReport,
  weeklyReportIsLoading,
}: {
  hasHydrated: boolean;
  localCards: InsightCard[];
  monthlyReport: AIInsightReport | null;
  monthlyReportIsLoading: boolean;
  weeklyReport: AIInsightReport | null;
  weeklyReportIsLoading: boolean;
}) {
  const report = monthlyReport ?? weeklyReport;
  const isLoading =
    (monthlyReportIsLoading && !monthlyReport) ||
    (weeklyReportIsLoading && !weeklyReport);

  return localCards.map((card) => ({
    ...card,
    body: getAIInsightCardBody({
      cardTitle: card.title,
      hasHydrated,
      isLoading,
      report,
    }),
  }));
}

function getAIInsightCardBody({
  cardTitle,
  hasHydrated,
  isLoading,
  report,
}: {
  cardTitle: InsightCard["title"];
  hasHydrated: boolean;
  isLoading: boolean;
  report: AIInsightReport | null;
}) {
  if (!hasHydrated || isLoading) {
    return "Loading AI insights from your latest reflection report...";
  }

  if (!report) {
    return getAIInsightUnavailableBody(cardTitle, hasHydrated);
  }

  if (cardTitle === "DearDiary AI Says") {
    return getCompactInsightText(report.narrative.overview);
  }

  if (cardTitle === "Pattern Found") {
    return (
      report.narrative.patterns[0] ??
      report.narrative.improvements[0] ??
      report.narrative.nextFocus
    );
  }

  const recurringTheme = report.analytics.recurringThemes[0];

  if (recurringTheme) {
    return `${recurringTheme.name} appears as a recurring topic across ${recurringTheme.count} ${recurringTheme.count === 1 ? "entry" : "entries"}.`;
  }

  return (
    report.narrative.activities[0] ??
    "Recurring topics will appear here after DearDiary has enough AI report evidence."
  );
}

function getAIInsightUnavailableBody(
  cardTitle: InsightCard["title"],
  hasHydrated: boolean,
) {
  if (!hasHydrated) {
    return "Loading AI insights from your journal...";
  }

  if (cardTitle === "DearDiary AI Says") {
    return "Generate a weekly or monthly reflection report to unlock AI insights here.";
  }

  if (cardTitle === "Pattern Found") {
    return "AI-detected patterns will appear after a reflection report is generated.";
  }

  return "AI recurring topics will appear after a reflection report is generated.";
}

function getCompactInsightText(value: string) {
  const normalizedText = value.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    return "DearDiary will summarize your reflection report here after it is generated.";
  }

  const sentenceMatch = normalizedText.match(/^.*?[.!?](?:\s|$)/);
  const firstSentence = sentenceMatch?.[0].trim() ?? normalizedText;

  return firstSentence.length > 180
    ? `${firstSentence.slice(0, 177).trim()}...`
    : firstSentence;
}

function getWeeklyMoodJourney(entries: JournalEntry[]) {
  const today = startOfLocalDay(new Date());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const mood = getMostFrequentMoodForDate(entries, date);

    return {
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      emoji: mood ? moodEmoji[mood] : fallbackMoodEmoji,
      mood: mood ? moodScores[mood] : fallbackMoodScore,
    };
  });
}

function getMostFrequentMoodForDate(entries: JournalEntry[], date: Date) {
  const entriesForDate = entries.filter(
    (entry) => entry.mood && isSameDay(new Date(entry.createdAt), date),
  );

  return getTopMood(entriesForDate);
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

function getLocalDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
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
  const drawProgress = useSharedValue(0);
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
  const lineLength = getLineDrawLength(points);
  const lineAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: lineLength * (1 - drawProgress.value),
  }));
  const detailAnimatedProps = useAnimatedProps(() => ({
    opacity: drawProgress.value,
  }));

  useEffect(() => {
    drawProgress.value = 0;
    drawProgress.value = withDelay(
      120,
      withTiming(1, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [drawProgress, lineLength, linePath]);

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
          <AnimatedPath
            animatedProps={detailAnimatedProps}
            d={areaPath}
            fill="url(#moodFill)"
          />
          <AnimatedPath
            animatedProps={lineAnimatedProps}
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeDasharray={lineLength}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={4}
          />
          {points.map((point) => (
            <AnimatedCircle
              animatedProps={detailAnimatedProps}
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

function getLineDrawLength(points: ChartPoint[]) {
  if (points.length < 2) {
    return 1;
  }

  const straightLineLength = points.reduce((total, point, index) => {
    if (index === 0) {
      return total;
    }

    const previousPoint = points[index - 1];
    return (
      total + Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y)
    );
  }, 0);

  return Math.max(1, straightLineLength * 1.4);
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
