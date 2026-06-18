import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { getAchievements } from "@/lib/achievements";
import { useJournalStore } from "@/store/journal-store";
import type {
  AchievementCategory,
  AchievementStatus,
} from "@/types/achievement";
import type { JournalEntry } from "@/types/journal";

type AchievementFilter = "all" | "unlocked" | "locked";

const filters: { label: string; value: AchievementFilter }[] = [
  { label: "All", value: "all" },
  { label: "Unlocked", value: "unlocked" },
  { label: "Locked", value: "locked" },
];

const categoryLabels: Record<AchievementCategory, string> = {
  depth: "Depth",
  intention: "Morning Intention",
  journaling: "Journaling",
  mood: "Mood",
  reflection: "Reflection Types",
  streak: "Streak",
};

export function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const [selectedFilter, setSelectedFilter] =
    useState<AchievementFilter>("all");
  const currentStreak = useMemo(() => getReflectionStreak(entries), [entries]);
  const achievements = useMemo(
    () => getAchievements(entries, currentStreak),
    [currentStreak, entries],
  );
  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;
  const filteredAchievements = achievements.filter((achievement) => {
    if (selectedFilter === "unlocked") {
      return achievement.unlocked;
    }

    if (selectedFilter === "locked") {
      return !achievement.unlocked;
    }

    return true;
  });

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile-tab");
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#FCE8F8", "#F8F3FC", "#FFFFFF"]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.5, 0.82]}
        start={{ x: 0, y: 0 }}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(42, insets.bottom + 28),
          paddingHorizontal: 24,
          paddingTop: Math.max(62, insets.top + 30),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            accessibilityLabel="Go back"
            onPress={handleBackPress}
            shadow="0 2px 6px rgba(39, 39, 42, 0.16)"
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </AnimatedIconButton>

          {/* <Text className="text-[17px] font-semibold leading-6 text-[#27272A]">
            Achievements
          </Text> */}

          <View className="size-[50px]" />
        </View>

        <View className="pt-8">
          <Text className="text-[32px] font-bold leading-10 text-[#27272A]">
            Achievements
          </Text>
          <Text className="mt-1 text-[15px] font-medium leading-6 text-[#71717B]">
            {hasHydrated
              ? `${unlockedCount} / ${achievements.length} unlocked`
              : "Loading achievements..."}
          </Text>
        </View>

        <View
          className="mt-7 flex-row rounded-full bg-white/80 p-1"
          style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.12)" }}
        >
          {filters.map((filter) => {
            const isSelected = selectedFilter === filter.value;

            return (
              <Pressable
                accessibilityRole="button"
                className="h-11 flex-1 items-center justify-center rounded-full"
                key={filter.value}
                onPress={() => setSelectedFilter(filter.value)}
                style={{
                  backgroundColor: isSelected ? "#FF2056" : "transparent",
                }}
              >
                <Text
                  className="text-[14px] font-bold leading-5"
                  style={{ color: isSelected ? "#FFFFFF" : "#71717B" }}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-4 pt-7">
          {filteredAchievements.map((achievement) => (
            <AchievementCard achievement={achievement} key={achievement.id} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function AchievementCard({
  achievement,
}: {
  achievement: AchievementStatus;
}) {
  const progressRatio =
    achievement.target > 0 ? achievement.progress / achievement.target : 0;

  return (
    <View
      className="overflow-hidden rounded-[24px] bg-white px-5 py-5"
      style={{
        borderCurve: "continuous",
        boxShadow: achievement.unlocked
          ? "0 8px 22px rgba(39, 39, 42, 0.11)"
          : "0 2px 8px rgba(39, 39, 42, 0.08)",
        opacity: achievement.unlocked ? 1 : 0.62,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="size-14 items-center justify-center rounded-[18px]"
          style={{ backgroundColor: getAchievementBackgroundColor(achievement.category) }}
        >
          <Text className="text-[27px] leading-8">
            {achievement.unlocked ? achievement.icon : "🔒"}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-[16px] font-bold leading-5 text-[#27272A]">
                {achievement.title}
              </Text>
              <Text className="mt-1 text-[12px] font-semibold uppercase leading-4 text-[#A1A1AA]">
                {categoryLabels[achievement.category]}
              </Text>
            </View>

            {achievement.unlocked ? (
              <View className="rounded-full bg-[#DCFCE7] px-3 py-1">
                <Text className="text-[11px] font-bold leading-4 text-[#15803D]">
                  Unlocked
                </Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-3 text-[14px] leading-5 text-[#71717B]">
            {achievement.description}
          </Text>
        </View>
      </View>

      <View className="mt-5 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold leading-4 text-[#71717B]">
            Progress
          </Text>
          <Text
            className="text-[12px] font-bold leading-4 text-[#51515B]"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {achievement.progress} / {achievement.target}
          </Text>
        </View>

        <View className="h-2 overflow-hidden rounded-full bg-[#F4F4F5]">
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: achievement.unlocked ? "#FF2056" : "#D4D4D8",
              width: `${Math.round(progressRatio * 100)}%`,
            }}
          />
        </View>
      </View>
    </View>
  );
}

function getAchievementBackgroundColor(category: AchievementCategory) {
  switch (category) {
    case "depth":
      return "#D8F0FE";
    case "intention":
      return "#FFF0D8";
    case "journaling":
      return "#F0DDFB";
    case "mood":
      return "#D8F3E2";
    case "reflection":
      return "#FFE1EE";
    case "streak":
      return "#FFDDE8";
  }
}

function getReflectionStreak(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const entryDays = new Set(
    entries.map((entry) => getLocalDateKey(new Date(entry.createdAt))),
  );
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let cursor = startOfLocalDay(today);

  if (!entryDays.has(getLocalDateKey(cursor))) {
    if (!entryDays.has(getLocalDateKey(yesterday))) {
      return 0;
    }

    cursor = startOfLocalDay(yesterday);
  }

  let streak = 0;

  while (entryDays.has(getLocalDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
