import {
  Check,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sunrise,
} from "lucide-react-native";
import { type ReactNode, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import {
  fallbackMoodMetadata,
  moodMetadata,
} from "@/constants/moods";
import { buildJournalCalendarMonth } from "@/lib/calendar/buildJournalCalendarMonth";
import {
  addCalendarMonths,
  createLocalDateKey,
  formatSelectedDate,
} from "@/lib/calendar/dateUtils";
import type { JournalEntry } from "@/types/journal";
import type { CalendarDayStatus } from "@/types/journalCalendar";

const colors = {
  muted: "#A1A1AA",
  primary: "#FF2056",
  text: "#27272A",
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const activityHeatmapLevels = [
  { backgroundColor: "#FFFFFF", borderColor: "#E4E4E7", label: "0" },
  { backgroundColor: "#FFF1F5", borderColor: "#FFD4E1", label: "1" },
  { backgroundColor: "#FFDDE8", borderColor: "#FFB7CC", label: "2" },
  { backgroundColor: "#FF9FBC", borderColor: "#FF6F9A", label: "3+" },
] as const;

export function JournalCalendarView({
  currentUserId,
  entries,
  hasHydrated,
  renderSelectedEntries,
}: {
  currentUserId: string | null;
  entries: JournalEntry[];
  hasHydrated: boolean;
  renderSelectedEntries: (day: CalendarDayStatus) => ReactNode;
}) {
  const today = useMemo(() => new Date(), []);
  const todayButtonScale = useRef(new Animated.Value(1)).current;
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    createLocalDateKey(today),
  );
  const calendarMonth = useMemo(
    () =>
      buildJournalCalendarMonth({
        currentUserId: currentUserId ?? "",
        entries,
        now: today,
        visibleMonth,
      }),
    [currentUserId, entries, today, visibleMonth],
  );
  const selectedDay =
    calendarMonth.days.find((day) => day.dateKey === selectedDateKey) ??
    calendarMonth.days.find((day) => day.isCurrentMonth) ??
    calendarMonth.days[0];

  const changeMonth = (amount: number) => {
    const nextMonth = addCalendarMonths(visibleMonth, amount);

    setVisibleMonth(nextMonth);
    setSelectedDateKey(createLocalDateKey(nextMonth));
  };

  const goToToday = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateKey(createLocalDateKey(today));
  };

  const handleTodayPressIn = () => {
    Animated.spring(todayButtonScale, {
      friction: 7,
      tension: 180,
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleTodayPressOut = () => {
    Animated.spring(todayButtonScale, {
      friction: 6,
      tension: 140,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (!hasHydrated) {
    return (
      <View className="px-6 pt-5">
        <CalendarEmptyState title="Loading your calendar..." />
      </View>
    );
  }

  return (
    <View className="gap-5 px-6 pt-5">
      <View
        className="rounded-[24px] border border-zinc-100 bg-white p-4"
        style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.12)" }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            accessibilityLabel="Show previous month"
            accessibilityRole="button"
            className="size-10 items-center justify-center rounded-full bg-zinc-50"
            onPress={() => changeMonth(-1)}
          >
            <ChevronLeft color={colors.text} size={21} strokeWidth={2.3} />
          </Pressable>

          <View className="flex-1 items-center">
            <Text className="text-center text-[18px] font-bold leading-6 text-zinc-900">
              {calendarMonth.label}
            </Text>
            <Text className="mt-0.5 text-center text-[12px] font-medium leading-4 text-zinc-500">
              {calendarMonth.totalEntries}{" "}
              {calendarMonth.totalEntries === 1 ? "entry" : "entries"} across{" "}
              {calendarMonth.activeDays}{" "}
              {calendarMonth.activeDays === 1 ? "day" : "days"}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Show next month"
            accessibilityRole="button"
            className="size-10 items-center justify-center rounded-full bg-zinc-50"
            onPress={() => changeMonth(1)}
          >
            <ChevronRight color={colors.text} size={21} strokeWidth={2.3} />
          </Pressable>
        </View>

        <Animated.View
          className="mt-4"
          style={{ transform: [{ scale: todayButtonScale }] }}
        >
          <Pressable
            accessibilityRole="button"
            className="h-10 items-center justify-center rounded-full bg-[#FFF1F5] px-4"
            onPress={goToToday}
            onPressIn={handleTodayPressIn}
            onPressOut={handleTodayPressOut}
          >
            <Text className="text-[14px] font-bold leading-5 text-[#FF2056]">
              Today
            </Text>
          </Pressable>
        </Animated.View>

        <View className="mt-5 flex-row">
          {weekDays.map((day) => (
            <Text
              className="flex-1 text-center text-[11px] font-bold uppercase leading-4 text-zinc-400"
              key={day}
            >
              {day}
            </Text>
          ))}
        </View>

        <View className="mt-2 flex-row flex-wrap">
          {calendarMonth.days.map((day) => (
            <CalendarDayCell
              day={day}
              isSelected={selectedDay.dateKey === day.dateKey}
              key={day.dateKey}
              onPress={() => setSelectedDateKey(day.dateKey)}
            />
          ))}
        </View>
      </View>

      <MoodLegend days={calendarMonth.days.filter((day) => day.isCurrentMonth)} />

      <SelectedDaySummary day={selectedDay} />

      <View className="gap-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="text-[18px] font-bold leading-6 text-zinc-900">
            Entries from this date
          </Text>
          <Text className="text-[16px] font-semibold leading-6 text-zinc-500">
            {selectedDay.entryCount}
          </Text>
        </View>
        {selectedDay.entryCount > 0 ? (
          renderSelectedEntries(selectedDay)
        ) : (
          <CalendarEmptyState
            body="No reflections were saved on this date."
            title="Nothing written here yet."
          />
        )}
      </View>
    </View>
  );
}

function CalendarDayCell({
  day,
  isSelected,
  onPress,
}: {
  day: CalendarDayStatus;
  isSelected: boolean;
  onPress: () => void;
}) {
  const mood = day.dominantMood ? moodMetadata[day.dominantMood] : null;
  const hasActivity = day.entryCount > 0;
  const cellBackgroundColor = isSelected
    ? colors.primary
    : getActivityHeatmapColor(day.entryCount);
  const textColor = isSelected
    ? "white"
    : day.isCurrentMonth
      ? colors.text
      : "#A1A1AA";
  const moodBadgeBackgroundColor = isSelected
    ? "rgba(255,255,255,0.2)"
    : mood?.backgroundColor ?? fallbackMoodMetadata.backgroundColor;

  return (
    <View className="w-[14.285%] p-0.5">
      <Pressable
        accessibilityLabel={getDayAccessibilityLabel(day)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        className="min-h-[68px] items-center justify-between rounded-[14px] border px-1 py-1.5"
        onPress={onPress}
        style={{
          backgroundColor: cellBackgroundColor,
          borderColor: isSelected
            ? colors.primary
            : day.isToday
              ? colors.primary
              : getActivityHeatmapBorderColor(day.entryCount),
          opacity: day.isCurrentMonth ? 1 : 0.52,
        }}
      >
        <Text
          className="text-[12px] font-bold leading-5"
          style={{ color: textColor }}
        >
          {day.date.getDate()}
        </Text>

        {hasActivity ? (
          <View className="items-center gap-0.5">
            <View
              className="size-6 items-center justify-center rounded-full"
              style={{ backgroundColor: moodBadgeBackgroundColor }}
            >
              <Text className="text-[13px] leading-4">
                {mood?.emoji ?? fallbackMoodMetadata.emoji}
              </Text>
            </View>
            <Text
              className="text-[10px] font-bold leading-3"
              style={{ color: isSelected ? "white" : "#52525B" }}
            >
              {day.entryCount}
            </Text>
          </View>
        ) : (
          <View className="h-6" />
        )}

        <View className="h-3 flex-row items-center justify-center gap-0.5">
          {day.hasMorningIntention ? (
            <Text
              className="text-[8px] font-black leading-3"
              style={{ color: isSelected ? "white" : colors.primary }}
            >
              M
            </Text>
          ) : null}
          {day.hasEveningReflection ? (
            <Text
              className="text-[8px] font-black leading-3"
              style={{ color: isSelected ? "white" : "#7C3AED" }}
            >
              E
            </Text>
          ) : null}
          {day.hasEntriesWithoutMood ? (
            <Text
              className="text-[8px] font-black leading-3"
              style={{ color: isSelected ? "white" : "#71717A" }}
            >
              -
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

function MoodLegend({ days }: { days: CalendarDayStatus[] }) {
  const moodsPresent = Array.from(
    new Set(days.flatMap((day) => (day.dominantMood ? [day.dominantMood] : []))),
  );
  const hasEntriesWithoutMood = days.some((day) => day.hasEntriesWithoutMood);

  return (
    <View
      className="rounded-[24px] border border-zinc-100 bg-white p-4"
      style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.1)" }}
    >
      <Text className="text-[16px] font-bold leading-5 text-zinc-900">
        Mood and activity legend
      </Text>
      <View className="mt-3 gap-3">
        <View className="gap-2">
          <Text className="text-[12px] font-bold uppercase leading-4 text-zinc-400">
            Activity heatmap
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {activityHeatmapLevels.map((level) => (
              <ActivityLegendPill
                backgroundColor={level.backgroundColor}
                borderColor={level.borderColor}
                key={level.label}
                label={level.label}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-[12px] font-bold uppercase leading-4 text-zinc-400">
            Mood and markers
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {moodsPresent.length > 0 ? (
              moodsPresent.map((moodId) => {
                const mood = moodMetadata[moodId];

                return (
                  <LegendPill
                    backgroundColor={mood.backgroundColor}
                    key={mood.id}
                    label={`${mood.emoji} ${mood.label}`}
                  />
                );
              })
            ) : (
              <View className="w-full">
                <Text className="w-full text-[12px] leading-6 text-zinc-500">
                  Mood-tagged entries will appear here.
                </Text>
              </View>
            )}
            {hasEntriesWithoutMood ? (
              <LegendPill
                backgroundColor={fallbackMoodMetadata.backgroundColor}
                label={`${fallbackMoodMetadata.emoji} No mood`}
              />
            ) : null}
            <LegendPill backgroundColor="#FFF1F5" label="M Morning intention" />
            <LegendPill backgroundColor="#F5F3FF" label="E Evening reflection" />
          </View>
        </View>
      </View>
    </View>
  );
}

function ActivityLegendPill({
  backgroundColor,
  borderColor,
  label,
}: {
  backgroundColor: string;
  borderColor: string;
  label: string;
}) {
  return (
    <View
      className="h-8 min-w-12 items-center justify-center rounded-full border px-3"
      style={{ backgroundColor, borderColor }}
    >
      <Text className="text-[13px] font-bold leading-5 text-zinc-700">
        {label}
      </Text>
    </View>
  );
}

function LegendPill({
  backgroundColor,
  label,
}: {
  backgroundColor: string;
  label: string;
}) {
  return (
    <View
      className="h-8 items-center justify-center rounded-full px-3"
      style={{ backgroundColor }}
    >
      <Text className="text-[14px] font-semibold leading-6 text-zinc-700">
        {label}
      </Text>
    </View>
  );
}

function SelectedDaySummary({ day }: { day: CalendarDayStatus }) {
  const mood = day.dominantMood ? moodMetadata[day.dominantMood] : null;
  const moodLabel = mood
    ? `${mood.emoji} ${mood.label}`
    : day.hasEntriesWithoutMood
      ? `${fallbackMoodMetadata.emoji} No mood selected`
      : "No mood data";

  return (
    <View
      className="rounded-[24px] border border-zinc-100 bg-white p-5"
      style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.12)" }}
    >
      <Text className="text-[18px] font-bold leading-6 text-zinc-900">
        {formatSelectedDate(day.date)}
      </Text>
      <View className="mt-4 flex-row flex-wrap gap-2">
        <EntryCountPill
          backgroundColor="#FFF1F5"
          count={day.entryCount}
        />
        <SummaryPill
          backgroundColor={mood?.backgroundColor ?? "#F4F4F5"}
          label={moodLabel}
        />
      </View>
      <View className="mt-4 gap-2">
        <CompletionRow
          icon={<Sunrise color={colors.primary} size={18} strokeWidth={2.2} />}
          isComplete={day.hasMorningIntention}
          label="Morning intention"
        />
        <CompletionRow
          icon={<Moon color="#7C3AED" size={17} strokeWidth={2.2} />}
          isComplete={day.hasEveningReflection}
          label="Evening reflection"
        />
      </View>
    </View>
  );
}

function EntryCountPill({
  backgroundColor,
  count,
}: {
  backgroundColor: string;
  count: number;
}) {
  const entryLabel = count === 1 ? "Entry" : "Entries";

  return (
    <View
      className="min-h-9 min-w-[96px] flex-row items-center justify-center gap-1 rounded-full px-4 py-1.5"
      style={{ backgroundColor }}
    >
      <Text
        className="text-[14px] font-semibold leading-6 text-zinc-700"
        numberOfLines={1}
      >
        {count}
      </Text>
      <Text
        className="text-[14px] font-semibold leading-6 text-zinc-700"
        numberOfLines={1}
      >
        {entryLabel}
      </Text>
    </View>
  );
}

function SummaryPill({
  backgroundColor,
  label,
}: {
  backgroundColor: string;
  label: string;
}) {
  return (
    <View
      className="min-h-9 flex-row items-center justify-center rounded-full px-4 py-1.5"
      style={{ backgroundColor }}
    >
      <Text className="text-[14px] font-semibold leading-6 text-zinc-700">
        {label}
      </Text>
    </View>
  );
}

function CompletionRow({
  icon,
  isComplete,
  label,
}: {
  icon: ReactNode;
  isComplete: boolean;
  label: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3 rounded-[16px] bg-zinc-50 px-3 py-3">
      <View className="flex-1 flex-row items-center gap-2">
        {icon}
        <Text className="text-[14px] font-semibold leading-6 text-zinc-700">
          {label}
        </Text>
      </View>
      <View
        className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
        style={{ backgroundColor: isComplete ? "#DCFCE7" : "#F4F4F5" }}
      >
        {isComplete ? (
          <Check color="#16A34A" size={14} strokeWidth={2.4} />
        ) : null}
        <Text
          className="text-[12px] font-bold leading-6"
          style={{ color: isComplete ? "#15803D" : colors.muted }}
        >
          {isComplete ? "Done" : "Not yet"}
        </Text>
      </View>
    </View>
  );
}

function CalendarEmptyState({
  body,
  title,
}: {
  body?: string;
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
        <View className="mt-2 w-full">
          <Text className="w-full text-center text-[14px] leading-6 text-zinc-500">
            {body}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function getDayAccessibilityLabel(day: CalendarDayStatus) {
  const parts = [
    formatSelectedDate(day.date),
    day.isToday ? "Today" : "",
    day.isCurrentMonth ? "" : "Outside current month",
    day.isFuture ? "Future date" : "",
    `${day.entryCount} ${day.entryCount === 1 ? "entry" : "entries"}`,
  ];

  if (day.dominantMood) {
    parts.push(`Dominant mood ${moodMetadata[day.dominantMood].label}`);
  } else if (day.hasEntriesWithoutMood) {
    parts.push("Entries without mood");
  }

  if (day.hasMorningIntention) {
    parts.push("Morning intention complete");
  }

  if (day.hasEveningReflection) {
    parts.push("Evening reflection complete");
  }

  return parts.filter(Boolean).join(", ");
}

function getActivityHeatmapColor(entryCount: number) {
  if (entryCount >= 3) {
    return activityHeatmapLevels[3].backgroundColor;
  }

  if (entryCount === 2) {
    return activityHeatmapLevels[2].backgroundColor;
  }

  if (entryCount === 1) {
    return activityHeatmapLevels[1].backgroundColor;
  }

  return activityHeatmapLevels[0].backgroundColor;
}

function getActivityHeatmapBorderColor(entryCount: number) {
  if (entryCount >= 3) {
    return activityHeatmapLevels[3].borderColor;
  }

  if (entryCount === 2) {
    return activityHeatmapLevels[2].borderColor;
  }

  if (entryCount === 1) {
    return activityHeatmapLevels[1].borderColor;
  }

  return activityHeatmapLevels[0].borderColor;
}
