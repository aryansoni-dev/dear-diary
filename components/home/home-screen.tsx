import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { ScreenErrorState } from "@/components/states/ScreenErrorState";
import { images } from "@/constants/images";
import { moodOptions } from "@/data/home";
import { useDelayedVisibility } from "@/hooks/useDelayedVisibility";
import { useJournalStore } from "@/store/journal-store";
import type {
  MoodId,
  JournalEntry as StoredJournalEntry,
} from "@/types/journal";

type HomeScreenProps = {
  avatarUrl?: string;
  firstName?: string | null;
};

const colors = {
  primary: "#FF2056",
};

const aiReflectionPrompt = "What made you smile unexpectedly today?";
const journalEditorHref = {
  pathname: "/journal/new",
  params: {
    prompt: aiReflectionPrompt,
    source: "home",
    type: "ai_reflection",
  },
} as Href;

const journalHistoryHref = "/journal-history" as Href;
const morningIntentionPrompt =
  "What is the one thing you'd like to focus on today?";
const morningIntentionHref = {
  pathname: "/journal/new",
  params: {
    prompt: morningIntentionPrompt,
    source: "home",
    type: "morning_intention",
  },
} as Href;

type HomeRecentEntry = {
  backgroundColor: string;
  date: string;
  emoji: string;
  excerpt: string;
  id: string;
  title: string;
};

const moodVisuals: Record<MoodId, { backgroundColor: string; emoji: string }> =
  {
    anxious: { backgroundColor: "#F4EFFA", emoji: "😰" },
    calm: { backgroundColor: "#D8EEDB", emoji: "😌" },
    grateful: { backgroundColor: "#DDEFFF", emoji: "🙏" },
    happy: { backgroundColor: "#FFDDE8", emoji: "😊" },
    motivated: { backgroundColor: "#FFE8D8", emoji: "🔥" },
    sad: { backgroundColor: "#DDEFFF", emoji: "😔" },
  };

const fallbackMoodVisual = {
  backgroundColor: "#F4F4F5",
  emoji: "✍️",
};

export function HomeScreen({ avatarUrl, firstName }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const hydrationError = useJournalStore((state) => state.hydrationError);
  const [selectedMood, setSelectedMood] = useState("Happy");
  const showHydrationState = useDelayedVisibility(!hasHydrated);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const displayName = firstName?.trim() || "Aryan";
  const greeting = useMemo(() => getGreeting(), []);
  const todayLabel = useMemo(() => formatTodayDate(), []);
  const reflectionStreak = useMemo(() => getReflectionStreak(entries), [entries]);
  const morningIntention = useMemo(
    () => getTodayMorningIntention(entries),
    [entries],
  );
  const recentJournalEntries = useMemo(
    () =>
      [...entries]
        .filter((entry) => entry.type !== "morning_intention")
        .sort(
          (entryA, entryB) =>
            new Date(entryB.createdAt).getTime() -
            new Date(entryA.createdAt).getTime(),
        )
        .slice(0, 3)
        .map(toHomeRecentEntry),
    [entries],
  );
  const streakUnit = reflectionStreak === 1 ? "Day" : "Days";
  const streakSubtitle =
    reflectionStreak > 0
      ? "Keep the momentum going"
      : "Start with today's reflection";
  const intentionTitle = morningIntention ? "Today's focus" : "Set your focus";
  const intentionSubtitle = morningIntention
    ? "Keep going... You can do it!"
    : morningIntentionPrompt;
  const intentionBody = !hasHydrated
    ? "Loading intention..."
    : hydrationError
      ? "Saved intention could not be loaded."
    : morningIntention
      ? getEntryPreview(morningIntention)
      : "Tap to write your intention...";

  function retryJournalHydration() {
    useJournalStore.setState({ hasHydrated: false, hydrationError: null });
    void useJournalStore.persist.rehydrate();
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#EFDDFC", "#FFE0EC", "#FFFFFF"]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.58, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          height: 344,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 28,
          paddingHorizontal: 28,
          paddingTop: Math.max(56, insets.top + 20),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-[15px] font-medium leading-5 text-[#71717B]">
              {todayLabel}
            </Text>
            <Text className="text-[28px] font-semibold leading-[38px] tracking-normal text-[#27272A]">
              {greeting},{"\n"}
              {displayName}
            </Text>
          </View>

          <View
            className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white"
            style={{ boxShadow: "0 8px 18px rgba(39, 39, 42, 0.16)" }}
          >
            <Image
              accessibilityLabel={displayName}
              contentFit="cover"
              source={avatarUrl ? { uri: avatarUrl } : images.appLogo}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        </View>

        <View
          className="mb-7 flex-row items-center gap-4 rounded-[20px] bg-[#FFDDE8] px-6 py-5"
          style={{ boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)" }}
        >
          <Text className="text-[31px] leading-9">🔥</Text>
          <View>
            <Text className="text-[17px] font-semibold leading-6 text-[#303039]">
              {reflectionStreak} {streakUnit} Reflection Streak
            </Text>
            <Text className="text-[14px] font-medium leading-5 text-[#71717B]">
              {streakSubtitle}
            </Text>
          </View>
        </View>

        <View
          className="mb-9 rounded-[24px] bg-white px-7 py-8"
          style={{ boxShadow: "0 12px 34px rgba(0, 0, 0, 0.08)" }}
        >
          <View className="mb-5 flex-row items-center gap-3">
            <View className="size-8 items-center justify-center rounded-full bg-white/70">
              <Ionicons
                color={colors.primary}
                name="sparkles-outline"
                size={21}
              />
            </View>
            <Text className="flex-1 text-[13px] font-semibold uppercase leading-5 tracking-normal text-zinc-950/45">
              AI Reflection Prompt
            </Text>
          </View>

          <Text className="mb-6 text-[24px] font-semibold leading-5 text-[#27272A]">
            {aiReflectionPrompt.replace(" unexpectedly", "\nunexpectedly")}
          </Text>

          <Pressable
            accessibilityRole="button"
            className="h-[58px] items-center justify-center rounded-[17px] bg-[#FF2056]"
            onPress={() => router.push(journalEditorHref)}
          >
            <Text className="text-[19px] font-semibold leading-6 text-white">
              Start Writing ✨
            </Text>
          </Pressable>
        </View>

        <View className="mb-9 gap-4">
          <Text className="text-[23px] font-semibold leading-8 text-[#27272A]">
            How are you feeling today?
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {moodOptions.map((mood) => {
              const isSelected = selectedMood === mood.label;

              return (
                <Pressable
                  accessibilityRole="button"
                  className="h-12 flex-row items-center gap-2 rounded-full border px-5"
                  key={mood.label}
                  onPress={() => setSelectedMood(mood.label)}
                  style={{
                    backgroundColor: mood.backgroundColor,
                    borderColor: isSelected ? "#FFA1B9" : "transparent",
                  }}
                >
                  <Text className="text-[18px] leading-6">{mood.emoji}</Text>
                  <Text
                    className="text-[16px] leading-6"
                    style={{
                      color: isSelected ? colors.primary : "#51515B",
                      fontWeight: isSelected ? "600" : "500",
                    }}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mb-9 gap-4">
          <Text className="text-[23px] font-semibold leading-8 text-[#27272A]">
            Morning Intention
          </Text>
          <View
            className="rounded-[24px] bg-[#D8EEDB] px-7 py-7"
            style={{ boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)" }}
          >
            <View className="mb-4 flex-row items-center gap-4">
              <View className="size-12 items-center justify-center rounded-full bg-white/70">
                <Feather name="target" size={19} color="#0F9F7A" />
              </View>
              <Text className="text-[19px] font-semibold leading-7 text-[#303039]">
                {intentionTitle}
              </Text>
            </View>
            <Text className="mb-5 max-w-[286px] text-[17px] leading-6 text-zinc-950/60">
              {intentionSubtitle}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasHydrated }}
              className="min-h-[58px] justify-center rounded-[17px] bg-white/60 px-5"
              onPress={() => {
                if (!hasHydrated) {
                  return;
                }

                if (morningIntention) {
                  router.push({
                    pathname: "/journal/[id]",
                    params: { id: morningIntention.id, source: "home" },
                  });
                  return;
                }

                router.push(morningIntentionHref);
              }}
            >
              <Text
                className="text-[16px] leading-6 text-[#71717B]"
                numberOfLines={3}
              >
                {intentionBody}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-[24px] font-semibold leading-8 text-[#27272A]">
            Recent Entries
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.push(journalHistoryHref)}
          >
            <Text className="text-[16px] font-medium leading-5 text-[#FF2056]">
              See all
            </Text>
          </Pressable>
        </View>

        <View className="gap-5">
          {hydrationError ? (
            <ScreenErrorState
              compact
              error={hydrationError}
              onRetry={retryJournalHydration}
            />
          ) : !hasHydrated ? (
            showHydrationState ? (
              <RecentEntriesEmptyState
                body="Preparing your saved reflections..."
                title="Preparing your journal..."
              />
            ) : null
          ) : recentJournalEntries.length === 0 ? (
            <RecentEntriesEmptyState
              body="Write your first entry and give today a place to live."
              ctaLabel="Write an entry"
              onCtaPress={() => router.push(journalEditorHref)}
              title="Your journal begins here"
            />
          ) : (
            recentJournalEntries.map((entry) => (
              <Pressable
                accessibilityLabel={`Open ${entry.title}`}
                accessibilityRole="button"
                className="rounded-[24px] px-7 py-6"
                key={entry.id}
                onPress={() =>
                  router.push({
                    pathname: "/journal/[id]",
                    params: { id: entry.id, source: "home" },
                  })
                }
                style={{
                  backgroundColor: entry.backgroundColor,
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                }}
              >
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-[14px] font-medium leading-5 text-[#71717B]">
                    {entry.date}
                  </Text>
                  <Text className="text-[31px] leading-5">{entry.emoji}</Text>
                </View>
                <Text className="mb-1 text-[19px] font-semibold leading-5 text-[#303039]">
                  {entry.title}
                </Text>
                <Text
                  className="text-[17px] mt-3 leading-5 text-zinc-950/60"
                  numberOfLines={3}
                >
                  {entry.excerpt}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Today" />
    </View>
  );
}

function RecentEntriesEmptyState({
  body,
  ctaLabel,
  onCtaPress,
  title,
}: {
  body: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  title: string;
}) {
  return (
    <View
      className="rounded-[24px] px-7 py-6"
      style={{
        backgroundColor: "#F4EFFA",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
      }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-[14px] font-medium leading-5 text-[#71717B]">
          Today
        </Text>
        <Text className="text-[31px] leading-9">✍️</Text>
      </View>
      <Text className="mb-1 text-[19px] font-semibold leading-7 text-[#303039]">
        {title}
      </Text>
      <Text className="text-[17px] leading-5 text-zinc-950/60">{body}</Text>
      {ctaLabel && onCtaPress ? (
        <Pressable
          accessibilityRole="button"
          className="mt-5 min-h-[46px] items-center justify-center rounded-full bg-[#FF2056] px-5"
          onPress={onCtaPress}
        >
          <Text className="text-[15px] font-semibold leading-5 text-white">
            {ctaLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function toHomeRecentEntry(entry: StoredJournalEntry): HomeRecentEntry {
  const visual = entry.mood ? moodVisuals[entry.mood] : fallbackMoodVisual;
  const content = entry.content.trim();

  return {
    backgroundColor: visual.backgroundColor,
    date: formatRecentEntryDate(entry.createdAt),
    emoji: visual.emoji,
    excerpt: content || entry.prompt || "No body text yet.",
    id: entry.id,
    title: entry.title,
  };
}

function getTodayMorningIntention(entries: StoredJournalEntry[]) {
  const today = new Date();

  return [...entries]
    .sort(
      (entryA, entryB) =>
        new Date(entryB.createdAt).getTime() -
        new Date(entryA.createdAt).getTime(),
    )
    .find(
      (entry) =>
        entry.type === "morning_intention" &&
        isSameDay(new Date(entry.createdAt), today),
    );
}

function getEntryPreview(entry: StoredJournalEntry) {
  return entry.content.trim() || entry.title || "Open your morning intention...";
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate() {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());
}

function formatRecentEntryDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  }

  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getReflectionStreak(entries: StoredJournalEntry[]) {
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

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}
