import { Text, View } from "react-native";

import { addSafeBreakOpportunities } from "@/lib/text/add-safe-break-opportunities";
import type { ThemeFrequency } from "@/types/insights";

type RecurringThemesCardProps = {
  themes: ThemeFrequency[];
};

export function RecurringThemesCard({ themes }: RecurringThemesCardProps) {
  const largestCount = Math.max(...themes.map((theme) => theme.count), 1);
  const subtitle = themes.some((theme) => theme.source === "ai")
    ? "Themes identified by DearDiary"
    : "Tags from your entries";

  return (
    <View
      className="rounded-[28px] bg-white/85 px-5 py-5"
      style={{ boxShadow: "0 10px 30px rgba(160, 140, 200, 0.16)" }}
    >
      <Text className="text-[18px] font-bold leading-6 text-[#18181B]">
        Recurring Themes
      </Text>
      <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
        {subtitle}
      </Text>

      {themes.length > 0 ? (
        <View className="mt-5 gap-4">
          {themes.map((theme) => (
            <View key={theme.label}>
              <View className="flex-row items-center gap-3">
                <Text
                  className="min-w-0 flex-1 text-[14px] font-semibold leading-6 text-[#27272A]"
                  selectable
                >
                  {addSafeBreakOpportunities(theme.label)}
                </Text>
                <Text className="text-[13px] font-bold leading-5 text-[#52525B]">
                  {theme.count} {theme.count === 1 ? "entry" : "entries"}
                </Text>
              </View>
              {theme.source === "ai" ? (
                <Text className="mt-1 text-[12px] leading-4 text-[#71717B]">
                  AI-identified theme
                </Text>
              ) : null}
              <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#F4F4F5]">
                <View
                  className="h-full rounded-full bg-[#A98FD0]"
                  style={{
                    width: `${Math.round((theme.count / largestCount) * 100)}%`,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text className="mt-5 text-[14px] leading-6 text-[#71717B]">
          Themes will appear as you add tags or generate reports.
        </Text>
      )}
    </View>
  );
}
