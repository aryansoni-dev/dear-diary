import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from "lottie-react-native";
import { Check, ChevronLeft, Sparkles, Trash2, X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EntryAIReflectionCard } from "@/components/journal-editor/entry-ai-reflection-card";
import { FeatureErrorBoundary } from "@/components/errors/FeatureErrorBoundary";
import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { ScreenErrorState } from "@/components/states/ScreenErrorState";
import { ScreenLoadingState } from "@/components/states/ScreenLoadingState";
import { TagInputModal } from "@/components/tags/tag-input-modal";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { animatedMoodEmojis } from "@/constants/animated-emojis";
import { journalEditorMoods } from "@/data/journal-editor";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useDelayedVisibility } from "@/hooks/useDelayedVisibility";
import { useEntryReflection } from "@/hooks/useEntryReflection";
import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { reportAppError } from "@/lib/errors/reportAppError";
import { formatTagLabel, normalizeTag, normalizeTags } from "@/lib/tags";
import {
  retryJournalStoreHydration,
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import { useEntryReflectionStore } from "@/store/useEntryReflectionStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { ConnectivityStatus } from "@/types/connectivity";
import type {
  EntryType,
  JournalSyncStatus,
  MoodId,
} from "@/types/journal";

const colors = {
  heading: "#09090B",
  primary: "#FF2056",
  mutedChip: "#F4F4F5",
  placeholder: "#8B8B93",
};

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
  const { runAutoSync } = useAutoSync();
  const { showDialog } = useAppDialog();
  const connectivity = useConnectivity();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const writingContentHeightRef = useRef(0);
  const writingAreaYRef = useRef(0);
  const addTagButtonScale = useRef(new Animated.Value(1)).current;
  const deleteButtonScale = useRef(new Animated.Value(1)).current;
  const saveButtonScale = useRef(new Animated.Value(1)).current;
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
  const removeCachedReflection = useEntryReflectionStore(
    (state) => state.removeReflectionForEntry,
  );
  const hasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const hydrationError = useJournalHydrationStore(
    (state) => state.hydrationError,
  );
  const activeUserId = useJournalStore((state) => state.activeUserId);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodId | null>("happy");
  const [tags, setTags] = useState<string[]>([]);
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [wasSaved, setWasSaved] = useState(false);
  const [isWritingFocused, setIsWritingFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const showHydrationState = useDelayedVisibility(!hasHydrated);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const bottomChromeHeight = bottomNavHeight;
  const isAndroid = process.env.EXPO_OS === "android";
  const isKeyboardOpen = keyboardHeight > 0;
  const writingAreaBottomPadding =
    isAndroid && isKeyboardOpen ? keyboardHeight + 96 : bottomChromeHeight + 48;
  const activeTab = source === "history" ? "History" : "Today";
  const entry = entries.find((journalEntry) => journalEntry.id === entryId);
  const routePrompt = promptParam?.trim() || undefined;
  const requestedEntryType = isEntryType(typeParam)
    ? typeParam
    : routePrompt
      ? "daily_prompt"
      : "free_write";
  const activeEntryType = entry?.type ?? requestedEntryType;
  const activePrompt = entry?.prompt ?? routePrompt;
  const promptTitle = activePrompt?.trim();
  const hasPromptTitle = Boolean(promptTitle);
  const promptLabel =
    activeEntryType === "morning_intention"
      ? "Morning Intention"
      : "Reflection Prompt";
  const isEditing = Boolean(entryId);
  const isMissingEntry = hasHydrated && isEditing && !entry;
  const canSave =
    hasPromptTitle || title.trim().length > 0 || content.trim().length > 0;
  const saveButtonLabel = getSaveButtonLabel({
    canSave,
    connectivityStatus: connectivity.status,
    entrySyncStatus: entry?.syncStatus,
    isSyncing,
    wasSaved,
  });
  const dateLabel = useMemo(() => {
    const date = entry?.createdAt ? new Date(entry.createdAt) : new Date();

    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      weekday: "short",
    }).format(date);
  }, [entry?.createdAt]);
  const entryReflection = useEntryReflection({
    enabled: Boolean(entry),
    entryId: entry?.id ?? null,
    entryUpdatedAt: entry?.updatedAt ?? null,
    userId: activeUserId,
  });

  useEffect(() => {
    if (!entry) {
      return;
    }

    setContent(entry.content);
    setSelectedMood(entry.mood);
    setTags(entry.tags ?? []);
    setTitle(entry.title);
  }, [entry]);

  useEffect(() => {
    if (entry || !routePrompt) {
      return;
    }

    setTitle((currentTitle) => currentTitle || routePrompt);
  }, [entry, routePrompt]);

  useEffect(() => {
    const keyboardShowEvent =
      process.env.EXPO_OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const keyboardHideEvent =
      process.env.EXPO_OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(keyboardShowEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      scrollToWritingArea();
    });
    const hideSubscription = Keyboard.addListener(keyboardHideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function scrollToWritingArea() {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        animated: true,
        y: Math.max(writingAreaYRef.current - 24, 0),
      });
    });
  }

  function scrollToWritingAreaEnd() {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({
        animated: true,
        y:
          writingAreaYRef.current +
          Math.max(writingContentHeightRef.current - 240, 0),
      });
    });
  }

  function handleGoBack() {
    router.back();
  }

  function handleDelete() {
    if (!entryId) {
      return;
    }

    showDialog({
      cancelText: "Keep Entry",
      confirmText: "Delete Entry",
      icon: "!",
      message: "This journal entry will be removed from this device.",
      onConfirm: () => {
        const reflectionUserId = entry?.userId ?? activeUserId;

        if (reflectionUserId) {
          removeCachedReflection(reflectionUserId, entryId);
        }

        deleteEntry(entryId);
        void runAutoSync("journal_change");
        router.replace("/journal-history");
      },
      showCancel: true,
      title: "Delete entry?",
      variant: "destructive",
    });
  }

  function handleSave() {
    if (!canSave) {
      return;
    }

    if (!activeUserId) {
      Alert.alert(
        "Sign in required",
        "Please sign in again before saving a journal entry.",
      );
      return;
    }

    const savedEntry = {
      content: content.trim(),
      mood: selectedMood,
      tags,
      title:
        promptTitle ||
        getSavedTitle({
          title: title.trim(),
          type: activeEntryType,
        }),
      type: activeEntryType,
      ...(promptTitle ? { prompt: promptTitle } : {}),
    };

    try {
      if (entryId) {
        updateEntry(entryId, savedEntry);
        setWasSaved(true);
        void runAutoSync("journal_change");
        return;
      }

      const newEntry = addEntry(savedEntry);
      setWasSaved(true);
      void runAutoSync("journal_change");
      router.replace({
        pathname: "/journal/[id]",
        params: { id: newEntry.id, source: source ?? "home" },
      });
    } catch (error) {
      const appError = normalizeAppError(error, {
        operation: "local_save_journal_entry",
      });

      reportAppError(appError, {
        errorCode: appError.code,
        feature: "journal",
        operation: "local_save_journal_entry",
        screen: "journal_editor",
      });
      showDialog({
        confirmText: "OK",
        message:
          "We could not save this entry on your device. Please try again before leaving this screen.",
        title: "Save failed",
        variant: "destructive",
      });
    }
  }

  function handleAddTag(tag: string) {
    const normalizedTag = normalizeTag(tag);

    if (!normalizedTag) {
      return;
    }

    setTags((currentTags) => normalizeTags([...currentTags, normalizedTag]));
    setWasSaved(false);
  }

  function handleRemoveTag(tag: string) {
    setTags((currentTags) =>
      currentTags.filter((currentTag) => currentTag !== tag),
    );
    setWasSaved(false);
  }

  function animateButton(scaleValue: Animated.Value, toValue: number) {
    Animated.timing(scaleValue, {
      duration: toValue < 1 ? 80 : 130,
      toValue,
      useNativeDriver: true,
    }).start();
  }

  function handleButtonPressIn(scaleValue: Animated.Value) {
    animateButton(scaleValue, 0.96);

    if (process.env.EXPO_OS === "ios") {
      void Haptics.selectionAsync();
    }
  }

  function handleRegenerateReflection() {
    showDialog({
      cancelText: "Cancel",
      confirmText: "Regenerate",
      icon: "✦",
      message:
        "DearDiary will create a new reflection for this entry and replace the current one.",
      onConfirm: () => {
        void handleConfirmedRegenerateReflection();
      },
      showCancel: true,
      title: "Regenerate reflection?",
    });
  }

  async function syncEntryBeforeReflection() {
    if (connectivity.status === "offline") {
      showDialog({
        confirmText: "OK",
        message: "Connect to the internet to generate a reflection.",
        title: "Internet required",
      });
      return false;
    }

    if (!entry || entry.syncStatus === "synced") {
      return true;
    }

    await runAutoSync("journal_change");

    const latestEntry = useJournalStore.getState().getEntryById(entry.id);

    if (latestEntry?.syncStatus === "synced") {
      return true;
    }

    showDialog({
      confirmText: "OK",
      icon: "!",
      message:
        "Please try again after this entry finishes syncing, so DearDiary AI reflects the latest saved version.",
      title: "Sync needed",
    });

    return false;
  }

  async function handleGenerateReflection() {
    const canGenerate = await syncEntryBeforeReflection();

    if (canGenerate) {
      await entryReflection.generate();
    }
  }

  async function handleConfirmedRegenerateReflection() {
    const canRegenerate = await syncEntryBeforeReflection();

    if (canRegenerate) {
      await entryReflection.regenerate();
    }
  }

  function handleButtonPressOut(scaleValue: Animated.Value) {
    animateButton(scaleValue, 1);
  }

  function retryJournalHydration() {
    retryJournalStoreHydration();
  }

  if (!hasHydrated) {
    return (
      <View className="flex-1 justify-center bg-white px-8">
        <StatusBar hidden />
        {showHydrationState ? (
          <ScreenLoadingState title="Preparing your journal..." />
        ) : null}
      </View>
    );
  }

  if (hydrationError) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar hidden />
        <View
          className="flex-1 justify-center px-8"
          style={{ paddingBottom: bottomNavHeight }}
        >
          <ScreenErrorState
            error={hydrationError}
            onRetry={retryJournalHydration}
          />
        </View>
        <BottomTabBar activeTab={activeTab} />
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
            This journal entry could not be found.
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
              Return to History
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
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          minHeight: 874,
          paddingBottom: writingAreaBottomPadding,
          paddingHorizontal: 24,
          paddingTop: Math.max(58, insets.top + 20),
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <AnimatedIconButton
            accessibilityLabel="Go back"
            onPress={handleGoBack}
            shadow="0 2px 7px rgba(39, 39, 42, 0.16)"
          >
            <ChevronLeft color={colors.heading} size={25} strokeWidth={3} />
          </AnimatedIconButton>

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
                onPress={handleDelete}
                onPressIn={() => handleButtonPressIn(deleteButtonScale)}
                onPressOut={() => handleButtonPressOut(deleteButtonScale)}
              >
                <Animated.View
                  className="size-[54px] items-center justify-center rounded-full bg-zinc-100"
                  style={{
                    opacity: deleteButtonScale.interpolate({
                      inputRange: [0.96, 1],
                      outputRange: [0.82, 1],
                    }),
                    transform: [{ scale: deleteButtonScale }],
                  }}
                >
                  <Trash2 color={colors.primary} size={22} strokeWidth={2.4} />
                </Animated.View>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
              disabled={!canSave}
              onPress={handleSave}
              onPressIn={() => handleButtonPressIn(saveButtonScale)}
              onPressOut={() => handleButtonPressOut(saveButtonScale)}
            >
              <Animated.View
                className="h-[54px] flex-row items-center justify-center gap-2 rounded-full px-7"
                style={{
                  backgroundColor: canSave ? colors.primary : "#F4F4F5",
                  boxShadow: canSave
                    ? "0 4px 12px rgba(255, 32, 86, 0.28)"
                    : undefined,
                  opacity: saveButtonScale.interpolate({
                    inputRange: [0.96, 1],
                    outputRange: [0.82, 1],
                  }),
                  transform: [{ scale: saveButtonScale }],
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
                  {saveButtonLabel}
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {activePrompt ? (
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
                  <Sparkles
                    color={colors.primary}
                    size={22}
                    strokeWidth={2.2}
                  />
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
        ) : null}

        <View className="mb-5">
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
                  <AnimatedMoodEmoji
                    isSelected={isSelected}
                    moodId={mood.id}
                  />
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

        <View className="mb-7">
          <Text className="mb-3 text-[11px] font-semibold uppercase leading-5 tracking-[3.2px] text-[#71717B]">
            Tags
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <Pressable
                accessibilityLabel={`Remove ${formatTagLabel(tag)} tag`}
                accessibilityRole="button"
                className="h-10 flex-row items-center justify-center gap-2 rounded-full bg-[#FFE8F0] px-4"
                key={tag}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text className="text-[15px] font-semibold leading-5 text-[#FF2056]">
                  {formatTagLabel(tag)}
                </Text>
                <X color={colors.primary} size={15} strokeWidth={2.4} />
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsTagInputVisible(true)}
              onPressIn={() => handleButtonPressIn(addTagButtonScale)}
              onPressOut={() => handleButtonPressOut(addTagButtonScale)}
            >
              <Animated.View
                className="h-10 items-center justify-center rounded-full bg-[#F4EFFA] px-4"
                style={{
                  opacity: addTagButtonScale.interpolate({
                    inputRange: [0.96, 1],
                    outputRange: [0.82, 1],
                  }),
                  transform: [{ scale: addTagButtonScale }],
                }}
              >
                <Text className="text-[15px] font-semibold leading-5 text-zinc-700">
                  + Add tag
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>

        <View
          className="flex-1"
          onLayout={(event) => {
            writingAreaYRef.current = event.nativeEvent.layout.y;
          }}
        >
          {!hasPromptTitle ? (
            <>
              <TextInput
                accessibilityLabel="Journal title"
                className="min-h-[58px] text-[30px] font-bold leading-8 text-zinc-950"
                onChangeText={(value) => {
                  setTitle(value);
                  setWasSaved(false);
                }}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.placeholder}
                value={title}
              />
              <View className="h-px w-full bg-zinc-200" />
            </>
          ) : null}
          <View className="h-px w-full bg-zinc-200" />
          <TextInput
            accessibilityLabel="Journal entry"
            className={`${hasPromptTitle ? "" : "pt-6"} text-[20px] leading-6 text-zinc-950`}
            multiline
            onBlur={() => setIsWritingFocused(false)}
            onChangeText={(value) => {
              setContent(value);
              setWasSaved(false);
            }}
            onContentSizeChange={(event) => {
              writingContentHeightRef.current =
                event.nativeEvent.contentSize.height;

              if (isWritingFocused) {
                scrollToWritingAreaEnd();
              }
            }}
            onFocus={() => {
              setIsWritingFocused(true);
              scrollToWritingArea();
            }}
            placeholder="Write freely... this is your safe space 🌿"
            placeholderTextColor={colors.placeholder}
            scrollEnabled={false}
            style={{ minHeight: isKeyboardOpen ? 380 : 280 }}
            textAlignVertical="top"
            value={content}
          />
        </View>

        {entry ? (
          <FeatureErrorBoundary
            fallbackMessage="The entry stays editable. Try this reflection again in a moment."
            featureName="AI Reflection"
          >
            <View>
              <EntryAIReflectionCard
                error={entryReflection.error}
                isGenerating={entryReflection.isGenerating}
                isLoading={entryReflection.isLoading}
                isStale={entryReflection.isStale}
                onGenerate={handleGenerateReflection}
                onRegenerate={handleRegenerateReflection}
                reflection={entryReflection.reflection}
              />
            </View>
          </FeatureErrorBoundary>
        ) : null}
      </ScrollView>

      <BottomTabBar activeTab={activeTab} />
      <TagInputModal
        onAddTag={handleAddTag}
        onClose={() => setIsTagInputVisible(false)}
        visible={isTagInputVisible}
      />
    </KeyboardAvoidingView>
  );
}

function isEntryType(value: string | undefined): value is EntryType {
  return entryTypes.includes(value as EntryType);
}

function AnimatedMoodEmoji({
  isSelected,
  moodId,
}: {
  isSelected: boolean;
  moodId: MoodId;
}) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    animationRef.current?.reset();
    animationRef.current?.play();
  }, [isSelected]);

  return (
    <LottieView
      ref={animationRef}
      autoPlay={isSelected}
      loop={isSelected}
      resizeMode="contain"
      source={animatedMoodEmojis[moodId]}
      style={{ height: 30, width: 30 }}
    />
  );
}

function getSavedTitle({
  title,
  type,
}: {
  title: string;
  type: EntryType;
}) {
  return title || getDefaultTitle(type);
}

function getDefaultTitle(type: EntryType) {
  if (type === "morning_intention") {
    return "Morning Intention";
  }

  return "Untitled Entry";
}

function getSaveButtonLabel({
  canSave,
  connectivityStatus,
  entrySyncStatus,
  isSyncing,
  wasSaved,
}: {
  canSave: boolean;
  connectivityStatus: ConnectivityStatus;
  entrySyncStatus: JournalSyncStatus | undefined;
  isSyncing: boolean;
  wasSaved: boolean;
}) {
  if (!canSave) {
    return "Save";
  }

  if (entrySyncStatus === "synced" && wasSaved) {
    return "Synced";
  }

  if (!wasSaved) {
    return "Save";
  }

  if (isSyncing) {
    return "Syncing";
  }

  if (connectivityStatus === "offline" || entrySyncStatus === "failed") {
    return "Saved locally";
  }

  return wasSaved ? "Saved locally" : "Save";
}
