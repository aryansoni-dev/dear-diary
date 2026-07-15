import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeMoodCheckInCard } from "@/components/home/mood/HomeMoodCheckInCard";
import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { ScreenErrorState } from "@/components/states/ScreenErrorState";
import { ScenicCardBackground } from "@/components/ui/scenic-card-background";
import { images } from "@/constants/images";
import { fallbackMoodMetadata, moodMetadata } from "@/constants/moods";
import { useDailyReflectionPrompt } from "@/hooks/useDailyReflectionPrompt";
import { useDelayedVisibility } from "@/hooks/useDelayedVisibility";
import { useReflectionClock } from "@/hooks/useReflectionClock";
import {
  getLocalDateKey,
  hasAnsweredReflectionPrompt,
} from "@/lib/reflection-prompts/dailyReflectionPrompts";
import {
  retryJournalStoreHydration,
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import type {
  EntryType,
  JournalEntry as StoredJournalEntry,
} from "@/types/journal";

type HomeScreenProps = {
  avatarUrl?: string;
  firstName?: string | null;
};

const colors = {
  primary: "#FF2056",
};
const homeScenicCardAspectRatio = 1.6;

type GreetingPeriod = "evening" | "morning" | "noon";

const greetingBackgrounds = {
  evening: images.eveningCard,
  morning: images.morningCard,
  noon: images.noon,
} as const;

const entryTypeMetadata: Record<
  EntryType,
  { color: string; icon: string; label: string }
> = {
  ai_reflection: {
    color: "#A3B31E",
    icon: "✨",
    label: "AI prompt",
  },
  daily_prompt: {
    color: "#7C9FD9",
    icon: "💭",
    label: "Daily prompt",
  },
  evening_reflection: {
    color: "#7C9FD9",
    icon: "🌙",
    label: "Evening reflection",
  },
  free_write: {
    color: "#71717B",
    icon: "✍️",
    label: "Journal entry",
  },
  gratitude: {
    color: "#FF8A3D",
    icon: "🙏",
    label: "Gratitude",
  },
  morning_intention: {
    color: "#FFB02E",
    icon: "☀️",
    label: "Morning intention",
  },
};

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
  borderColor: string;
  date: string;
  emoji: string;
  excerpt: string;
  id: string;
  moodColor: string;
  moodLabel: string;
  title: string;
  typeColor: string;
  typeIcon: string;
  typeLabel: string;
};

export function HomeScreen({ avatarUrl, firstName }: HomeScreenProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const hydrationError = useJournalHydrationStore(
    (state) => state.hydrationError,
  );
  const showHydrationState = useDelayedVisibility(!hasHydrated);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const topBackgroundHeight = Math.max(188, insets.top + 148);
  const homeCardWidth = Math.max(width - 56, 0);
  const reflectionCardMinHeight = homeCardWidth / homeScenicCardAspectRatio;
  const currentTime = useReflectionClock();
  const dailyReflection = useDailyReflectionPrompt(currentTime);
  const reflectionPrompt = dailyReflection.prompt;
  const reflectionCardText =
    reflectionPrompt ?? "Preparing a thoughtful question for today...";
  const hasAnsweredCurrentReflection = useMemo(
    () =>
      hasAnsweredReflectionPrompt({
        date: currentTime,
        entries,
        prompt: reflectionPrompt,
      }),
    [currentTime, entries, reflectionPrompt],
  );
  const shouldShowReflectionCard =
    hasHydrated && !hydrationError && !hasAnsweredCurrentReflection;
  const displayName = firstName?.trim() || "";
  const greeting = useMemo(() => getGreeting(currentTime), [currentTime]);
  const greetingBackground = greetingBackgrounds[greeting.period];
  const todayLabel = useMemo(() => formatTodayDate(currentTime), [currentTime]);
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
    retryJournalStoreHydration();
  }

  function openDailyReflection() {
    if (!reflectionPrompt) {
      router.push({
        pathname: "/journal/new",
        params: { source: "home" },
      });
      return;
    }

    router.push({
      pathname: "/journal/new",
      params: {
        prompt: reflectionPrompt,
        source: "home",
        type: "ai_reflection",
      },
    });
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <Image
        contentFit="cover"
        pointerEvents="none"
        source={greetingBackground}
        style={{
          height: topBackgroundHeight,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0.02)",
          "rgba(255, 224, 236, 0.16)",
          "rgba(255, 255, 255, 0.76)",
          "#FFFFFF",
        ]}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.64, 0.9, 1]}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={{
          height: topBackgroundHeight,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        testID="home-screen"
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
            <Text className="text-[15px] font-medium leading-6 text-[#71717B]">
              {todayLabel}
            </Text>
            <Text className="text-[28px] font-semibold leading-[38px] tracking-normal text-[#27272A]">
              {displayName ? `${greeting.label},\n${displayName}` : greeting.label}
            </Text>
          </View>

          <View
            className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white"
            style={{ boxShadow: "0 8px 18px rgba(39, 39, 42, 0.16)" }}
          >
            <Image
              accessibilityLabel={displayName || "Profile avatar"}
              contentFit="cover"
              source={avatarUrl ? { uri: avatarUrl } : images.appLogo}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        </View>

        <View
          testID="home-writing-streak-card"
          className="mb-7 flex-row items-center gap-4 rounded-[20px] bg-white px-6 py-5"
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

        {shouldShowReflectionCard ? (
          <View
            testID="home-ai-prompt-card"
            className="mb-9 w-full overflow-hidden rounded-[30px] border-[6px] border-white/80 bg-[#F9E2EC]"
            style={{
              boxShadow: "0 20px 48px -22px rgba(190, 80, 125, 0.5)",
              minHeight: reflectionCardMinHeight,
            }}
          >
            <ScenicCardBackground cardWidth={homeCardWidth} variant="ai" />

            <View
              className="px-5 py-5"
              style={{ minHeight: Math.max(reflectionCardMinHeight - 12, 0) }}
            >
              <View className="mb-3 flex-row items-center gap-3">
                <View className="size-8 items-center justify-center rounded-full bg-white/70">
                  <Ionicons
                    color={colors.primary}
                    name="sparkles-outline"
                    size={21}
                  />
                </View>
                <Text className="flex-1 text-[13px] font-semibold uppercase leading-6 tracking-normal text-zinc-950/45">
                  AI Reflection Prompt
                </Text>
              </View>

              <Text
                testID="home-ai-prompt-text"
                className="mb-3 text-[21px] font-semibold leading-6 text-[#27272A]"
              >
                {reflectionCardText}
              </Text>

              <Pressable
                testID="home-ai-prompt-open-button"
                accessibilityLabel={
                  reflectionPrompt
                    ? `Start writing about: ${reflectionPrompt}`
                    : "Start writing a journal entry"
                }
                accessibilityRole="button"
                className="mt-auto h-12 items-center justify-center rounded-[17px] bg-[#FF2056]"
                onPress={openDailyReflection}
              >
                <Text className="text-[19px] font-semibold leading-6 text-white">
                  Start Writing ✨
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <HomeMoodCheckInCard />

        <View className="mb-9 gap-4">
          <Text className="text-[23px] font-semibold leading-8 text-[#27272A]">
            Morning Intention
          </Text>
          <View
            testID="home-morning-intention-card"
            className="w-full overflow-hidden rounded-[30px] border-[6px] border-white/80 bg-[#E8F4E3]"
            style={{
              aspectRatio: homeScenicCardAspectRatio,
              boxShadow: "0 20px 48px -22px rgba(61, 162, 104, 0.42)",
            }}
          >
            <ScenicCardBackground cardWidth={homeCardWidth} variant="morning" />

            <View className="h-full px-5 py-5">
              <View className="mb-2 flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-full bg-white/75">
                  <Feather name="target" size={19} color="#0F9F7A" />
                </View>
                <Text className="text-[18px] font-semibold leading-6 text-[#303039]">
                  {intentionTitle}
                </Text>
              </View>
              <Text
                className="mb-2 max-w-[286px] text-[16px] leading-6 text-zinc-950/60"
                numberOfLines={2}
              >
                {intentionSubtitle}
              </Text>
              <Pressable
                testID="home-morning-intention-open-button"
                accessibilityLabel={
                  morningIntention
                    ? "Open morning intention"
                    : "Write morning intention"
                }
                accessibilityRole="button"
                accessibilityState={{ disabled: !hasHydrated }}
                className="mt-auto h-[52px] justify-center rounded-[17px] bg-white/70 px-4"
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
                  numberOfLines={2}
                >
                  {intentionBody}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View
          testID="home-recent-entries-section"
          className="mb-5 flex-row items-center justify-between"
        >
          <Text className="text-[24px] font-semibold leading-8 text-[#27272A]">
            Recent Entries
          </Text>
          <Pressable
            testID="home-recent-entries-see-all-button"
            accessibilityLabel="See all recent entries"
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
              onCtaPress={openDailyReflection}
              title="Your journal begins here"
            />
          ) : (
            recentJournalEntries.map((entry) => (
              <Pressable
                testID={`home-recent-entry-card-${entry.id}`}
                accessibilityLabel="Open recent journal entry"
                accessibilityRole="button"
                className="rounded-[24px] border bg-white px-5 py-5"
                key={entry.id}
                onPress={() =>
                  router.push({
                    pathname: "/journal/[id]",
                    params: { id: entry.id, source: "home" },
                  })
                }
                style={{
                  borderColor: entry.borderColor,
                  boxShadow: "0 14px 34px rgba(39, 39, 42, 0.06)",
                }}
              >
                <View className="mb-5 flex-row items-center justify-between gap-4">
                  <View
                    className="min-h-11 flex-row items-center gap-2 rounded-[15px] px-3"
                    style={{ backgroundColor: entry.backgroundColor }}
                  >
                    <Text className="text-[20px] leading-6">{entry.emoji}</Text>
                    <Text
                      className="text-[17px] font-semibold leading-6"
                      style={{ color: entry.moodColor }}
                    >
                      {entry.moodLabel}
                    </Text>
                  </View>

                  <Text className="text-[16px] font-medium leading-6 text-[#71717B]">
                    {entry.date}
                  </Text>
                </View>

                <Text
                  className="text-[21px] font-semibold leading-6 text-[#27272A]"
                  numberOfLines={2}
                >
                  {entry.title}
                </Text>
                <Text
                  className="mt-4 text-[17px] leading-6 text-[#71717B]"
                  numberOfLines={3}
                >
                  {entry.excerpt}
                </Text>

                <View className="my-5 h-px bg-[#E9E4E6]" />

                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-3">
                    <Text
                      className="text-[22px] leading-6"
                      style={{ color: entry.typeColor }}
                    >
                      {entry.typeIcon}
                    </Text>
                    <Text className="flex-1 text-[17px] leading-6 text-[#71717B]">
                      {entry.typeLabel}
                    </Text>
                  </View>

                  <Ionicons
                    color="#71717B"
                    name="chevron-forward"
                    size={24}
                  />
                </View>
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
          testID="home-empty-entry-open-button"
          accessibilityLabel={ctaLabel}
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
  const visual = entry.mood ? moodMetadata[entry.mood] : fallbackMoodMetadata;
  const content = entry.content.trim();
  const entryType = entryTypeMetadata[entry.type];

  return {
    backgroundColor: visual.backgroundColor,
    borderColor: visual.backgroundColor,
    date: formatRecentEntryDate(entry.createdAt),
    emoji: visual.emoji,
    excerpt: content || entry.prompt || "No body text yet.",
    id: entry.id,
    moodColor: visual.dotColor,
    moodLabel: visual.label,
    title: entry.title,
    typeColor: entryType.color,
    typeIcon: entryType.icon,
    typeLabel: entryType.label,
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

function getGreeting(date: Date): { label: string; period: GreetingPeriod } {
  const hour = date.getHours();

  if (hour < 12) {
    return { label: "Good Morning", period: "morning" };
  }

  if (hour < 17) {
    return { label: "Good Afternoon", period: "noon" };
  }

  return { label: "Good Evening", period: "evening" };
}

function formatTodayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(date);
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
