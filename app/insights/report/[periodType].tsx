import { useAuth } from "@clerk/expo";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import { useMemo } from "react";
import {
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
import {
  EmptyReportState,
  ErrorBanner,
  LoadingState,
  OlderFormatState,
  PrimaryButton,
  ReportRegenerateCard,
  ReportShell,
  UpdatingBanner,
} from "@/components/insights/report/ReportScreenStates";
import { ReportStatGrid } from "@/components/insights/report/ReportStatGrid";
import { reportColors } from "@/constants/report-theme";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useAIInsightReport } from "@/hooks/useAIInsightReport";
import {
  getCurrentReportPeriod,
  isAIInsightPeriodType,
} from "@/lib/insights/reportPeriods";

export default function AIInsightReportScreen() {
  const { isLoaded, isSignedIn } = useAuth();
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
  const reportState = useAIInsightReport(period, {
    enabled: isValidPeriodType,
  });
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const minimumEntries = period.type === "weekly" ? 2 : 3;
  const hasEnoughEntries = reportState.availableEntryCount >= minimumEntries;

  function handleGenerate() {
    void reportState.generate();
  }

  function handleRegenerate() {
    showDialog({
      cancelText: "Keep Current",
      confirmText: "Regenerate",
      icon: "✦",
      message:
        "DearDiary will analyze this period again and replace the current visual reflection.",
      onConfirm: () => {
        void reportState.regenerate();
      },
      showCancel: true,
      title: "Regenerate reflection?",
    });
  }

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
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
            <ReportRegenerateCard
              disabled={reportState.isGenerating || !hasEnoughEntries}
              isStale={reportState.isStale}
              onPress={handleRegenerate}
            />
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
