import { Text, View } from "react-native";

import {
  formatReportDate,
  getReportTitle,
} from "@/components/insights/report/report-formatters";
import { reportColors } from "@/constants/report-theme";
import type {
  ActivityTimelineItem,
  AIInsightPeriodType,
  ReportAnalytics,
} from "@/types/aiInsightReport";

type JournalActivityChartProps = {
  analytics: ReportAnalytics;
  periodLabel: string;
  periodType: AIInsightPeriodType;
};

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export function JournalActivityChart({
  analytics,
  periodLabel,
  periodType,
}: JournalActivityChartProps) {
  const accessibilityLabel = `Journal activity for ${periodLabel}. ${analytics.activeDays} active days and ${analytics.totalEntries} total entries.`;

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      {periodType === "weekly" ? (
        <WeeklyActivityRow data={analytics.activityTimeline} />
      ) : (
        <MonthlyActivityGrid data={analytics.activityTimeline} />
      )}
      <View className="mt-4 flex-row items-center gap-3">
        <Text allowFontScaling={false} className="text-[12px] leading-5 text-[#71717B]">
          Less activity
        </Text>
        {[0, 1, 2, 3].map((level) => (
          <View
            className="size-4 rounded-[6px]"
            key={level}
            style={{ backgroundColor: getActivityColor(level) }}
          />
        ))}
        <Text allowFontScaling={false} className="text-[12px] leading-5 text-[#71717B]">
          More activity
        </Text>
      </View>
      {analytics.mostActiveDate ? (
        <Text
          allowFontScaling={false}
          className="mt-4 text-[14px] font-semibold leading-5 text-[#52525B]"
        >
          Most active day: {formatReportDate(analytics.mostActiveDate)} ·{" "}
          {analytics.mostActiveDateEntryCount}{" "}
          {analytics.mostActiveDateEntryCount === 1 ? "entry" : "entries"}
        </Text>
      ) : (
        <Text
          allowFontScaling={false}
          className="mt-4 text-[14px] leading-5 text-[#71717B]"
        >
          {getReportTitle(periodType)} activity will appear here after entries.
        </Text>
      )}
    </View>
  );
}

function WeeklyActivityRow({ data }: { data: ActivityTimelineItem[] }) {
  return (
    <View className="gap-3">
      <View className="flex-row justify-between">
        {dayLabels.map((label, index) => (
          <Text
            allowFontScaling={false}
            className="w-9 text-center text-[13px] font-semibold leading-5 text-[#71717B]"
            key={`${label}-${index}`}
          >
            {label}
          </Text>
        ))}
      </View>
      <View className="flex-row justify-between">
        {data.slice(0, 7).map((item) => (
          <View
            className="size-9 items-center justify-center rounded-full"
            key={item.date}
            style={{ backgroundColor: getActivityColor(item.entryCount) }}
          >
            <Text
              allowFontScaling={false}
              className="text-[12px] font-bold leading-5 text-[#3F3F46]"
            >
              {item.entryCount > 0 ? item.entryCount : ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MonthlyActivityGrid({ data }: { data: ActivityTimelineItem[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {data.map((item) => (
        <View
          accessibilityLabel={`${formatReportDate(item.date)}: ${item.entryCount} entries`}
          className="size-8 items-center justify-center rounded-[10px]"
          key={item.date}
          style={{ backgroundColor: getActivityColor(item.entryCount) }}
        >
          <Text
            allowFontScaling={false}
            className="text-[11px] font-semibold leading-4 text-[#3F3F46]"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {Number(item.date.slice(-2))}
          </Text>
        </View>
      ))}
    </View>
  );
}

function getActivityColor(entryCount: number) {
  if (entryCount <= 0) {
    return reportColors.activityEmpty;
  }

  if (entryCount === 1) {
    return reportColors.activityLow;
  }

  if (entryCount === 2) {
    return reportColors.activityMedium;
  }

  return reportColors.activityHigh;
}
