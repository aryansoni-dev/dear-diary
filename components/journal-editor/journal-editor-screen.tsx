import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Check, ChevronLeft, Sparkles, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { journalEditorMoods } from "@/data/journal-editor";
import { useJournalStore } from "@/store/journal-store";
import type { EntryType, MoodId } from "@/types/journal";

const colors = {
  heading: "#09090B",
  primary: "#FF2056",
  mutedChip: "#F4F4F5",
  placeholder: "#8B8B93",
};

const defaultPrompt = "What made you smile unexpectedly today?";
const entryTypes: EntryType[] = [
  "free_write",
  "daily_prompt",
  "morning_intention",
  "evening_reflection",
  "gratitude",
  "ai_reflection",
];

type JournalEditorScreenProps = {
  entryId?: string;
};

export function JournalEditorScreen({ entryId }: JournalEditorScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    prompt: promptParam,
    source,
    type: typeParam,
  } = useLocalSearchParams<{
    prompt?: string;
    source?: string;
    type?: string;
  }>();
  const entries = useJournalStore((state) => state.entries);
  const addEntry = useJournalStore((state) => state.addEntry);
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const deleteEntry = useJournalStore((state) => state.deleteEntry);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodId | null>("happy");
  const [title, setTitle] = useState("");
  const [wasSaved, setWasSaved] = useState(false);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const bottomChromeHeight = bottomNavHeight;
  const activeTab = source === "history" ? "History" : "Today";
  const entry = entries.find((journalEntry) => journalEntry.id === entryId);
  const requestedEntryType = isEntryType(typeParam) ? typeParam : "daily_prompt";
  const activeEntryType = entry?.type ?? requestedEntryType;
  const activePrompt = (entry?.prompt ?? promptParam?.trim()) || defaultPrompt;
  const promptLabel =
    activeEntryType === "morning_intention"
      ? "Morning Intention"
      : "Today's Reflection Prompt";
  const isEditing = Boolean(entryId);
  const isMissingEntry = hasHydrated && isEditing && !entry;
  const canSave = title.trim().length > 0 || content.trim().length > 0;
  const dateLabel = useMemo(() => {
    const date = entry?.createdAt ? new Date(entry.createdAt) : new Date();

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      weekday: "short",
    }).format(date);
  }, [entry?.createdAt]);

  useEffect(() => {
    if (!entry) {
      return;
    }

    setContent(entry.content);
    setSelectedMood(entry.mood);
    setTitle(entry.title);
  }, [entry]);

  function handleGoBack() {
    router.back();
  }

  function handleDelete() {
    if (!entryId) {
      return;
    }

    Alert.alert(
      "Delete entry?",
      "This journal entry will be removed from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          onPress: () => {
            deleteEntry(entryId);
            router.replace("/journal-history");
          },
          style: "destructive",
          text: "Delete",
        },
      ],
    );
  }

  function handleSave() {
    if (!canSave) {
      return;
    }

    const savedEntry = {
      content: content.trim(),
      mood: selectedMood,
      prompt: activePrompt,
      title: title.trim() || getDefaultTitle(activeEntryType),
      type: activeEntryType,
    };

    if (entryId) {
      updateEntry(entryId, savedEntry);
      setWasSaved(true);
      return;
    }

    const newEntry = addEntry(savedEntry);
    router.replace({
      pathname: "/journal/[id]",
      params: { id: newEntry.id, source: source ?? "home" },
    });
  }

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <StatusBar hidden />
        <Text className="text-center text-[17px] font-medium leading-6 text-zinc-500">
          Loading your journal...
        </Text>
      </View>
    );
  }

  if (isMissingEntry) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar hidden />
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingBottom: bottomNavHeight }}
        >
          <Text className="text-center text-[24px] font-bold leading-8 text-zinc-950">
            Entry not found
          </Text>
          <Text className="mt-3 text-center text-[16px] leading-6 text-zinc-500">
            This journal entry may have been deleted.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-6 h-12 items-center justify-center rounded-full bg-[#FF2056] px-6"
            onPress={() => router.replace("/journal-history")}
          >
            <Text className="text-[16px] font-semibold leading-6 text-white">
              Back to History
            </Text>
          </Pressable>
        </View>
        <BottomTabBar activeTab="History" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <StatusBar hidden />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          minHeight: 874,
          paddingBottom: bottomChromeHeight + 48,
          paddingHorizontal: 24,
          paddingTop: Math.max(58, insets.top + 20),
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="size-[54px] items-center justify-center rounded-full bg-zinc-100"
            onPress={handleGoBack}
            style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.16)" }}
          >
            <ChevronLeft color={colors.heading} size={25} strokeWidth={3} />
          </Pressable>

          <View className="items-center">
            <Text className="text-[11px] font-semibold uppercase leading-5 tracking-[3.2px] text-[#71717B]">
              {isEditing ? "Editing" : "Today"}
            </Text>
            <Text className="text-[19px] font-bold leading-7 text-zinc-950">
              {dateLabel}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {isEditing ? (
              <Pressable
                accessibilityLabel="Delete journal entry"
                accessibilityRole="button"
                className="size-[54px] items-center justify-center rounded-full bg-zinc-100"
                onPress={handleDelete}
              >
                <Trash2 color={colors.primary} size={22} strokeWidth={2.4} />
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              className="h-[54px] flex-row items-center justify-center gap-2 rounded-full px-7"
              onPress={handleSave}
              style={{
                backgroundColor: canSave ? colors.primary : "#F4F4F5",
                boxShadow: canSave
                  ? "0 4px 12px rgba(255, 32, 86, 0.28)"
                  : undefined,
              }}
            >
              <Check
                color={canSave ? "white" : colors.placeholder}
                size={22}
                strokeWidth={2.6}
              />
              <Text
                className="text-[17px] font-semibold leading-6"
                style={{ color: canSave ? "white" : colors.placeholder }}
              >
                {wasSaved ? "Saved" : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          className="mb-9 overflow-hidden rounded-[28px]"
          style={{ boxShadow: "0 6px 14px rgba(39, 39, 42, 0.13)" }}
        >
          <LinearGradient
            colors={["#F8E3FA", "#FFE2EA"]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{ paddingHorizontal: 24, paddingVertical: 24 }}
          >
            <View className="mb-5 flex-row items-center gap-4">
              <View className="size-10 items-center justify-center rounded-full bg-white/60">
                <Sparkles color={colors.primary} size={22} strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-[11px] font-semibold uppercase leading-5 tracking-[2.4px] text-[#FF2056]">
                {promptLabel}
              </Text>
            </View>

            <Text className="text-[23px] font-bold leading-5 text-zinc-950">
              {activePrompt}
            </Text>
          </LinearGradient>
        </View>

        <View className="mb-8">
          <Text className="mb-3 text-[11px] font-semibold uppercase leading-5 tracking-[3.2px] text-[#71717B]">
            How are you feeling?
          </Text>
          <ScrollView
            className="-mx-6"
            contentContainerStyle={{
              gap: 10,
              paddingHorizontal: 24,
              paddingVertical: 2,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {journalEditorMoods.map((mood) => {
              const isSelected = selectedMood === mood.id;

              return (
                <Pressable
                  accessibilityRole="button"
                  className="h-[52px] shrink-0 flex-row items-center justify-center gap-2 rounded-full px-5"
                  key={mood.label}
                  onPress={() => {
                    setSelectedMood(mood.id);
                    setWasSaved(false);
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.mutedChip,
                    boxShadow: isSelected
                      ? "0 4px 10px rgba(255, 32, 86, 0.24)"
                      : undefined,
                  }}
                >
                  <Text className="text-[18px] leading-6">{mood.emoji}</Text>
                  <Text
                    className="text-[17px] leading-6"
                    style={{
                      color: isSelected ? "white" : colors.heading,
                      fontWeight: isSelected ? "700" : "500",
                    }}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1">
          <TextInput
            accessibilityLabel="Journal title"
            className="min-h-[58px] text-[30px] font-bold leading-10 text-zinc-950"
            onChangeText={(value) => {
              setTitle(value);
              setWasSaved(false);
            }}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.placeholder}
            value={title}
          />
          <View className="h-px w-full bg-zinc-200" />
          <TextInput
            accessibilityLabel="Journal entry"
            className="min-h-[280px] pt-6 text-[20px] leading-8 text-zinc-950"
            multiline
            onChangeText={(value) => {
              setContent(value);
              setWasSaved(false);
            }}
            placeholder="Write freely... this is your safe space 🌿"
            placeholderTextColor={colors.placeholder}
            textAlignVertical="top"
            value={content}
          />
        </View>
      </ScrollView>

      <BottomTabBar activeTab={activeTab} />
    </KeyboardAvoidingView>
  );
}

function isEntryType(value: string | undefined): value is EntryType {
  return entryTypes.includes(value as EntryType);
}

function getDefaultTitle(type: EntryType) {
  if (type === "morning_intention") {
    return "Morning Intention";
  }

  return "Untitled Entry";
}
