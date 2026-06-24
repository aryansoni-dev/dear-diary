import { Text, View } from "react-native";

import { moodMetadata } from "@/constants/moods";
import type { InsightsSummary } from "@/types/insights";

type InsightsSummaryGridProps = {
  summary: InsightsSummary;
};

export function InsightsSummaryGrid({ summary }: InsightsSummaryGridProps) {
  const topMood = summary.topMood ? moodMetadata[summary.topMood] : null;
  const cards = [
    {
      detail: summary.entryCount === 1 ? "Entry" : "Entries",
      label: "Entries",
      value: String(summary.entryCount),
      visual: "📝",
    },
    {
      detail: summary.activeDays === 1 ? "Active day" : "Active days",
      label: "Active",
      value: String(summary.activeDays),
      visual: "📅",
    },
    {
      detail: "Top mood",
      label: "Top mood",
      value: topMood?.label ?? "No mood yet",
      visual: topMood?.emoji ?? "✍️",
    },
  ];

  return (
    <View className="mt-5 flex-row gap-3">
      {cards.map((card) => (
        <View
          accessibilityLabel={`${card.label}: ${card.value}`}
          className="min-h-[116px] flex-1 items-center justify-center rounded-[24px] bg-white/85 px-2 py-4"
          key={card.label}
          style={{ boxShadow: "0 8px 24px rgba(160, 140, 200, 0.16)" }}
        >
          <Text className="text-[23px] leading-7">{card.visual}</Text>
          <Text className="mt-3 text-center text-[18px] font-bold leading-6 text-[#18181B]">
            {card.value}
          </Text>
          <Text className="mt-1 text-center text-[12px] font-semibold leading-6 text-[#71717B]">
            {card.detail}
          </Text>
        </View>
      ))}
    </View>
  );
}
