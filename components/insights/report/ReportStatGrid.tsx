import { Text, useWindowDimensions, View } from "react-native";

import { reportColors } from "@/constants/report-theme";
import type { ReportAnalytics } from "@/types/aiInsightReport";

type ReportStatGridProps = {
  analytics: ReportAnalytics;
};

export function ReportStatGrid({ analytics }: ReportStatGridProps) {
  const { width } = useWindowDimensions();
  const useSingleColumn = width < 340;
  const stats = [
    {
      title: "Total Entries",
      value: String(analytics.totalEntries),
    },
    {
      title: "Active Days",
      value: String(analytics.activeDays),
    },
    {
      title: "Longest Streak",
      value: `${analytics.longestStreak} ${analytics.longestStreak === 1 ? "day" : "days"}`,
    },
    {
      title: "Avg Entries / Day",
      value: analytics.averageEntriesPerActiveDay.toFixed(1),
    },
  ];

  return (
    <View className="flex-row flex-wrap gap-3">
      {stats.map((stat) => (
        <View
          className="rounded-[24px] px-4 py-4"
          key={stat.title}
          style={{
            backgroundColor: reportColors.ivory,
            flexBasis: useSingleColumn ? "100%" : "47%",
            flexGrow: 1,
          }}
        >
          <Text
            allowFontScaling={false}
            className="text-[13px] font-semibold leading-5 text-[#71717B]"
          >
            {stat.title}
          </Text>
          <Text
            allowFontScaling={false}
            className="mt-2 text-[25px] font-bold leading-8 text-[#18181B]"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}
