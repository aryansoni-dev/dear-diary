import { useAuth } from "@clerk/expo";
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

import { AIResponseRenderer } from "@/components/ai/ai-response-renderer";
import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { InsightsPeriodNavigator } from "@/components/insights/InsightsPeriodNavigator";
import { InsightsPeriodSelector } from "@/components/insights/InsightsPeriodSelector";
import { InsightsSummaryGrid } from "@/components/insights/InsightsSummaryGrid";
import { JournalingRhythmCard } from "@/components/insights/JournalingRhythmCard";
import { MoodDistributionCard } from "@/components/insights/MoodDistributionCard";
import { RecurringThemesCard } from "@/components/insights/RecurringThemesCard";
import { ScreenEmptyState } from "@/components/states/ScreenEmptyState";
import { ScreenErrorState } from "@/components/states/ScreenErrorState";
import { ScreenLoadingState } from "@/components/states/ScreenLoadingState";
import { TabScreenHeader } from "@/components/ui/tab-screen-header";
import {
  insightCardStyles,
  type InsightCard,
  type MoodJourneyPoint,
} from "@/data/insights";
import { useAIInsightReport } from "@/hooks/useAIInsightReport";
import type { UseAIInsightReportResult } from "@/hooks/useAIInsightReport";
import { useDelayedVisibility } from "@/hooks/useDelayedVisibility";
import { deriveInsights } from "@/lib/insights/deriveInsights";
import {
  getInsightDateRange,
  isFutureInsightPeriod,
  shiftInsightReferenceDate,
} from "@/lib/insights/insightPeriodUtils";
import {
  getCurrentReportPeriod,
  type ReportPeriod,
} from "@/lib/insights/reportPeriods";
import {
  retryJournalStoreHydration,
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import type { AIInsightReport } from "@/types/aiInsightReport";
import type { InsightsPeriod, ThemeFrequency } from "@/types/insights";
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

type ChartPoint = MoodJourneyPoint & {
  x: number;
  y: number;
};

export function InsightsScreen() {
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const hydrationError = useJournalHydrationStore(
    (state) => state.hydrationError,
  );
  const showHydrationState = useDelayedVisibility(!hasHydrated);
  const [selectedPeriod, setSelectedPeriod] = useState<InsightsPeriod>("week");
  const [selectedReferenceDate, setSelectedReferenceDate] = useState(
    () => new Date(),
  );
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
  const weeklyReportState = useAIInsightReport(weeklyPeriod, {
    enabled: hasHydrated,
  });
  const monthlyReportState = useAIInsightReport(monthlyPeriod, {
    enabled: hasHydrated,
  });
  const insights = useMemo(
    () =>
      getLocalInsights({
        entries,
        hasHydrated,
        period: selectedPeriod,
        referenceDate: selectedReferenceDate,
        userId: userId ?? null,
      }),
    [entries, hasHydrated, selectedPeriod, selectedReferenceDate, userId],
  );
  const derivedInsights = useMemo(
    () =>
      deriveInsights({
        entries,
        period: selectedPeriod,
        referenceDate: selectedReferenceDate,
        userId: userId ?? null,
      }),
    [entries, selectedPeriod, selectedReferenceDate, userId],
  );
  const nextReferenceDate = useMemo(
    () => shiftInsightReferenceDate(selectedPeriod, selectedReferenceDate, 1),
    [selectedPeriod, selectedReferenceDate],
  );
  const canGoNext = !isFutureInsightPeriod(selectedPeriod, nextReferenceDate);
  const showCurrentPeriodAction =
    derivedInsights.dateRange.start.getTime() !==
    getInsightDateRange(selectedPeriod, new Date()).start.getTime();
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
  const matchingPeriodReport = useMemo(
    () =>
      getMatchingReportForSelectedPeriod({
        monthlyReport: monthlyReportState.report,
        period: selectedPeriod,
        referenceDate: selectedReferenceDate,
        weeklyReport: weeklyReportState.report,
      }),
    [
      monthlyReportState.report,
      selectedPeriod,
      selectedReferenceDate,
      weeklyReportState.report,
    ],
  );
  const recurringThemes = useMemo(
    () => getRecurringThemes(derivedInsights.themes, matchingPeriodReport),
    [derivedInsights.themes, matchingPeriodReport],
  );
  const hasNoEntries = hasHydrated && entries.length === 0;
  const newJournalEntryHref = {
    pathname: "/journal/new",
    params: { source: "insights" },
  } as Href;

  function retryJournalHydration() {
    retryJournalStoreHydration();
  }

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

        {hydrationError ? (
          <View className="mt-7">
            <ScreenErrorState
              error={hydrationError}
              onRetry={retryJournalHydration}
            />
          </View>
        ) : !hasHydrated ? (
          showHydrationState ? (
            <View className="mt-7">
              <ScreenLoadingState
                message="Your local journal is being prepared."
                title="Preparing insights..."
              />
            </View>
          ) : null
        ) : hasNoEntries ? (
          <View className="mt-7">
            <ScreenEmptyState
              actionLabel="Write an entry"
              message="Write a few entries to begin seeing emotional patterns."
              onAction={() => router.push(newJournalEntryHref)}
              title="Your insights will grow with your journal"
            />
          </View>
        ) : (
          <>
            <View className="mt-7">
              <InsightsPeriodSelector
                onChange={setSelectedPeriod}
                value={selectedPeriod}
              />
              <InsightsPeriodNavigator
                canGoNext={canGoNext}
                label={derivedInsights.dateRange.label}
                onGoCurrent={() => setSelectedReferenceDate(new Date())}
                onGoNext={() => {
                  if (canGoNext) {
                    setSelectedReferenceDate(nextReferenceDate);
                  }
                }}
                onGoPrevious={() =>
                  setSelectedReferenceDate((currentDate) =>
                    shiftInsightReferenceDate(
                      selectedPeriod,
                      currentDate,
                      -1,
                    ),
                  )
                }
                showCurrentAction={showCurrentPeriodAction}
              />
              <InsightsSummaryGrid summary={derivedInsights.summary} />
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
                    Mood Journey
                  </Text>
                </View>
                <View className="rounded-full bg-[#F4EFFA] px-4 py-2">
                  <Text className="text-[12px] font-medium leading-5 text-[#52525B]">
                    {getMoodJourneyPillLabel(selectedPeriod)}
                  </Text>
                </View>
              </View>

              <MoodJourneyChart data={insights.moodJourney} />
            </View>

            <View className="mt-6 gap-4">
              <MoodDistributionCard
                entriesWithoutMood={derivedInsights.entriesWithoutMood}
                moodDistribution={derivedInsights.moodDistribution}
              />
              <JournalingRhythmCard patterns={derivedInsights.weekdayPatterns} />
              <RecurringThemesCard themes={recurringThemes} />
            </View>

            <View className="mt-7">
              <Text
                allowFontScaling={false}
                className="text-[20px] font-bold leading-7 text-[#18181B]"
              >
                DearDiary Insights
              </Text>
              <Text
                allowFontScaling={false}
                className="mt-1 text-[14px] leading-5 text-[#71717B]"
              >
                AI-generated reflections from your saved reports
              </Text>
              <View className="mt-4 gap-4">
                {aiInsightCards.map((card) => (
                  <InsightMessageCard card={card} key={card.title} />
                ))}
              </View>
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
          </>
        )}
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
};

function getLocalInsights({
  entries,
  hasHydrated,
  period,
  referenceDate,
  userId,
}: {
  entries: JournalEntry[];
  hasHydrated: boolean;
  period: InsightsPeriod;
  referenceDate: Date;
  userId: string | null;
}): LocalInsights {
  return {
    cards: insightCardStyles.map((card) => ({
      ...card,
      body: getAIInsightUnavailableBody(card.title, hasHydrated),
    })),
    moodJourney: getPeriodMoodJourney({
      entries,
      period,
      referenceDate,
      userId,
    }),
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
  const isLoading = !report && (monthlyReportIsLoading || weeklyReportIsLoading);

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
  return sentenceMatch?.[0].trim() ?? normalizedText;
}

function getRecurringThemes(
  localThemes: ThemeFrequency[],
  report: AIInsightReport | null,
) {
  if (localThemes.length > 0) {
    return localThemes;
  }

  const reportThemes = report?.analytics.recurringThemes ?? [];
  const totalCount = reportThemes.reduce((total, theme) => total + theme.count, 0);

  if (totalCount === 0) {
    return [];
  }

  return reportThemes.slice(0, 5).map((theme) => ({
    count: theme.count,
    label: theme.name,
    percentage: Math.round((theme.count / totalCount) * 100),
    source: "ai" as const,
  }));
}

function getMatchingReportForSelectedPeriod({
  monthlyReport,
  period,
  referenceDate,
  weeklyReport,
}: {
  monthlyReport: AIInsightReport | null;
  period: InsightsPeriod;
  referenceDate: Date;
  weeklyReport: AIInsightReport | null;
}) {
  if (period === "year") {
    return null;
  }

  const dateRange = getInsightDateRange(period, referenceDate);
  const periodType = period === "week" ? "weekly" : "monthly";
  const report = periodType === "weekly" ? weeklyReport : monthlyReport;

  if (!report || report.periodType !== periodType) {
    return null;
  }

  return isReportForDateRange(report, dateRange.start, dateRange.end)
    ? report
    : null;
}

function isReportForDateRange(
  report: AIInsightReport,
  start: Date,
  end: Date,
) {
  return (
    getLocalDateKey(new Date(report.periodStart)) === getLocalDateKey(start) &&
    getLocalDateKey(new Date(report.periodEnd)) === getLocalDateKey(end)
  );
}

function getPeriodMoodJourney({
  entries,
  period,
  referenceDate,
  userId,
}: {
  entries: JournalEntry[];
  period: InsightsPeriod;
  referenceDate: Date;
  userId: string | null;
}) {
  const dateRange = getInsightDateRange(period, referenceDate);
  const periodEntries = entries.filter(
    (entry) =>
      !entry.deletedAt &&
      (!userId || entry.userId === userId) &&
      isEntryInRange(entry, dateRange.start, dateRange.end),
  );

  if (period === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(dateRange.start, index);
      const mood = getTopMoodForRange(
        periodEntries,
        startOfLocalDay(date),
        endOfLocalDay(date),
      );

      return toMoodJourneyPoint(
        mood,
        new Intl.DateTimeFormat(getRuntimeLocale(), {
          weekday: "short",
        }).format(date),
      );
    });
  }

  if (period === "month") {
    const points: MoodJourneyPoint[] = [];
    let cursor = startOfLocalDay(dateRange.start);

    while (cursor.getTime() <= dateRange.end.getTime()) {
      const bucketStart = new Date(cursor);
      const bucketEnd = endOfLocalDay(addDays(bucketStart, 6));
      const mood = getTopMoodForRange(
        periodEntries,
        bucketStart,
        bucketEnd.getTime() > dateRange.end.getTime()
          ? dateRange.end
          : bucketEnd,
      );

      points.push(
        toMoodJourneyPoint(
          mood,
          new Intl.DateTimeFormat(getRuntimeLocale(), {
            day: "numeric",
          }).format(bucketStart),
        ),
      );
      cursor = addDays(bucketStart, 7);
    }

    return points;
  }

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const bucketStart = new Date(referenceDate.getFullYear(), monthIndex, 1);
    const bucketEnd = endOfLocalDay(
      new Date(referenceDate.getFullYear(), monthIndex + 1, 0),
    );
    const mood = getTopMoodForRange(periodEntries, bucketStart, bucketEnd);

    return toMoodJourneyPoint(
      mood,
      new Intl.DateTimeFormat(getRuntimeLocale(), {
        month: "short",
      }).format(bucketStart),
    );
  });
}

function getMoodJourneyPillLabel(period: InsightsPeriod) {
  if (period === "week") {
    return "This Week";
  }

  if (period === "month") {
    return "This Month";
  }

  return "This Year";
}

function getTopMoodForRange(entries: JournalEntry[], start: Date, end: Date) {
  return getTopMood(
    entries.filter(
      (entry) => entry.mood && isEntryInRange(entry, start, end),
    ),
  );
}

function toMoodJourneyPoint(
  mood: MoodId | null,
  day: string,
): MoodJourneyPoint {
  return {
    day,
    emoji: mood ? moodEmoji[mood] : fallbackMoodEmoji,
    mood: mood ? moodScores[mood] : fallbackMoodScore,
  };
}

function isEntryInRange(entry: JournalEntry, start: Date, end: Date) {
  const createdAt = Date.parse(entry.createdAt);

  return (
    Number.isFinite(createdAt) &&
    createdAt >= start.getTime() &&
    createdAt <= end.getTime()
  );
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

function endOfLocalDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);

  nextDate.setDate(date.getDate() + days);
  return nextDate;
}

function getRuntimeLocale() {
  return Intl.DateTimeFormat().resolvedOptions().locale;
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
      <View className="mt-7 min-w-0">
        <AIResponseRenderer
          content={card.body}
          diagnosticLabel={`insight_card_${card.title.toLowerCase().replace(/\s+/g, "_")}`}
          variant="insight"
        />
      </View>
    </View>
  );
}
