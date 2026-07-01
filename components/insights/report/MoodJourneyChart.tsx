import { ScrollView, Text, View } from "react-native";

import { AIResponseRenderer } from "@/components/ai/ai-response-renderer";
import {
  formatMoodLabel,
  formatReportDate,
} from "@/components/insights/report/report-formatters";
import {
  moodJourneyColors,
  moodReportColors,
  reportCardShadow,
  reportColors,
} from "@/constants/report-theme";
import type { MoodTimelineItem } from "@/types/aiInsightReport";

type MoodJourneyChartProps = {
  data: MoodTimelineItem[];
  explanation: string;
};

export function MoodJourneyChart({ data, explanation }: MoodJourneyChartProps) {
  const activeDays = data.filter(
    (item) => item.entryCount > 0 || item.dominantMood !== null,
  );

  if (activeDays.length === 0) {
    return (
      <Text
        allowFontScaling={false}
        className="text-[15px] leading-6"
        style={{ color: moodJourneyColors.emptyText }}
      >
        Mood journey will appear after a mood check-in or an entry with a mood.
      </Text>
    );
  }

  const accessibilityLabel = `Mood journey. ${activeDays
    .map(
      (item) =>
        `${formatReportDate(item.date)}: ${formatMoodLabel(item.dominantMood)}, ${getActivityLabel(item.entryCount)}`,
    )
    .join(". ")}.`;

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 4 }}
      >
        {activeDays.map((item) => (
          <View
            className="min-w-[112px] rounded-[22px] px-4 py-4"
            key={item.date}
            style={{
              backgroundColor: reportColors.lavender,
              boxShadow: reportCardShadow,
            }}
          >
            <Text
              allowFontScaling={false}
              className="text-[13px] font-semibold leading-5"
              style={{ color: moodJourneyColors.cardDateText }}
            >
              {formatReportDate(item.date)}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-1.5">
              {item.moods.length > 0 ? (
                item.moods.slice(0, 4).map((mood, index) => (
                  <View
                    className="size-3 rounded-full"
                    key={`${item.date}-${mood}-${index}`}
                    style={{
                      backgroundColor:
                        moodReportColors[index % moodReportColors.length],
                    }}
                  />
                ))
              ) : (
                <View className="h-3 w-7 rounded-full bg-white" />
              )}
            </View>
            <Text
              allowFontScaling={false}
              className="mt-3 text-[15px] font-bold leading-5"
              style={{ color: moodJourneyColors.moodText }}
            >
              {formatMoodLabel(item.dominantMood)}
            </Text>
            <Text
              allowFontScaling={false}
              className="mt-1 text-[12px] leading-5"
              style={{ color: moodJourneyColors.entryCountText }}
            >
              {getActivityLabel(item.entryCount)}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View className="mt-4 min-w-0">
        <AIResponseRenderer
          content={explanation}
          diagnosticLabel="insight_report_emotional_journey"
          variant="report"
        />
      </View>
    </View>
  );
}

function getActivityLabel(entryCount: number) {
  if (entryCount === 0) {
    return "Mood check-in";
  }

  return `${entryCount} ${entryCount === 1 ? "entry" : "entries"}`;
}
