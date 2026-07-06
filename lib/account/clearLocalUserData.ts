import * as FileSystem from "expo-file-system/legacy";

import { disableJournalReminders } from "@/lib/notifications";
import { deleteAppLockConfig } from "@/lib/security/appLockStorage";
import { useJournalStore } from "@/store/journal-store";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useAIInsightReportStore } from "@/store/useAIInsightReportStore";
import { useChatStore } from "@/store/useChatStore";
import { useDailyReflectionPromptStore } from "@/store/useDailyReflectionPromptStore";
import { useEntryReflectionStore } from "@/store/useEntryReflectionStore";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import { useNotificationPreferencesStore } from "@/store/notification-preferences-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useSyncStore } from "@/store/useSyncStore";

const exportFilePrefix = "deardiary-export-";

export async function clearLocalUserData(userId: string): Promise<void> {
  const cleanupResults = await Promise.allSettled([
    clearInMemoryAndPersistedStores(userId),
    clearAppLockConfig(userId),
    clearExportFiles(),
  ]);
  await clearNotificationState();
  const failedRequiredCleanup = cleanupResults.some(
    (result) => result.status === "rejected",
  );

  if (failedRequiredCleanup) {
    throw new Error("Local account data could not be fully cleared.");
  }
}

async function clearInMemoryAndPersistedStores(userId: string) {
  useJournalStore.getState().clearEntriesForUser(userId);
  useJournalStore.getState().setActiveUserId(null);
  useMoodLogStore.getState().clearMoodLogsForUser(userId);
  useChatStore.getState().clearMessagesForUser(userId);
  useDailyReflectionPromptStore.getState().clearBundlesForUser(userId);
  useEntryReflectionStore.getState().clearReflectionsForUser(userId);
  useAIInsightReportStore.getState().clearReportsForUser(userId);
  useAchievementStore.getState().resetAchievementNotifications(userId);
  useAchievementStore.getState().setAchievementSyncUserId(null);
  useSyncStore.getState().clearSyncStateForUser(userId);
  useNotificationPreferencesStore.getState().resetNotificationPreferences();
  useOnboardingStore.getState().resetOnboarding();
}

async function clearAppLockConfig(userId: string) {
  await deleteAppLockConfig(userId);
}

async function clearNotificationState() {
  try {
    await disableJournalReminders();
  } catch (error) {
    if (isExpectedNotificationCleanupError(error)) {
      return;
    }

    if (__DEV__) {
      console.warn("Notification cleanup failed during account deletion", {
        name: error instanceof Error ? error.name : "UnknownError",
      });
    }

    throw error;
  }
}

function isExpectedNotificationCleanupError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Expo Go no longer supports expo-notifications") ||
    error.message.includes("Notification reminders need a development build")
  );
}

async function clearExportFiles() {
  if (!FileSystem.documentDirectory) {
    return;
  }

  const fileNames = await FileSystem.readDirectoryAsync(
    FileSystem.documentDirectory,
  );
  const exportFiles = fileNames.filter((fileName) =>
    fileName.startsWith(exportFilePrefix),
  );

  await Promise.all(
    exportFiles.map((fileName) =>
      FileSystem.deleteAsync(`${FileSystem.documentDirectory}${fileName}`, {
        idempotent: true,
      }),
    ),
  );
}
