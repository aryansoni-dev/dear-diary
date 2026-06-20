import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Plus, Search } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HistoryViewToggle } from "@/components/journal-history/history-view-toggle";
import { JournalCalendarView } from "@/components/journal-history/journal-calendar-view";
import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { TabScreenHeader } from "@/components/ui/tab-screen-header";
import {
  fallbackMoodMetadata,
  moodLabels,
  moodMetadata,
} from "@/constants/moods";
import { journalMoodFilters } from "@/data/journal-history";
import { formatTagLabel } from "@/lib/tags";
import { useJournalStore } from "@/store/journal-store";
import type {
  MoodId,
  JournalEntry as StoredJournalEntry,
} from "@/types/journal";
import type { JournalHistoryViewMode } from "@/types/journalCalendar";

const colors = {
  muted: "#A1A1AA",
  primary: "#FF2056",
  selectedText: "#FFFFFF",
  text: "#3F3F46",
  textOnPrimaryMuted: "rgba(255,255,255,0.8)",
} as const;

type MoodFilterId = MoodId | "all";

type TimelineJournalEntry = {
  dotColor: string;
  emoji: string;
  emojiBackgroundColor: string;
  excerpt: string;
  id: string;
  markerBackgroundColor: string;
  tags: string[];
  time: string;
  title: string;
};

type JournalHistorySection = {
  entries: TimelineJournalEntry[];
  title: string;
};

type JournalDay = {
  date: string;
  day: string;
  isSelected: boolean;
};

const newJournalEntryHref = {
  pathname: "/journal/new",
  params: { source: "history" },
} as Href;

export function JournalHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const entries = useJournalStore((state) => state.entries);
  const activeUserId = useJournalStore((state) => state.activeUserId);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodFilterId>("all");
  const [viewMode, setViewMode] = useState<JournalHistoryViewMode>("list");
  const [slideDirection, setSlideDirection] = useState(1);
  const contentSlideAnimation = useRef(new Animated.Value(1)).current;
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const journalDays = useMemo(() => getRecentJournalDays(), []);
  const contentTranslateX = contentSlideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [slideDirection * 28, 0],
  });
  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedTagQuery = normalizedQuery.replace(/^#/, "");

    return entries
      .filter((entry) => {
        const moodLabel = entry.mood ? moodLabels[entry.mood] : "";
        const matchesMood =
          selectedMood === "all" || entry.mood === selectedMood;
        const matchesSearch =
          normalizedQuery.length === 0 ||
          [entry.title, entry.content, moodLabel, formatEntryDate(entry.createdAt)]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery) ||
          (normalizedTagQuery.length > 0 &&
            (entry.tags ?? []).some((tag) =>
              tag.toLowerCase().includes(normalizedTagQuery),
            ));

        return matchesMood && matchesSearch;
      })
      .sort(
        (entryA, entryB) =>
          new Date(entryB.createdAt).getTime() -
          new Date(entryA.createdAt).getTime(),
      );
  }, [entries, searchQuery, selectedMood]);
  const journalSections = useMemo(
    () => groupJournalEntries(filteredEntries),
    [filteredEntries],
  );
  const handleViewModeChange = (nextViewMode: JournalHistoryViewMode) => {
    if (nextViewMode === viewMode) {
      return;
    }

    setSlideDirection(nextViewMode === "calendar" ? 1 : -1);
    setViewMode(nextViewMode);
  };

  useEffect(() => {
    contentSlideAnimation.stopAnimation();
    contentSlideAnimation.setValue(0);
    const animation = Animated.timing(contentSlideAnimation, {
      duration: 230,
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        contentSlideAnimation.setValue(1);
      }
    });

    return () => animation.stop();
  }, [contentSlideAnimation, slideDirection, viewMode]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#FAF7F2", "#FBF6FA", "#FAF7F2"]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.45, 1]}
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
          paddingBottom: bottomNavHeight + 30,
          paddingTop: Math.max(92, insets.top + 44),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-3">
          <TabScreenHeader
            eyebrow="Your Reflections"
            rightAccessory={
              <AnimatedIconButton
                accessibilityLabel="Create journal entry"
                onPress={() => router.push(newJournalEntryHref)}
                shadow="0 2px 7px rgba(39, 39, 42, 0.18)"
              >
                <Plus size={23} color={colors.primary} strokeWidth={2} />
              </AnimatedIconButton>
            }
            subtitle="Search and revisit your entries"
            title="My Journal"
          />

          <HistoryViewToggle value={viewMode} onChange={handleViewModeChange} />
        </View>

        <Animated.View
          collapsable={false}
          style={{
            transform: [{ translateX: contentTranslateX }],
          }}
        >
          {viewMode === "list" ? (
            <>
            <View className="px-6 pb-3">
              <View
                className="mb-4 mt-6 h-12 flex-row items-center rounded-[16px] border border-zinc-100 bg-white px-4"
                style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.16)" }}
              >
                <Search size={22} color={colors.muted} strokeWidth={2.2} />
                <TextInput
                  accessibilityLabel="Search journal entries"
                  className="ml-3 flex-1 text-[15px] leading-5 text-zinc-700"
                  onChangeText={setSearchQuery}
                  placeholder="Search entries, moods, tags..."
                  placeholderTextColor={colors.muted}
                  value={searchQuery}
                />
              </View>
            </View>

            <ScrollView
              className="pb-1"
              contentContainerStyle={{
                gap: 8,
                paddingHorizontal: 24,
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {journalMoodFilters.map((filter) => {
                const isSelected = selectedMood === filter.id;

                return (
                  <Pressable
                    accessibilityRole="button"
                    className="h-9 shrink-0 flex-row items-center justify-center rounded-full px-4"
                    key={filter.label}
                    onPress={() => setSelectedMood(filter.id)}
                    style={{
                      backgroundColor: filter.backgroundColor,
                      boxShadow: isSelected
                        ? "0 2px 7px rgba(255, 32, 86, 0.24)"
                        : undefined,
                    }}
                  >
                    <Text
                      className="text-[14px] leading-5"
                      style={{
                        color: isSelected ? colors.selectedText : colors.text,
                        fontWeight: isSelected ? "700" : "500",
                      }}
                    >
                      {filter.emoji ? `${filter.emoji} ` : ""}
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView
              className="pb-1 pt-6"
              contentContainerStyle={{
                gap: 12,
                paddingHorizontal: 24,
              }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {journalDays.map((day) => (
                <View
                  className="h-17 w-15 shrink-0 items-center justify-center gap-1 rounded-[16px]"
                  key={day.date}
                  style={{
                    backgroundColor: day.isSelected
                      ? colors.primary
                      : colors.selectedText,
                    boxShadow: day.isSelected
                      ? "0 4px 12px rgba(255, 32, 86, 0.26)"
                      : "0 2px 7px rgba(39, 39, 42, 0.13)",
                  }}
                >
                  <Text
                    className="text-[11px] font-medium leading-4"
                    style={{
                      color: day.isSelected
                        ? colors.textOnPrimaryMuted
                        : colors.muted,
                    }}
                  >
                    {day.day}
                  </Text>
                  <Text
                    className="text-[18px] font-bold leading-5"
                    style={{
                      color: day.isSelected ? colors.selectedText : colors.text,
                    }}
                  >
                    {day.date}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View className="gap-4 px-6 pt-5">
              {!hasHydrated ? (
                <EmptyHistoryMessage title="Loading your journal..." />
              ) : journalSections.length === 0 ? (
                <EmptyHistoryMessage
                  body={
                    searchQuery.trim().length > 0 || selectedMood !== "all"
                      ? "Try a different search or mood filter."
                      : "Create your first reflection to see it here."
                  }
                  ctaLabel={
                    searchQuery.trim().length > 0 || selectedMood !== "all"
                      ? undefined
                      : "Create Entry"
                  }
                  onCtaPress={
                    searchQuery.trim().length > 0 || selectedMood !== "all"
                      ? undefined
                      : () => router.push(newJournalEntryHref)
                  }
                  title={
                    searchQuery.trim().length > 0 || selectedMood !== "all"
                      ? "No matching entries"
                      : "No journal entries yet"
                  }
                />
              ) : (
                journalSections.map((section, sectionIndex) => (
                  <View className="gap-4" key={section.title}>
                    <SectionHeader title={section.title} />
                    {section.entries.map((entry, entryIndex) => (
                      <TimelineEntry
                        entry={entry}
                        isLastEntry={
                          sectionIndex === journalSections.length - 1 &&
                          entryIndex === section.entries.length - 1
                        }
                        key={entry.id}
                        onPress={() =>
                          router.push({
                            pathname: "/journal/[id]",
                            params: { id: entry.id, source: "history" },
                          })
                        }
                      />
                    ))}
                  </View>
                ))
              )}
            </View>
            </>
          ) : (
            <JournalCalendarView
              currentUserId={activeUserId}
              entries={entries}
              hasHydrated={hasHydrated}
              renderSelectedEntries={(day) => (
                <View className="gap-4">
                  {day.entries.map((entry, entryIndex) => (
                    <TimelineEntry
                      entry={toTimelineEntry(entry)}
                      isLastEntry={entryIndex === day.entries.length - 1}
                      key={entry.id}
                      onPress={() =>
                        router.push({
                          pathname: "/journal/[id]",
                          params: { id: entry.id, source: "history" },
                        })
                      }
                    />
                  ))}
                </View>
              )}
            />
          )}
        </Animated.View>
      </ScrollView>

      <BottomTabBar activeTab="History" />
    </View>
  );
}

function EmptyHistoryMessage({
  body,
  ctaLabel,
  onCtaPress,
  title,
}: {
  body?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  title: string;
}) {
  return (
    <View
      className="items-center rounded-[24px] border border-zinc-100 bg-white px-6 py-8"
      style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.1)" }}
    >
      <Text className="text-center text-[18px] font-semibold leading-6 text-zinc-900">
        {title}
      </Text>
      {body ? (
        <Text className="mt-2 text-center text-[14px] leading-6 text-zinc-500">
          {body}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Pressable
          accessibilityRole="button"
          className="mt-5 h-11 items-center justify-center rounded-full bg-[#FF2056] px-5"
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

function groupJournalEntries(
  entries: StoredJournalEntry[],
): JournalHistorySection[] {
  return entries.reduce<JournalHistorySection[]>((sections, entry) => {
    const sectionTitle = getSectionTitle(entry.createdAt);
    const existingSection = sections.find(
      (section) => section.title === sectionTitle,
    );
    const timelineEntry = toTimelineEntry(entry);

    if (existingSection) {
      existingSection.entries.push(timelineEntry);
      return sections;
    }

    sections.push({
      entries: [timelineEntry],
      title: sectionTitle,
    });

    return sections;
  }, []);
}

function toTimelineEntry(entry: StoredJournalEntry): TimelineJournalEntry {
  const visual = entry.mood ? moodMetadata[entry.mood] : fallbackMoodMetadata;

  return {
    dotColor: visual.dotColor,
    emoji: visual.emoji,
    emojiBackgroundColor: visual.backgroundColor,
    excerpt: entry.content || "No body text yet.",
    id: entry.id,
    markerBackgroundColor: visual.markerBackgroundColor,
    tags: entry.tags ?? [],
    time: `${formatEntryDate(entry.createdAt)} · ${formatEntryTime(
      entry.createdAt,
    )}`,
    title: entry.title,
  };
}

function getSectionTitle(value: string) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "TODAY";
  }

  if (isSameDay(date, yesterday)) {
    return "YESTERDAY";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  })
    .format(date)
    .toUpperCase();
}

function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    weekday: "short",
  }).format(new Date(value));
}

function formatEntryTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function getRecentJournalDays(): JournalDay[] {
  const today = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - (5 - index));

    return {
      date: new Intl.DateTimeFormat("en-US", { day: "numeric" }).format(date),
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      isSelected: isSameDay(date, today),
    };
  });
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="mt-1 flex-row items-center gap-2">
      <Text className="shrink-0 pl-0.5 text-[13px] font-semibold uppercase leading-5 tracking-wide text-[#A1A1AA]">
        {title}
      </Text>
      <View className="h-px flex-1 bg-zinc-200" />
    </View>
  );
}

function TimelineEntry({
  entry,
  isLastEntry,
  onPress,
}: {
  entry: TimelineJournalEntry;
  isLastEntry: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`Open ${entry.title}`}
      accessibilityRole="button"
      className="relative pl-6"
      onPress={onPress}
    >
      <View
        className="absolute left-[5px] top-2 w-px bg-zinc-200"
        style={isLastEntry ? { height: 12 } : { bottom: 0 }}
      />
      <View
        className="absolute size-[19px] items-center justify-center rounded-full"
        style={{
          backgroundColor: entry.markerBackgroundColor,
          left: -4,
          top: 4,
        }}
      >
        <View
          className="size-[11px] rounded-full"
          style={{ backgroundColor: entry.dotColor }}
        />
      </View>

      <View
        className="rounded-[24px] border border-zinc-100 bg-white p-5"
        style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.12)" }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <Text
            className="flex-1 text-[12px] font-medium leading-5 text-[#A1A1AA]"
            numberOfLines={1}
          >
            {entry.time}
          </Text>
          <View
            className="size-9 items-center justify-center rounded-full"
            style={{ backgroundColor: entry.emojiBackgroundColor }}
          >
            <Text className="text-[16px] leading-5">{entry.emoji}</Text>
          </View>
        </View>

        <Text className="mt-3 text-[17px] font-semibold leading-6 text-zinc-900">
          {entry.title}
        </Text>
        <Text
          className="mt-2 text-[15px] leading-[24px] text-zinc-500"
          numberOfLines={2}
        >
          {entry.excerpt}
        </Text>
        {entry.tags.length > 0 ? (
          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {entry.tags.slice(0, 3).map((tag) => (
              <View
                className="h-7 items-center justify-center rounded-full bg-[#FFF1F5] px-2.5"
                key={tag}
              >
                <Text
                  className="text-[13px] font-semibold leading-5"
                  style={{ color: colors.primary }}
                >
                  {formatTagLabel(tag)}
                </Text>
              </View>
            ))}
            {entry.tags.length > 3 ? (
              <View className="h-7 items-center justify-center rounded-full bg-zinc-100 px-2.5">
                <Text className="text-[13px] font-semibold leading-5 text-zinc-500">
                  +{entry.tags.length - 3}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
