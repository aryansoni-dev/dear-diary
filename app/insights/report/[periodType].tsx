import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, RefreshCw, Sparkles } from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { BottomTabBar, bottomTabBarBaseHeight } from "@/components/navigation/bottom-tab-bar";
import { EntryTypeDistributionChart } from "@/components/insights/report/EntryTypeDistributionChart";
import {
  EmotionalFlowCard,
  NextFocusCard,
  PatternCards,
  ReflectionPromptCard,
  SimpleListBlock,
} from "@/components/insights/report/ReportNarrativeBlocks";
import { JournalActivityChart } from "@/components/insights/report/JournalActivityChart";
import { MoodDistributionChart } from "@/components/insights/report/MoodDistributionChart";
import { MoodJourneyChart } from "@/components/insights/report/MoodJourneyChart";
import { RecurringThemesChart } from "@/components/insights/report/RecurringThemesChart";
import { ReportHeader } from "@/components/insights/report/ReportHeader";
import { ReportSection } from "@/components/insights/report/ReportSection";
import { ReportStatGrid } from "@/components/insights/report/ReportStatGrid";
import {
  getGenerateLabel,
  getReportTitle,
} from "@/components/insights/report/report-formatters";
import { reportColors } from "@/constants/report-theme";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useAIInsightReport } from "@/hooks/useAIInsightReport";
import {
  getCurrentReportPeriod,
  isAIInsightPeriodType,
} from "@/lib/insights/reportPeriods";

export default function AIInsightReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showDialog } = useAppDialog();
  const params = useLocalSearchParams<{ periodType?: string }>();
  const periodTypeParam = Array.isArray(params.periodType)
    ? params.periodType[0]
    : params.periodType;
  const isValidPeriodType = isAIInsightPeriodType(periodTypeParam);
  const period = useMemo(
    () =>
      getCurrentReportPeriod(isValidPeriodType ? periodTypeParam : "weekly"),
    [isValidPeriodType, periodTypeParam],
  );
  const reportState = useAIInsightReport(period);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const minimumEntries = period.type === "weekly" ? 2 : 3;
  const hasEnoughEntries = reportState.availableEntryCount >= minimumEntries;

  function handleGenerate() {
    void reportState.generate();
  }

  function handleRegenerate() {
    showDialog({
      cancelText: "Keep Current",
      confirmText: "Update Reflection",
      icon: "✦",
      message:
        "DearDiary will analyze the latest journal entries for this period and replace this visual reflection.",
      onConfirm: () => {
        void reportState.regenerate();
      },
      showCancel: true,
      title: "Update reflection?",
    });
  }

  if (!isValidPeriodType) {
    return (
      <ReportShell bottomNavHeight={bottomNavHeight} insetsTop={insets.top}>
        <View className="flex-1 items-center justify-center px-6">
          <Text
            allowFontScaling={false}
            className="text-center text-[24px] font-bold leading-8 text-[#18181B]"
          >
            Reflection not found
          </Text>
          <Text
            allowFontScaling={false}
            className="mt-3 text-center text-[16px] leading-6 text-[#71717B]"
          >
            This report type is not available yet.
          </Text>
          <PrimaryButton label="Back to Insights" onPress={() => router.back()} />
        </View>
      </ReportShell>
    );
  }

  return (
    <ReportShell bottomNavHeight={bottomNavHeight} insetsTop={insets.top}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 18,
          paddingBottom: bottomNavHeight + 180,
          paddingHorizontal: 24,
          paddingTop: Math.max(58, insets.top + 18),
        }}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            accessibilityLabel="Back to Insights"
            onPress={() => router.back()}
          >
            <ChevronLeft color={reportColors.heading} size={24} strokeWidth={2.8} />
          </AnimatedIconButton>
          <Text
            allowFontScaling={false}
            className="text-[13px] font-semibold uppercase leading-5 tracking-[2.4px] text-[#71717B]"
          >
            Reflection Report
          </Text>
          <AnimatedIconButton
            accessibilityLabel="Refresh report"
            disabled={reportState.isLoading || reportState.isGenerating}
            isBusy={reportState.isLoading}
            onPress={() => {
              void reportState.refresh();
            }}
            spinOnPress
          >
            <RefreshCw color={reportColors.primary} size={20} strokeWidth={2.4} />
          </AnimatedIconButton>
        </View>

        {reportState.error ? <ErrorBanner message={reportState.error} /> : null}

        {reportState.isGenerating && reportState.report ? (
          <UpdatingBanner periodType={period.type} />
        ) : null}

        {reportState.isLoading && !reportState.report ? (
          <LoadingState periodType={period.type} />
        ) : reportState.report ? (
          <>
            <ReportHeader
              isStale={reportState.isStale}
              label={period.label}
              report={reportState.report}
            />
            {reportState.isStale ? (
              <StaleBanner
                disabled={reportState.isGenerating || !hasEnoughEntries}
                onPress={handleRegenerate}
              />
            ) : null}
            <ReportSection title="AI Overview">
              <Text
                allowFontScaling={false}
                className="text-[16px] leading-7 text-[#52525B]"
                maxFontSizeMultiplier={1}
              >
                {reportState.report.narrative.overview}
              </Text>
              {reportState.report.narrative.dataQualityNote ? (
                <Text
                  allowFontScaling={false}
                  className="mt-4 text-[14px] leading-6 text-[#71717B]"
                  maxFontSizeMultiplier={1}
                >
                  {reportState.report.narrative.dataQualityNote}
                </Text>
              ) : null}
            </ReportSection>
            <ReportStatGrid analytics={reportState.report.analytics} />
            <ReportSection title="Mood Journey">
              <MoodJourneyChart
                data={reportState.report.analytics.moodTimeline}
                explanation={reportState.report.narrative.emotionalJourney}
              />
            </ReportSection>
            <ReportSection title="Mood Distribution">
              <MoodDistributionChart
                data={reportState.report.analytics.moodDistribution}
                entriesWithoutMood={
                  reportState.report.analytics.entriesWithoutMood
                }
              />
            </ReportSection>
            <ReportSection title="Journaling Activity">
              <JournalActivityChart
                analytics={reportState.report.analytics}
                periodLabel={period.label}
                periodType={period.type}
              />
            </ReportSection>
            <ReportSection title="Recurring Themes">
              <RecurringThemesChart
                data={reportState.report.analytics.recurringThemes}
              />
            </ReportSection>
            <ReportSection title="Entry Type Distribution">
              <EntryTypeDistributionChart
                data={reportState.report.analytics.entryTypeDistribution}
              />
            </ReportSection>
            {reportState.report.narrative.emotionalFlow.length > 0 ? (
              <ReportSection title="Emotional Flow">
                <EmotionalFlowCard
                  stages={reportState.report.narrative.emotionalFlow}
                />
              </ReportSection>
            ) : null}
            <ReportSection title="Things You Did">
              <SimpleListBlock
                emptyText="Activities will appear when the entries provide enough evidence."
                items={reportState.report.narrative.activities}
              />
            </ReportSection>
            <ReportSection title="Wins and Challenges">
              <View className="gap-6">
                <SimpleListBlock
                  emptyText="Wins will appear when there is enough evidence."
                  items={reportState.report.narrative.wins}
                  title="Wins"
                  variant="success"
                />
                <SimpleListBlock
                  emptyText="Challenges will appear when there is enough evidence."
                  items={reportState.report.narrative.challenges}
                  title="Challenges"
                  variant="challenge"
                />
              </View>
            </ReportSection>
            <ReportSection title="What You Enjoyed">
              <SimpleListBlock
                emptyText="Enjoyed moments will appear when the entries mention them."
                items={reportState.report.narrative.enjoyed}
              />
            </ReportSection>
            <ReportSection title="Patterns Noticed">
              <PatternCards items={reportState.report.narrative.patterns} />
            </ReportSection>
            <ReportSection title="What Could Have Gone Better">
              <SimpleListBlock
                emptyText="Suggestions will appear when there is enough evidence."
                items={reportState.report.narrative.improvements}
              />
            </ReportSection>
            <NextFocusCard focus={reportState.report.narrative.nextFocus} />
            <ReflectionPromptCard
              prompt={reportState.report.narrative.reflectionPrompt}
            />
          </>
        ) : reportState.legacyReportAvailable ? (
          <OlderFormatState
            disabled={reportState.isGenerating || !hasEnoughEntries}
            hasEnoughEntries={hasEnoughEntries}
            onGenerate={handleGenerate}
            periodType={period.type}
          />
        ) : (
          <EmptyReportState
            availableEntryCount={reportState.availableEntryCount}
            disabled={reportState.isGenerating || !hasEnoughEntries}
            hasEnoughEntries={hasEnoughEntries}
            minimumEntries={minimumEntries}
            onGenerate={handleGenerate}
            periodType={period.type}
          />
        )}
      </ScrollView>
      <BottomTabBar activeTab="Insights" />
    </ReportShell>
  );
}

function ReportShell({
  bottomNavHeight,
  children,
  insetsTop,
}: {
  bottomNavHeight: number;
  children: ReactNode;
  insetsTop: number;
}) {
  return (
    <View className="flex-1 bg-[#FAF7F2]">
      <StatusBar hidden />
      <LinearGradient
        colors={["#F4EFFA", "#FAF7F2", "#FAF7F2"]}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          bottom: 0,
          left: 0,
          paddingBottom: bottomNavHeight,
          paddingTop: insetsTop,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      {children}
    </View>
  );
}

function LoadingState({ periodType }: { periodType: "weekly" | "monthly" }) {
  return (
    <View className="items-center rounded-[28px] bg-white px-6 py-8">
      <ActivityIndicator color={reportColors.primary} />
      <Text
        allowFontScaling={false}
        className="mt-4 text-center text-[17px] font-semibold leading-6 text-[#18181B]"
      >
        Loading your {periodType} reflection...
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-2 text-center text-[15px] leading-6 text-[#71717B]"
      >
        Saved visual reports remain available offline after they load once.
      </Text>
    </View>
  );
}

function UpdatingBanner({ periodType }: { periodType: "weekly" | "monthly" }) {
  return (
    <View className="flex-row items-center gap-3 rounded-[22px] bg-white px-4 py-4">
      <ActivityIndicator color={reportColors.primary} />
      <Text
        allowFontScaling={false}
        className="flex-1 text-[15px] font-semibold leading-6 text-[#52525B]"
      >
        DearDiary is reflecting on your {periodType === "weekly" ? "week" : "month"}...
      </Text>
    </View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View className="rounded-[22px] bg-[#FFE2EA] px-4 py-4">
      <Text allowFontScaling={false} className="text-[15px] leading-6 text-[#A60033]">
        {message}
      </Text>
    </View>
  );
}

function StaleBanner({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <View className="rounded-[26px] bg-white px-5 py-5">
      <Text
        allowFontScaling={false}
        className="text-[17px] font-bold leading-6 text-[#18181B]"
      >
        Your journal has changed since this reflection was generated.
      </Text>
      <PrimaryButton
        disabled={disabled}
        label="Update Reflection"
        onPress={onPress}
      />
    </View>
  );
}

function EmptyReportState({
  availableEntryCount,
  disabled,
  hasEnoughEntries,
  minimumEntries,
  onGenerate,
  periodType,
}: {
  availableEntryCount: number;
  disabled: boolean;
  hasEnoughEntries: boolean;
  minimumEntries: number;
  onGenerate: () => void;
  periodType: "weekly" | "monthly";
}) {
  return (
    <View className="rounded-[30px] bg-white px-6 py-7">
      <View className="size-12 items-center justify-center rounded-full bg-[#FFDDE8]">
        <Sparkles color={reportColors.primary} size={22} />
      </View>
      <Text
        allowFontScaling={false}
        className="mt-5 text-[23px] font-bold leading-8 text-[#18181B]"
      >
        Your {periodType} reflection has not been generated yet.
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-3 text-[16px] leading-7 text-[#71717B]"
      >
        DearDiary will analyze this {periodType === "weekly" ? "week's" : "month's"} entries and create a visual view of your moods, activity, themes, challenges and progress.
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-4 text-[15px] font-semibold leading-6 text-[#52525B]"
      >
        {availableEntryCount} {availableEntryCount === 1 ? "entry" : "entries"} available
      </Text>
      {!hasEnoughEntries ? (
        <Text
          allowFontScaling={false}
          className="mt-2 text-[14px] leading-6 text-[#71717B]"
        >
          Add at least {minimumEntries} entries this{" "}
          {periodType === "weekly" ? "week" : "month"} before generating.
        </Text>
      ) : null}
      <PrimaryButton
        disabled={disabled}
        label={getGenerateLabel(periodType)}
        onPress={onGenerate}
      />
    </View>
  );
}

function OlderFormatState({
  disabled,
  hasEnoughEntries,
  onGenerate,
  periodType,
}: {
  disabled: boolean;
  hasEnoughEntries: boolean;
  onGenerate: () => void;
  periodType: "weekly" | "monthly";
}) {
  return (
    <View className="rounded-[30px] bg-white px-6 py-7">
      <Text
        allowFontScaling={false}
        className="text-[23px] font-bold leading-8 text-[#18181B]"
      >
        Older report format
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-3 text-[16px] leading-7 text-[#71717B]"
      >
        A previous reflection is available, but it uses the older report format.
        Update it to view the new graphical report.
      </Text>
      {!hasEnoughEntries ? (
        <Text
          allowFontScaling={false}
          className="mt-3 text-[14px] leading-6 text-[#71717B]"
        >
          Add more entries before generating the new visual dashboard.
        </Text>
      ) : null}
      <PrimaryButton
        disabled={disabled}
        label="Generate Visual Reflection"
        onPress={onGenerate}
      />
      <Text
        allowFontScaling={false}
        className="mt-4 text-[13px] leading-5 text-[#71717B]"
      >
        {getReportTitle(periodType)} reports now use deterministic chart data
        with a concise AI interpretation.
      </Text>
    </View>
  );
}

function PrimaryButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  const pressValue = useRef(new Animated.Value(0)).current;
  const scale = pressValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  function animatePress(toValue: number) {
    Animated.timing(pressValue, {
      duration: toValue === 1 ? 90 : 130,
      toValue,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View className="mt-6" style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled === true }}
        className="h-[52px] flex-row items-center justify-center rounded-full px-5"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animatePress(1)}
        onPressOut={() => animatePress(0)}
        style={({ pressed }) => ({
          backgroundColor: disabled ? "#E4E4E7" : reportColors.primary,
          opacity: disabled ? 0.7 : pressed ? 0.88 : 1,
        })}
      >
        <Text
          allowFontScaling={false}
          className="text-[16px] font-bold leading-6"
          style={{ color: disabled ? "#71717B" : "white" }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
