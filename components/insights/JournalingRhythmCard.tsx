import { Text, View } from "react-native";

import { moodMetadata } from "@/constants/moods";
import type { WeekdayPattern } from "@/types/insights";

type JournalingRhythmCardProps = {
  patterns: WeekdayPattern[];
};

export function JournalingRhythmCard({ patterns }: JournalingRhythmCardProps) {
  const largestCount = Math.max(...patterns.map((pattern) => pattern.entryCount), 1);
  const topPattern = getSingleTopPattern(patterns);

  return (
    <View
      className="rounded-[28px] bg-white/85 px-5 py-5"
      style={{ boxShadow: "0 10px 30px rgba(160, 140, 200, 0.16)" }}
    >
      <Text className="text-[18px] font-bold leading-6 text-[#18181B]">
        Journaling Rhythm
      </Text>
      <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
        Entry activity by weekday
      </Text>

      {patterns.some((pattern) => pattern.entryCount > 0) ? (
        <View className="mt-5 gap-3">
          {patterns.map((pattern) => {
            const widthPercentage = Math.max(
              8,
              Math.round((pattern.entryCount / largestCount) * 100),
            );
            const mood = pattern.dominantMood
              ? moodMetadata[pattern.dominantMood]
              : null;

            return (
              <View className="flex-row items-center gap-3" key={pattern.label}>
                <Text className="w-9 text-[13px] font-bold leading-5 text-[#52525B]">
                  {pattern.label}
                </Text>
                <View className="h-3 flex-1 overflow-hidden rounded-full bg-[#F4F4F5]">
                  {pattern.entryCount > 0 ? (
                    <View
                      className="h-full rounded-full bg-[#FF8AAB]"
                      style={{ width: `${widthPercentage}%` }}
                    />
                  ) : null}
                </View>
                <Text className="w-6 text-right text-[13px] font-bold leading-5 text-[#27272A]">
                  {pattern.entryCount}
                </Text>
                <Text className="w-7 text-center text-[17px] leading-5">
                  {mood?.emoji ?? ""}
                </Text>
              </View>
            );
          })}
          {topPattern ? (
            <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
              You journal most often on {topPattern.label}s.
            </Text>
          ) : null}
        </View>
      ) : (
        <Text className="mt-5 text-[14px] leading-6 text-[#71717B]">
          Keep journaling to discover which days form your natural rhythm.
        </Text>
      )}
    </View>
  );
}

function getSingleTopPattern(patterns: WeekdayPattern[]) {
  const sortedPatterns = [...patterns].sort(
    (first, second) => second.entryCount - first.entryCount,
  );
  const topPattern = sortedPatterns[0];

  if (!topPattern || topPattern.entryCount === 0) {
    return null;
  }

  if (sortedPatterns[1]?.entryCount === topPattern.entryCount) {
    return null;
  }

  return topPattern;
}
