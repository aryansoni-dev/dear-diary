import { Pressable, Text, View } from "react-native";

import type { InsightsPeriod } from "@/types/insights";

const periods: { label: string; value: InsightsPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

type InsightsPeriodSelectorProps = {
  onChange: (period: InsightsPeriod) => void;
  value: InsightsPeriod;
};

export function InsightsPeriodSelector({
  onChange,
  value,
}: InsightsPeriodSelectorProps) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-[20px] bg-white/75 p-1"
      style={{ boxShadow: "0 8px 24px rgba(160, 140, 200, 0.14)" }}
    >
      {periods.map((period) => {
        const isSelected = value === period.value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className={`min-h-11 flex-1 items-center justify-center rounded-[16px] px-3 ${
              isSelected ? "bg-[#FF2056]" : "bg-transparent"
            }`}
            key={period.value}
            onPress={() => onChange(period.value)}
          >
            <Text
              className={`text-[14px] font-bold leading-5 ${
                isSelected ? "text-white" : "text-[#52525B]"
              }`}
            >
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
