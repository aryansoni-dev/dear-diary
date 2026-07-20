import { useJournalHydrationStore } from "@/store/journal-store";
import { useNotificationPreferencesStore } from "@/store/notification-preferences-store";
import { useAchievementHydrationStore } from "@/store/useAchievementStore";
import { useAIInsightReportStore } from "@/store/useAIInsightReportStore";
import { useAIUsageStore } from "@/store/useAIUsageStore";
import { useChatStore } from "@/store/useChatStore";
import { useDailyReflectionPromptStore } from "@/store/useDailyReflectionPromptStore";
import { useEntryReflectionHydrationStore } from "@/store/useEntryReflectionStore";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import { useSyncStore } from "@/store/useSyncStore";

export function useUserScopedStorageHydration() {
  const achievementStoreHydrated = useAchievementHydrationStore(
    (state) => state.hasHydrated,
  );
  const aiInsightStoreHydrated = useAIInsightReportStore(
    (state) => state.hasHydrated,
  );
  const aiUsageStoreHydrated = useAIUsageStore((state) => state.hasHydrated);
  const chatStoreHydrated = useChatStore((state) => state.hasHydrated);
  const dailyPromptStoreHydrated = useDailyReflectionPromptStore(
    (state) => state.hasHydrated,
  );
  const entryReflectionStoreHydrated = useEntryReflectionHydrationStore(
    (state) => state.hasHydrated,
  );
  const journalStoreHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const moodLogStoreHydrated = useMoodLogStore((state) => state.hasHydrated);
  const notificationStoreHydrated = useNotificationPreferencesStore(
    (state) => state.hasHydrated,
  );
  const syncStoreHydrated = useSyncStore((state) => state.hasHydrated);

  return (
    achievementStoreHydrated &&
    aiInsightStoreHydrated &&
    aiUsageStoreHydrated &&
    chatStoreHydrated &&
    dailyPromptStoreHydrated &&
    entryReflectionStoreHydrated &&
    journalStoreHydrated &&
    moodLogStoreHydrated &&
    notificationStoreHydrated &&
    syncStoreHydrated
  );
}
