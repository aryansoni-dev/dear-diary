import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Plus, Search } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import {
  journalDays,
  journalHistorySections,
  journalMoodFilters,
  type JournalEntry,
} from "@/data/journal-history";

const colors = {
  body: "#71717B",
  muted: "#A1A1AA",
  primary: "#FF2056",
};

const journalEditorHref = "/journal-editor" as Href;

export function JournalHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;

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
          paddingTop: Math.max(56, insets.top + 20),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-3">
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] font-medium uppercase leading-5 tracking-wide text-[#A1A1AA]">
                Your Reflections
              </Text>
              <Text className="text-[30px] font-bold leading-[38px] text-zinc-950">
                My Journal
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Create journal entry"
              accessibilityRole="button"
              className="size-11 items-center justify-center rounded-full bg-white"
              onPress={() => router.push(journalEditorHref)}
              style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.18)" }}
            >
              <Plus size={23} color={colors.primary} strokeWidth={2} />
            </Pressable>
          </View>

          <View
            className="mb-4 h-12 flex-row items-center rounded-[16px] border border-zinc-100 bg-white px-4"
            style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.16)" }}
          >
            <Search size={22} color={colors.muted} strokeWidth={2.2} />
            <TextInput
              accessibilityLabel="Search journal entries"
              className="ml-3 flex-1 text-[15px] leading-5 text-zinc-700"
              placeholder="Search entries, moods, dates..."
              placeholderTextColor={colors.muted}
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
          {journalMoodFilters.map((filter, index) => {
            const isSelected = index === 0;

            return (
              <Pressable
                accessibilityRole="button"
                className="h-9 shrink-0 flex-row items-center justify-center rounded-full px-4"
                key={filter.label}
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
                    color: isSelected ? "white" : "#3F3F46",
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
                backgroundColor: day.isSelected ? colors.primary : "white",
                boxShadow: day.isSelected
                  ? "0 4px 12px rgba(255, 32, 86, 0.26)"
                  : "0 2px 7px rgba(39, 39, 42, 0.13)",
              }}
            >
              <Text
                className="text-[11px] font-medium leading-4"
                style={{
                  color: day.isSelected ? "rgba(255,255,255,0.8)" : colors.muted,
                }}
              >
                {day.day}
              </Text>
              <Text
                className="text-[18px] font-bold leading-6"
                style={{
                  color: day.isSelected ? "white" : "#3F3F46",
                }}
              >
                {day.date}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View className="gap-4 px-6 pt-5">
          {journalHistorySections.map((section) => (
            <View className="gap-4" key={section.title}>
              <SectionHeader title={section.title} />
              {section.entries.map((entry, index) => (
                <TimelineEntry
                  entry={entry}
                  isLastEntry={
                    section.title ===
                      journalHistorySections[journalHistorySections.length - 1]
                        .title && index === section.entries.length - 1
                  }
                  key={entry.title}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="History" />
    </View>
  );
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
}: {
  entry: JournalEntry;
  isLastEntry: boolean;
}) {
  return (
    <View className="relative pl-6">
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
          className="mt-2 text-[14px] leading-[24px] text-zinc-500"
          numberOfLines={2}
        >
          {entry.excerpt}
        </Text>
      </View>
    </View>
  );
}
