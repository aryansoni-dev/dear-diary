import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { moodMetadata } from "@/constants/moods";
import type { MoodCount } from "@/types/insights";

type MoodDistributionCardProps = {
  entriesWithoutMood: number;
  moodDistribution: MoodCount[];
};

export function MoodDistributionCard({
  entriesWithoutMood,
  moodDistribution,
}: MoodDistributionCardProps) {
  return (
    <InsightCard title="Mood Distribution" subtitle="Selected moods in this period">
      {moodDistribution.length > 0 ? (
        <View className="gap-4">
          {moodDistribution.map((item) => {
            const mood = moodMetadata[item.moodId];

            return (
              <View key={item.moodId}>
                <View className="flex-row items-center gap-3">
                  <Text className="text-[20px] leading-6">{mood.emoji}</Text>
                  <Text className="flex-1 text-[14px] font-semibold leading-6 text-[#27272A]">
                    {mood.label}
                  </Text>
                  <Text className="text-[13px] font-bold leading-6 text-[#52525B]">
                    {item.count}
                  </Text>
                  <Text className="w-11 text-right text-[13px] font-semibold leading-6 text-[#71717B]">
                    {item.percentage}%
                  </Text>
                </View>
                <View className="mt-2 h-2 overflow-hidden rounded-full bg-[#F4F4F5]">
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: mood.dotColor,
                      width: `${item.percentage}%`,
                    }}
                  />
                </View>
              </View>
            );
          })}
          {entriesWithoutMood > 0 ? (
            <Text className="text-[13px] leading-6 text-[#71717B]">
              {entriesWithoutMood}{" "}
              {entriesWithoutMood === 1 ? "entry had" : "entries had"} no mood selected.
            </Text>
          ) : null}
        </View>
      ) : (
        <EmptyCardText
          text={
            entriesWithoutMood > 0
              ? "Entries in this period do not have moods selected yet."
              : "Mood distribution will appear after you begin adding moods."
          }
        />
      )}
    </InsightCard>
  );
}

function InsightCard({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <View
      className="rounded-[28px] bg-white/85 px-5 py-5"
      style={{ boxShadow: "0 10px 30px rgba(160, 140, 200, 0.16)" }}
    >
      <Text className="text-[18px] font-bold leading-6 text-[#18181B]">
        {title}
      </Text>
      <Text className="mt-1 text-[13px] leading-6 text-[#71717B]">
        {subtitle}
      </Text>
      <View className="mt-5">{children}</View>
    </View>
  );
}

function EmptyCardText({ text }: { text: string }) {
  return (
    <Text className="text-[14px] leading-6 text-[#71717B]">
      {text}
    </Text>
  );
}
