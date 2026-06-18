import { Text, View } from "react-native";

import { reportColors } from "@/constants/report-theme";
import type { ThemeFrequencyItem } from "@/types/aiInsightReport";

type RecurringThemesChartProps = {
  data: ThemeFrequencyItem[];
};

export function RecurringThemesChart({ data }: RecurringThemesChartProps) {
  if (data.length === 0) {
    return (
      <Text allowFontScaling={false} className="text-[15px] leading-6 text-[#71717B]">
        Recurring themes will appear when tags or repeated writing topics are
        available.
      </Text>
    );
  }

  const maxCount = Math.max(...data.map((item) => item.count), 1);
  const accessibilityLabel = `Recurring themes. ${data
    .map((item) => `${item.name}: ${item.count}, ${getSourceLabel(item.source)}`)
    .join(". ")}.`;

  return (
    <View accessible accessibilityLabel={accessibilityLabel} className="gap-4">
      {data.map((item) => (
        <View className="gap-2" key={`${item.source}-${item.name}`}>
          <View className="flex-row items-center justify-between gap-3">
            <Text
              allowFontScaling={false}
              className="flex-1 text-[15px] font-semibold leading-5 text-[#3F3F46]"
            >
              {item.name}
            </Text>
            <View className="rounded-full bg-[#F4EFFA] px-3 py-1">
              <Text
                allowFontScaling={false}
                className="text-[11px] font-semibold leading-4 text-[#71717B]"
              >
                {getSourceLabel(item.source)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-3 flex-1 overflow-hidden rounded-full bg-[#F4EFFA]">
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: reportColors.primary,
                  width: `${Math.max(6, (item.count / maxCount) * 100)}%`,
                }}
              />
            </View>
            <Text
              allowFontScaling={false}
              className="w-8 text-right text-[13px] font-bold leading-5 text-[#52525B]"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {item.count}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function getSourceLabel(source: ThemeFrequencyItem["source"]) {
  return source === "tag" ? "From tags" : "From writing";
}
