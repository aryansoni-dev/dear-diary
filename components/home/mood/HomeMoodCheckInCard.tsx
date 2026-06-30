import { useMemo, useState } from "react";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { HomeSelectedMood } from "@/components/home/mood/HomeSelectedMood";
import { MoodCheckInAction } from "@/components/home/mood/MoodCheckInAction";
import { MoodSpectrumSelector } from "@/components/home/mood/MoodSpectrumSelector";
import { images } from "@/constants/images";
import { moodList, moodMetadata } from "@/constants/moods";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useConnectivity } from "@/hooks/useConnectivity";
import { createLocalDateKey } from "@/lib/calendar/dateUtils";
import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { reportAppError } from "@/lib/errors/reportAppError";
import {
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { AppError } from "@/types/appError";
import type { MoodId } from "@/types/journal";
import type { MoodLog } from "@/types/moodLog";

const homeMoodPrompt = "How are you feeling right now?";

export function HomeMoodCheckInCard() {
  const connectivity = useConnectivity();
  const { runAutoSync } = useAutoSync();
  const allMoodLogs = useMoodLogStore((state) => state.allMoodLogs);
  const addMoodLog = useMoodLogStore((state) => state.addMoodLog);
  const updateMoodLog = useMoodLogStore((state) => state.updateMoodLog);
  const moodLogHasHydrated = useMoodLogStore((state) => state.hasHydrated);
  const moodLogHydrationError = useMoodLogStore(
    (state) => state.hydrationError,
  );
  const journalHasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const activeUserId = useJournalStore((state) => state.activeUserId);
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const [draftSelectedMoodId, setDraftSelectedMoodId] =
    useState<MoodId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);
  const [lastSavedMoodId, setLastSavedMoodId] = useState<MoodId | null>(null);
  const hasHydrated = journalHasHydrated && moodLogHasHydrated;
  const todayMoodLog = useMemo(
    () => getTodayMoodLog(allMoodLogs, activeUserId),
    [activeUserId, allMoodLogs],
  );
  const savedMoodId = todayMoodLog?.mood ?? null;
  const selectedMoodId = draftSelectedMoodId ?? savedMoodId;
  const selectedMood = selectedMoodId ? moodMetadata[selectedMoodId] : null;
  const hasUnsavedSelection =
    Boolean(draftSelectedMoodId) && draftSelectedMoodId !== savedMoodId;
  const isSavedSelection =
    Boolean(savedMoodId) && selectedMoodId === savedMoodId && !hasUnsavedSelection;
  const actionLabel = getActionLabel({
    hasUnsavedSelection,
    isSavedSelection,
    selectedMoodId,
    todayMoodLog,
  });
  const actionDisabled =
    !hasHydrated ||
    Boolean(moodLogHydrationError) ||
    !activeUserId ||
    !selectedMoodId ||
    isSavedSelection ||
    isSaving;
  const helperText = getHelperText({
    connectivityStatus: connectivity.status,
    moodLog: todayMoodLog,
    hasHydrated,
    hasUnsavedSelection,
    isSaving,
    isSyncing,
    lastSavedMoodId,
    moodLogHydrationError,
    saveError,
  });

  function handleSelectMood(moodId: MoodId) {
    setDraftSelectedMoodId(moodId);
    setLastSavedMoodId(null);
    setSaveError(null);
  }

  async function handleSaveMood() {
    if (
      !hasHydrated ||
      moodLogHydrationError ||
      !selectedMoodId ||
      !activeUserId ||
      isSaving
    ) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      if (todayMoodLog) {
        updateMoodLog(todayMoodLog.id, activeUserId, {
          intensity: null,
          mood: selectedMoodId,
          note: null,
        });
      } else {
        addMoodLog(activeUserId, {
          intensity: null,
          mood: selectedMoodId,
          note: null,
        });
      }

      setDraftSelectedMoodId(null);
      setLastSavedMoodId(selectedMoodId);
      void runAutoSync("mood_change");
    } catch (error) {
      const appError = normalizeAppError(error, {
        fallbackMessage:
          "We couldn't save this mood on your device. Please try again.",
        operation: "local_save_home_mood_check_in",
      });

      reportAppError(appError, {
        errorCode: appError.code,
        feature: "home",
        operation: "local_save_home_mood_check_in",
      });
      setSaveError(appError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View
      className="mb-9 gap-5 rounded-[24px] bg-white px-5 py-6"
      style={{ boxShadow: "0 12px 34px rgba(0, 0, 0, 0.08)" }}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="text-[23px] font-semibold leading-6 text-[#27272A]">
            {homeMoodPrompt}
          </Text>
          <Text className="text-[15px] font-medium leading-6 text-[#71717B]">
            Take a quiet moment to check in with yourself.
          </Text>
        </View>
        <HeartMoodAccent />
      </View>

      <HomeSelectedMood
        isLoading={!hasHydrated}
        isSaved={isSavedSelection}
        mood={selectedMood}
        savedAt={todayMoodLog?.updatedAt ?? todayMoodLog?.createdAt ?? null}
      />

      <MoodSpectrumSelector
        disabled={!hasHydrated || Boolean(moodLogHydrationError) || isSaving}
        moods={moodList}
        onSelectMood={handleSelectMood}
        selectedMoodId={selectedMoodId}
      />

      {moodLogHydrationError ? (
        <View className="gap-3 rounded-[18px] bg-[#FFF1F2] px-4 py-4">
          <Text className="text-[14px] font-semibold leading-6 text-[#BE123C]">
            {helperText}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="self-start rounded-full bg-white px-4 py-2"
            onPress={retryMoodLogHydration}
          >
            <Text className="text-[13px] font-semibold leading-6 text-[#FF2056]">
              Retry loading
            </Text>
          </Pressable>
        </View>
      ) : saveError ? (
        <View className="gap-3 rounded-[18px] bg-[#FFF1F2] px-4 py-4">
          <Text className="text-[14px] font-semibold leading-6 text-[#BE123C]">
            We could not save this mood on your device. Please try again.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="self-start rounded-full bg-white px-4 py-2"
            onPress={handleSaveMood}
          >
            <Text className="text-[13px] font-semibold leading-6 text-[#FF2056]">
              Retry
            </Text>
          </Pressable>
        </View>
      ) : helperText ? (
        <Text className="text-[13px] font-medium leading-6 text-[#71717B]">
          {helperText}
        </Text>
      ) : null}

      <MoodCheckInAction
        disabled={actionDisabled}
        isSaving={isSaving}
        label={actionLabel}
        onPress={handleSaveMood}
      />
    </View>
  );
}

function HeartMoodAccent() {
  return (
    <View
      pointerEvents="none"
      className="mt-1 h-[78px] w-[92px] items-center justify-center"
    >
      <Image
        source={images.moodCardHeart}
        contentFit="contain"
        accessible={false}
        style={{ height: 78, width: 92 }}
      />
    </View>
  );
}

function retryMoodLogHydration() {
  void useMoodLogStore.persist.rehydrate();
}

function getTodayMoodLog(moodLogs: MoodLog[], userId: string | null) {
  if (!userId) {
    return undefined;
  }

  const todayKey = createLocalDateKey(new Date());

  return [...moodLogs]
    .filter(
      (moodLog) =>
        moodLog.userId === userId &&
        !moodLog.deletedAt &&
        createLocalDateKey(new Date(moodLog.createdAt)) === todayKey,
    )
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
    )[0];
}

function getActionLabel({
  hasUnsavedSelection,
  isSavedSelection,
  selectedMoodId,
  todayMoodLog,
}: {
  hasUnsavedSelection: boolean;
  isSavedSelection: boolean;
  selectedMoodId: MoodId | null;
  todayMoodLog: MoodLog | undefined;
}) {
  if (!selectedMoodId) {
    return "Select a mood";
  }

  if (isSavedSelection) {
    return "Mood logged";
  }

  if (todayMoodLog && hasUnsavedSelection) {
    return "Update mood";
  }

  return "Log mood";
}

function getHelperText({
  connectivityStatus,
  moodLog,
  hasHydrated,
  hasUnsavedSelection,
  isSaving,
  isSyncing,
  lastSavedMoodId,
  moodLogHydrationError,
  saveError,
}: {
  connectivityStatus: string;
  moodLog: MoodLog | undefined;
  hasHydrated: boolean;
  hasUnsavedSelection: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  lastSavedMoodId: MoodId | null;
  moodLogHydrationError: AppError | null;
  saveError: AppError | null;
}) {
  if (!hasHydrated) {
    return "Loading your saved check-in...";
  }

  if (moodLogHydrationError) {
    return "Saved mood logs could not be loaded. Retry loading before saving again.";
  }

  if (saveError) {
    return null;
  }

  if (isSaving) {
    return "Saving on this device...";
  }

  if (hasUnsavedSelection) {
    return "Save when this feels closest.";
  }

  if (!moodLog || !moodLog.mood) {
    return "Your check-in saves on this device first.";
  }

  if (connectivityStatus === "offline") {
    return "Mood logged on this device. It will sync when you reconnect.";
  }

  if (isSyncing) {
    return "Mood logged. Syncing when ready...";
  }

  if (moodLog.syncStatus === "failed") {
    return "Mood logged on this device. Cloud sync will retry.";
  }

  if (moodLog.syncStatus !== "synced") {
    return "Mood logged. Waiting to sync.";
  }

  if (lastSavedMoodId) {
    return "Mood logged for today.";
  }

  return "Mood logged for today.";
}
