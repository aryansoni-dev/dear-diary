import { useAuth, useUser } from "@clerk/expo";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import {
  accountItems,
  preferenceItems,
  type ProfileAchievement,
  type ProfileInsight,
  type ProfileMenuItem,
  type ProfileStat,
} from "@/data/profile";
import { clearAllLocalData } from "@/lib/local-data";
import { useJournalStore } from "@/store/journal-store";
import type { JournalEntry, MoodId } from "@/types/journal";

const colors = {
  iconMuted: "#A1A1AA",
  primary: "#FF2056",
};

const profileNotificationsHref = "/profile-notifications" as Href;

const moodLabels: Record<MoodId, string> = {
  anxious: "Anxious",
  calm: "Calm",
  grateful: "Grateful",
  happy: "Happy",
  motivated: "Motivated",
  sad: "Sad",
};

const moodEmoji: Record<MoodId, string> = {
  anxious: "😰",
  calm: "😌",
  grateful: "🙏",
  happy: "😊",
  motivated: "🔥",
  sad: "😔",
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const setActiveUserId = useJournalStore((state) => state.setActiveUserId);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const displayName = getDisplayName({
    emailAddress: user?.primaryEmailAddress?.emailAddress,
    firstName: user?.firstName,
    fullName: user?.fullName,
  });
  const profileInitial = displayName.charAt(0).toUpperCase();
  const journalingSince = useMemo(
    () => getJournalingSinceLabel(entries, hasHydrated),
    [entries, hasHydrated],
  );
  const profileSummary = useMemo(
    () => getProfileSummary(entries, hasHydrated),
    [entries, hasHydrated],
  );

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setActiveUserId(null);

    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      setActiveUserId(user?.id ?? null);
      const message =
        error instanceof Error
          ? error.message
          : "We could not sign you out. Please try again.";
      Alert.alert("Sign out failed", message);
    } finally {
      setIsSigningOut(false);
    }
  }

  function handleClearAllData() {
    if (isClearingData) {
      return;
    }

    Alert.alert(
      "Clear all local data?",
      "This removes all journal entries and app preferences stored on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          onPress: async () => {
            setIsClearingData(true);

            try {
              await clearAllLocalData();
              Alert.alert("Local data cleared", "This device has been reset.");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "We could not clear local data. Please try again.";
              Alert.alert("Clear data failed", message);
            } finally {
              setIsClearingData(false);
            }
          },
          style: "destructive",
          text: "Clear Data",
        },
      ],
    );
  }

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home-tab");
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#FCE8F8", "#F8F3FC", "#FFFFFF"]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.48, 0.78]}
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
          paddingBottom: bottomNavHeight + 36,
          paddingHorizontal: 28,
          paddingTop: Math.max(66, insets.top + 34),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            onPress={handleBackPress}
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </Pressable>

          <Text className="text-[17px] font-semibold leading-6 text-[#27272A]">
            Profile
          </Text>

          <Pressable
            accessibilityLabel="Settings"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            onPress={() => showComingSoon("Settings")}
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="settings" size={22} color="#51515B" />
          </Pressable>
        </View>

        <View className="items-center pt-7">
          <View
            className="size-24 items-center justify-center rounded-full bg-[#F7DDF2]"
            style={{ boxShadow: "0 8px 24px rgba(229, 177, 222, 0.46)" }}
          >
            <Text className="text-[34px] font-bold leading-[40px] text-[#FF2056]">
              {profileInitial}
            </Text>
          </View>
          <Text className="mt-4 text-center text-[25px] font-bold leading-8 text-[#27272A]">
            {displayName}
          </Text>
          <Text className="mt-1 text-center text-[15px] leading-5 text-[#71717B]">
            {journalingSince}
          </Text>
        </View>

        <View className="flex-row gap-4 pt-7">
          {profileSummary.stats.map((stat) => (
            <View
              className="h-[116px] flex-1 items-center justify-center gap-1 rounded-[24px]"
              key={stat.label}
              style={{
                backgroundColor: stat.backgroundColor,
                boxShadow: "0 2px 5px rgba(39, 39, 42, 0.12)",
              }}
            >
              <Text className="text-[26px] leading-5">{stat.emoji}</Text>
              <Text className="text-[24px] font-bold leading-5 text-[#27272A]">
                {stat.value}
              </Text>
              <Text className="text-[13px] font-medium leading-5 text-[#71717B]">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="pt-9">
          <SectionTitle>Your Emotional Snapshot</SectionTitle>
          <View
            className="mt-5 rounded-[24px] bg-white px-6 py-6"
            style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
          >
            {profileSummary.insights.map((insight, index) => (
              <View key={insight.label}>
                <View className="flex-row items-center gap-5">
                  <View className="size-11 items-center justify-center">
                    <Text className="text-[23px] leading-8">
                      {insight.emoji}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] font-medium leading-4 text-[#71717B]">
                      {insight.label}
                    </Text>
                    <Text className="mt-1 text-[17px] font-semibold leading-6 text-[#27272A]">
                      {insight.value}
                    </Text>
                  </View>
                </View>
                {index < profileSummary.insights.length - 1 ? (
                  <View className="my-5 h-px bg-transparent" />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View className="pt-10">
          <SectionTitle>Achievements</SectionTitle>
          <View className="mt-5 gap-3.5">
            {profileSummary.achievements.map((achievement) => (
              <View
                className="min-h-[95px] flex-row items-center gap-4 rounded-[24px] px-5 py-4"
                key={achievement.title}
                style={{
                  backgroundColor: achievement.backgroundColor,
                  boxShadow: "0 2px 5px rgba(39, 39, 42, 0.11)",
                }}
              >
                <View className="size-14 items-center justify-center rounded-[17px] bg-white/75">
                  <Text className="text-[27px] leading-8">
                    {achievement.emoji}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-semibold leading-5 text-[#27272A]">
                    {achievement.title}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
                    {achievement.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <MenuSection
          items={preferenceItems}
          onItemPress={(item) => {
            if (item.label === "Notifications") {
              router.push(profileNotificationsHref);
              return;
            }

            showComingSoon(item.label);
          }}
          title="Preferences"
        />
        <MenuSection
          items={accountItems}
          onItemPress={(item) => showComingSoon(item.label)}
          title="Account"
        />

        <View className="items-center pt-9">
          <Pressable
            accessibilityRole="button"
            className="mb-4 min-h-10 flex-row items-center justify-center gap-2 rounded-full border border-[#FF2056] px-5 py-2"
            disabled={isClearingData}
            onPress={handleClearAllData}
          >
            {isClearingData ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Feather name="trash-2" size={17} color={colors.primary} />
            )}
            <Text className="text-[15px] font-semibold leading-5 text-[#FF2056]">
              Clear All Data
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="min-h-10 flex-row items-center justify-center gap-2 px-5"
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Feather name="log-out" size={17} color={colors.primary} />
            )}
            <Text className="text-[15px] font-semibold leading-5 text-[#FF2056]">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Profile" />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-[21px] font-bold leading-7 text-[#27272A]">
      {children}
    </Text>
  );
}

function MenuSection({
  items,
  onItemPress,
  title,
}: {
  items: ProfileMenuItem[];
  onItemPress: (item: ProfileMenuItem) => void;
  title: string;
}) {
  return (
    <View className="pt-10">
      <SectionTitle>{title}</SectionTitle>
      <View
        className="mt-5 rounded-[24px] bg-white p-2"
        style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
      >
        {items.map((item, index) => (
          <View key={item.label}>
            <Pressable
              accessibilityRole="button"
              className="min-h-[58px] flex-row items-center justify-between gap-3 rounded-[18px] p-3"
              onPress={() => onItemPress(item)}
            >
              <View className="flex-1 flex-row items-center gap-4">
                <View
                  className="size-10 items-center justify-center rounded-[13px]"
                  style={{ backgroundColor: item.backgroundColor }}
                >
                  <MenuIcon item={item} />
                </View>
                <Text className="flex-1 text-[15px] font-medium leading-5 text-[#27272A]">
                  {item.label}
                </Text>
              </View>

              {item.badge ? (
                <View className="rounded-full bg-[#FF2056] px-3 py-1">
                  <Text className="text-[10px] font-semibold leading-3 text-white">
                    {item.badge}
                  </Text>
                </View>
              ) : (
                <Feather
                  name="chevron-right"
                  size={22}
                  color={colors.iconMuted}
                />
              )}
            </Pressable>

            {index < items.length - 1 ? (
              <View className="mx-3 h-px bg-[#E4E4E7]" />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function MenuIcon({ item }: { item: ProfileMenuItem }) {
  if (item.iconSet === "ionicons") {
    return <Ionicons name={item.icon} size={21} color={item.iconColor} />;
  }

  if (item.iconSet === "material-community") {
    return (
      <MaterialCommunityIcons
        name={item.icon}
        size={21}
        color={item.iconColor}
      />
    );
  }

  return <Feather name={item.icon} size={21} color={item.iconColor} />;
}

function showComingSoon(label: string) {
  Alert.alert(label, "Coming soon");
}

function getDisplayName({
  emailAddress,
  firstName,
  fullName,
}: {
  emailAddress?: string;
  firstName?: string | null;
  fullName?: string | null;
}) {
  const name = fullName?.trim() || firstName?.trim();

  if (name) {
    return name;
  }

  const emailName = emailAddress?.split("@")[0]?.trim();

  return emailName || "DearDiary Friend";
}

function getProfileSummary(entries: JournalEntry[], hasHydrated: boolean) {
  if (!hasHydrated) {
    return {
      achievements: getLoadingAchievements(),
      insights: getLoadingInsights(),
      stats: getLoadingStats(),
    };
  }

  const entryCount = entries.length;
  const streak = getReflectionStreak(entries);
  const uniqueMoodCount = new Set(
    entries.flatMap((entry) => (entry.mood ? [entry.mood] : [])),
  ).size;
  const mostCommonMood = getMostCommonMood(entries);
  const averageReflectionMinutes = getAverageReflectionMinutes(entries);

  return {
    achievements: getProfileAchievements(entryCount, streak),
    insights: [
      {
        emoji: mostCommonMood ? moodEmoji[mostCommonMood] : "😌",
        label: "Most Common Mood",
        value: mostCommonMood ? moodLabels[mostCommonMood] : "No moods yet",
      },
      {
        emoji: "⏱️",
        label: "Average Reflection Time",
        value:
          averageReflectionMinutes > 0
            ? `${averageReflectionMinutes} min/entry`
            : "No entries yet",
      },
    ],
    stats: [
      {
        backgroundColor: "#F0DDFB",
        emoji: "📝",
        label: "Entries",
        value: String(entryCount),
      },
      {
        backgroundColor: "#FFE1EE",
        emoji: "🔥",
        label: "Streak",
        value: String(streak),
      },
      {
        backgroundColor: "#D8F3E2",
        emoji: "😊",
        label: "Moods",
        value: String(uniqueMoodCount),
      },
    ],
  };
}

function getLoadingStats(): ProfileStat[] {
  return [
    {
      backgroundColor: "#F0DDFB",
      emoji: "📝",
      label: "Entries",
      value: "…",
    },
    {
      backgroundColor: "#FFE1EE",
      emoji: "🔥",
      label: "Streak",
      value: "…",
    },
    {
      backgroundColor: "#D8F3E2",
      emoji: "😊",
      label: "Moods",
      value: "…",
    },
  ];
}

function getLoadingInsights(): ProfileInsight[] {
  return [
    {
      emoji: "😌",
      label: "Most Common Mood",
      value: "Loading...",
    },
    {
      emoji: "⏱️",
      label: "Average Reflection Time",
      value: "Loading...",
    },
  ];
}

function getLoadingAchievements(): ProfileAchievement[] {
  return [
    {
      backgroundColor: "#D8F3E2",
      emoji: "🌱",
      subtitle: "Loading your reflection journey",
      title: "First Week",
    },
    {
      backgroundColor: "#FFE1EE",
      emoji: "🔥",
      subtitle: "Loading your current momentum",
      title: "Reflection Streak",
    },
    {
      backgroundColor: "#F0DDFB",
      emoji: "📝",
      subtitle: "Loading your saved entries",
      title: "Entries Written",
    },
  ];
}

function getProfileAchievements(
  entryCount: number,
  streak: number,
): ProfileAchievement[] {
  const nextEntryMilestone = getNextEntryMilestone(entryCount);
  const hasFirstWeek = streak >= 7;

  return [
    {
      backgroundColor: "#D8F3E2",
      emoji: "🌱",
      subtitle: hasFirstWeek
        ? "You showed up 7 days in a row"
        : `${Math.min(streak, 6)}/7 days completed`,
      title: hasFirstWeek ? "First Week Completed" : "First Week In Progress",
    },
    {
      backgroundColor: "#FFE1EE",
      emoji: "🔥",
      subtitle:
        streak > 0
          ? "Keep the momentum going"
          : "Write today to begin a streak",
      title: `${streak} Day Streak`,
    },
    {
      backgroundColor: "#F0DDFB",
      emoji: "📝",
      subtitle:
        entryCount >= nextEntryMilestone
          ? "Your reflection journey grows"
          : `${entryCount}/${nextEntryMilestone} entries completed`,
      title: `${entryCount} ${entryCount === 1 ? "Entry" : "Entries"} Written`,
    },
  ];
}

function getNextEntryMilestone(entryCount: number) {
  const milestones = [1, 5, 10, 25, 50, 100];

  return (
    milestones.find((milestone) => entryCount < milestone) ??
    Math.ceil((entryCount + 1) / 50) * 50
  );
}

function getJournalingSinceLabel(entries: JournalEntry[], hasHydrated: boolean) {
  if (!hasHydrated) {
    return "Loading journal history...";
  }

  if (entries.length === 0) {
    return "Start your journaling journey 🌸";
  }

  const firstEntry = entries.reduce((earliestEntry, entry) =>
    new Date(entry.createdAt).getTime() <
    new Date(earliestEntry.createdAt).getTime()
      ? entry
      : earliestEntry,
  );
  const firstEntryDate = new Date(firstEntry.createdAt);
  const label = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(firstEntryDate);

  return `Journaling since ${label} 🌸`;
}

function getMostCommonMood(entries: JournalEntry[]) {
  const moodCounts = entries.reduce<Partial<Record<MoodId, number>>>(
    (counts, entry) => {
      if (!entry.mood) {
        return counts;
      }

      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return Object.entries(moodCounts).reduce<MoodId | null>(
    (currentMood, [mood, count]) => {
      if (!currentMood) {
        return mood as MoodId;
      }

      return count > (moodCounts[currentMood] ?? 0)
        ? (mood as MoodId)
        : currentMood;
    },
    null,
  );
}

function getAverageReflectionMinutes(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const totalWords = entries.reduce(
    (sum, entry) => sum + getWordCount(entry.content),
    0,
  );
  const averageWords = totalWords / entries.length;

  return Math.max(1, Math.round(averageWords / 35));
}

function getWordCount(value: string) {
  const words = value.trim().match(/\S+/g);

  return words?.length ?? 0;
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
