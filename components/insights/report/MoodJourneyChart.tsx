import { ScrollView, Text, View } from "react-native";

import {
  formatMoodLabel,
  formatReportDate,
} from "@/components/insights/report/report-formatters";
import { moodReportColors, reportColors } from "@/constants/report-theme";
import type { MoodTimelineItem } from "@/types/aiInsightReport";

type MoodJourneyChartProps = {
  data: MoodTimelineItem[];
  explanation: string;
};

export function MoodJourneyChart({ data, explanation }: MoodJourneyChartProps) {
  const activeDays = data.filter((item) => item.entryCount > 0);

  if (activeDays.length === 0) {
    return (
      <Text allowFontScaling={false} className="text-[15px] leading-6 text-[#71717B]">
        Mood journey will appear after entries are added in this period.
      </Text>
    );
  }

  const accessibilityLabel = `Mood journey. ${activeDays
    .map(
      (item) =>
        `${formatReportDate(item.date)}: ${formatMoodLabel(item.dominantMood)}, ${item.entryCount} entries`,
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
            style={{ backgroundColor: reportColors.lavender }}
          >
            <Text
              allowFontScaling={false}
              className="text-[13px] font-semibold leading-5 text-[#71717B]"
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
              className="mt-3 text-[15px] font-bold leading-5 text-[#18181B]"
            >
              {formatMoodLabel(item.dominantMood)}
            </Text>
            <Text
              allowFontScaling={false}
              className="mt-1 text-[12px] leading-5 text-[#71717B]"
            >
              {item.entryCount} {item.entryCount === 1 ? "entry" : "entries"}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Text allowFontScaling={false} className="mt-4 text-[15px] leading-6 text-[#52525B]">
        {explanation}
      </Text>
    </View>
  );
}
