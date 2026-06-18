import { Text, View } from "react-native";

import { formatMoodLabel } from "@/components/insights/report/report-formatters";
import { moodReportColors } from "@/constants/report-theme";
import type { MoodDistributionItem } from "@/types/aiInsightReport";

type MoodDistributionChartProps = {
  data: MoodDistributionItem[];
  entriesWithoutMood: number;
};

export function MoodDistributionChart({
  data,
  entriesWithoutMood,
}: MoodDistributionChartProps) {
  if (data.length === 0) {
    return (
      <Text allowFontScaling={false} className="text-[15px] leading-6 text-[#71717B]">
        No mood data was selected for this period.
      </Text>
    );
  }

  const accessibilityLabel = `Mood distribution. ${data
    .map(
      (item) =>
        `${formatMoodLabel(item.mood)}: ${item.count} entries, ${Math.round(
          item.percentage,
        )} percent`,
    )
    .join(". ")}.`;

  return (
    <View accessibilityLabel={accessibilityLabel} accessible className="gap-4">
      {data.map((item, index) => (
        <View className="gap-2" key={item.mood}>
          <View className="flex-row items-center justify-between gap-3">
            <Text
              allowFontScaling={false}
              className="flex-1 text-[15px] font-semibold leading-5 text-[#3F3F46]"
            >
              {formatMoodLabel(item.mood)}
            </Text>
            <Text
              allowFontScaling={false}
              className="text-[13px] font-semibold leading-5 text-[#71717B]"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {item.count} · {Math.round(item.percentage)}%
            </Text>
          </View>
          <View className="h-3 overflow-hidden rounded-full bg-[#F4EFFA]">
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: moodReportColors[index % moodReportColors.length],
                width: `${Math.max(3, Math.min(100, item.percentage))}%`,
              }}
            />
          </View>
        </View>
      ))}
      {entriesWithoutMood > 0 ? (
        <Text allowFontScaling={false} className="text-[13px] leading-5 text-[#71717B]">
          {entriesWithoutMood} entries had no mood selected.
        </Text>
      ) : null}
    </View>
  );
}
