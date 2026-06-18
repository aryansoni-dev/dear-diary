import { Text, View } from "react-native";

import { formatEntryTypeLabel } from "@/components/insights/report/report-formatters";
import { reportColors } from "@/constants/report-theme";
import type { EntryTypeDistributionItem } from "@/types/aiInsightReport";

type EntryTypeDistributionChartProps = {
  data: EntryTypeDistributionItem[];
};

export function EntryTypeDistributionChart({
  data,
}: EntryTypeDistributionChartProps) {
  if (data.length === 0) {
    return (
      <Text allowFontScaling={false} className="text-[15px] leading-6 text-[#71717B]">
        Entry type distribution will appear after entries are available.
      </Text>
    );
  }

  return (
    <View className="gap-3">
      {data.map((item) => (
        <View
          className="rounded-[20px] px-4 py-3"
          key={item.type}
          style={{ backgroundColor: reportColors.ivory }}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Text
              allowFontScaling={false}
              className="flex-1 text-[15px] font-semibold leading-5 text-[#3F3F46]"
            >
              {formatEntryTypeLabel(item.type)}
            </Text>
            <Text
              allowFontScaling={false}
              className="text-[13px] font-bold leading-5 text-[#71717B]"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {item.count} · {Math.round(item.percentage)}%
            </Text>
          </View>
          <View className="mt-3 h-2 overflow-hidden rounded-full bg-white">
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: reportColors.primary,
                width: `${Math.max(4, Math.min(100, item.percentage))}%`,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
