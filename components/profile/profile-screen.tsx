import { useAuth, useUser } from "@clerk/expo";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { achievementDefinitions } from "@/data/achievements";
import {
  accountItems,
  preferenceItems,
  type ProfileInsight,
  type ProfileMenuItem,
  type ProfileStat,
} from "@/data/profile";
import { useAppDialog } from "@/hooks/useAppDialog";
import { getAchievements, getWordCount } from "@/lib/achievements";
import {
  exportJournalAsJson,
  exportJournalAsMarkdown,
  JournalExportError,
} from "@/lib/exportJournal";
import { clearEntriesForUser } from "@/lib/local-data";
import { setSupabaseAccessTokenProvider } from "@/lib/supabase";
import { syncAchievementStatesTwoWay } from "@/lib/sync/achievementSync";
import { syncJournalEntriesTwoWay } from "@/lib/sync/journalTwoWaySync";
import { syncProfileToCloud } from "@/lib/sync/profileSync";
import { useJournalStore } from "@/store/journal-store";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useSyncStore } from "@/store/useSyncStore";
import type { AchievementCategory } from "@/types/achievement";
import type { JournalEntry, MoodId } from "@/types/journal";

const colors = {
  iconMuted: "#A1A1AA",
  primary: "#FF2056",
};

const profileNotificationsHref = "/profile-notifications" as Href;
const achievementsHref = "/achievements" as Href;
const cloudSyncItemLabel = "Backup & Sync Data";

const moodLabels: Record<MoodId, string> = {
  anxious: "Anxious",
  calm: "Calm",
  grateful: "Grateful",
  happy: "Happy",
  motivated: "Motivated",
  sad: "Sad",
};

const moodEmoji: Record<MoodId, string> = {
  anxious: "😰",
  calm: "😌",
  grateful: "🙏",
  happy: "😊",
  motivated: "🔥",
  sad: "😔",
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const { showDialog } = useAppDialog();
  const entries = useJournalStore((state) => state.entries);
  const allEntries = useJournalStore((state) => state.allEntries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const markEntriesPendingSync = useJournalStore(
    (state) => state.markEntriesPendingSync,
  );
  const markEntriesSynced = useJournalStore(
    (state) => state.markEntriesSynced,
  );
  const markEntriesSyncFailed = useJournalStore(
    (state) => state.markEntriesSyncFailed,
  );
  const mergeRemoteEntries = useJournalStore(
    (state) => state.mergeRemoteEntries,
  );
  const setActiveUserId = useJournalStore((state) => state.setActiveUserId);
  const achievementHasHydrated = useAchievementStore(
    (state) => state.hasHydrated,
  );
  const mergeNotifiedAchievementIds = useAchievementStore(
    (state) => state.mergeNotifiedAchievementIds,
  );
  const setAchievementSyncUserId = useAchievementStore(
    (state) => state.setAchievementSyncUserId,
  );
  const isSyncing = useSyncStore((state) => state.isSyncing);
  const syncHasHydrated = useSyncStore((state) => state.hasHydrated);
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt);
  const lastSyncFailedAt = useSyncStore((state) => state.lastSyncFailedAt);
  const lastSyncUserId = useSyncStore((state) => state.lastSyncUserId);
  const setIsSyncing = useSyncStore((state) => state.setIsSyncing);
  const setSyncFailure = useSyncStore((state) => state.setSyncFailure);
  const setSyncSuccess = useSyncStore((state) => state.setSyncSuccess);
  const [isClearingData, setIsClearingData] = useState(false);
  const [isExportingJournal, setIsExportingJournal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const displayName = getDisplayName({
    emailAddress: user?.primaryEmailAddress?.emailAddress,
    firstName: user?.firstName,
    fullName: user?.fullName,
  });
  const profileInitial = displayName.charAt(0).toUpperCase();
  const journalingSince = useMemo(
    () => getJournalingSinceLabel(entries, hasHydrated),
    [entries, hasHydrated],
  );
  const profileSummary = useMemo(
    () => getProfileSummary(entries, hasHydrated),
    [entries, hasHydrated],
  );
  const currentUserEntries = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    return entries.filter((entry) => entry.userId === user.id);
  }, [entries, user?.id]);
  const currentUserSyncEntries = useMemo(() => {
    if (!user?.id) {
      return [];
    }

    return allEntries.filter((entry) => entry.userId === user.id);
  }, [allEntries, user?.id]);
  const accountMenuItems = useMemo(
    () =>
      accountItems.map((item) =>
        item.label === cloudSyncItemLabel
          ? {
              ...item,
              subtitle: getSyncStatusLabel({
                isSyncing,
                lastSyncFailedAt:
                  lastSyncUserId === user?.id ? lastSyncFailedAt : null,
                lastSyncedAt:
                  lastSyncUserId === user?.id ? lastSyncedAt : null,
              }),
            }
          : item,
      ),
    [
      isSyncing,
      lastSyncFailedAt,
      lastSyncedAt,
      lastSyncUserId,
      user?.id,
    ],
  );

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setActiveUserId(null);
    setSupabaseAccessTokenProvider(null);

    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      setActiveUserId(user?.id ?? null);
      const message =
        error instanceof Error
          ? error.message
          : "We could not sign you out. Please try again.";
      showDialog({
        confirmText: "OK",
        message,
        title: "Sign out failed",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleSyncNow() {
    if (isSyncing) {
      return;
    }

    const userId = user?.id;

    if (!userId) {
      showDialog({
        confirmText: "OK",
        message: "You need to be signed in to sync your journal.",
        title: "Please sign in",
        variant: "destructive",
      });
      return;
    }

    if (!hasHydrated || !achievementHasHydrated || !syncHasHydrated) {
      showDialog({
        confirmText: "OK",
        message: "Your data is still loading. Please try again in a moment.",
        title: "Data loading",
      });
      return;
    }

    const pendingEntryIds = currentUserSyncEntries
      .filter((entry) => entry.syncStatus !== "synced")
      .map((entry) => entry.id);

    setIsSyncing(true);
    setAchievementSyncUserId(userId);
    setSupabaseAccessTokenProvider(() => getToken());
    markEntriesPendingSync(userId, pendingEntryIds);

    try {
      await syncProfileToCloud({
        avatarUrl: user.imageUrl,
        email: user.primaryEmailAddress?.emailAddress,
        fullName: user.fullName,
        userId,
      });

      const syncResult = await syncJournalEntriesTwoWay({
        localEntries: currentUserSyncEntries,
        userId,
      });

      markEntriesSynced(userId, syncResult.syncedEntryIds);
      markEntriesSyncFailed(userId, syncResult.failedEntryIds);

      if (!syncResult.pullSucceeded) {
        setSyncFailure(
          new Date().toISOString(),
          "Manual sync failed",
          userId,
        );
        showDialog({
          confirmText: "OK",
          message:
            "We couldn't sync your journal right now. Please check your connection and try again.",
          title: "Sync failed",
          variant: "destructive",
        });
        return;
      }

      const mergeResult = mergeRemoteEntries(
        userId,
        syncResult.remoteEntries,
      );
      const restoredCount =
        mergeResult.addedCount + mergeResult.updatedCount;
      let achievementSyncFailed = false;

      try {
        const syncedUserEntries = useJournalStore
          .getState()
          .entries.filter(
            (entry) => entry.userId === userId && !entry.deletedAt,
          );
        const unlockedAchievementIds = getAchievements(
          syncedUserEntries,
          getReflectionStreak(syncedUserEntries),
        )
          .filter((achievement) => achievement.unlocked)
          .map((achievement) => achievement.id);
        const notifiedAchievementIds =
          useAchievementStore.getState().achievementNotificationsByUserId[
            userId
          ]?.notifiedAchievementIds ?? [];
        const achievementSyncResult = await syncAchievementStatesTwoWay({
          notifiedAchievementIds,
          unlockedAchievementIds,
          userId,
        });

        mergeNotifiedAchievementIds(
          userId,
          achievementSyncResult.pulledNotifiedIds,
        );
        achievementSyncFailed = achievementSyncResult.failedCount > 0;
      } catch (error) {
        achievementSyncFailed = true;

        if (__DEV__) {
          console.warn("Achievement sync failed", error);
        }
      }

      if (syncResult.pushFailedCount > 0) {
        setSyncFailure(
          new Date().toISOString(),
          "Manual sync incomplete",
          userId,
        );
        showDialog({
          confirmText: "OK",
          message:
            "Some entries could not be backed up. Please try again.",
          title: "Sync incomplete",
          variant: "destructive",
        });
        return;
      }

      if (achievementSyncFailed) {
        setSyncFailure(
          new Date().toISOString(),
          "Achievement sync failed",
          userId,
        );
        showDialog({
          confirmText: "OK",
          message:
            "Your journal is up to date, but achievements could not be synced right now.",
          title: "Journal synced",
          variant: "destructive",
        });
        return;
      }

      if (syncResult.pushedCount === 0 && restoredCount === 0) {
        setSyncSuccess(new Date().toISOString(), userId);
        showDialog({
          confirmText: "OK",
          message: "Your journal and achievements are already synced.",
          title: "Already up to date",
          variant: "success",
        });
        return;
      }

      setSyncSuccess(new Date().toISOString(), userId);
      showDialog({
        confirmText: "Done",
        message: getSyncResultMessage(syncResult.pushedCount, restoredCount),
        subtitle: "Your journal and achievements are up to date.",
        title: "Sync complete",
        variant: "success",
      });
    } catch (error) {
      if (__DEV__) {
        console.warn("Two-way journal sync failed", error);
      }

      markEntriesSyncFailed(userId, pendingEntryIds);
      setSyncFailure(new Date().toISOString(), "Manual sync failed", userId);
      showDialog({
        confirmText: "OK",
        message:
          "We couldn't sync your journal right now. Please check your connection and try again.",
        title: "Sync failed",
        variant: "destructive",
      });
    } finally {
      setAchievementSyncUserId(null);
      setIsSyncing(false);
    }
  }

  function handleClearCurrentUserData() {
    if (isClearingData) {
      return;
    }

    const userId = user?.id;

    if (!userId) {
      showDialog({
        confirmText: "OK",
        message: "Please sign in before clearing journal data.",
        title: "Sign in required",
        variant: "destructive",
      });
      return;
    }

    showDialog({
      actions: [
        {
          onPress: () => {
            void clearCurrentUserData(userId);
          },
          text: "Clear Journal Data",
          variant: "destructive",
        },
      ],
      cancelText: "Cancel",
      message:
        "This will delete your local journal entries on this device. This cannot be undone.",
      showCancel: true,
      title: "Clear journal data?",
      variant: "destructive",
    });
  }

  async function clearCurrentUserData(userId: string) {
    setIsClearingData(true);

    try {
      await clearEntriesForUser(userId);
      showDialog({
        confirmText: "Done",
        message: "Your local journal entries were deleted from this device.",
        title: "Journal data cleared",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not clear local data. Please try again.";

      showDialog({
        confirmText: "OK",
        message,
        title: "Clear data failed",
        variant: "destructive",
      });
    } finally {
      setIsClearingData(false);
    }
  }

  function handleExportJournalPress() {
    if (isExportingJournal) {
      return;
    }

    if (!user?.id) {
      showDialog({
        confirmText: "OK",
        message: "Please sign in before exporting your journal.",
        title: "Sign in required",
      });
      return;
    }

    if (!hasHydrated) {
      showDialog({
        confirmText: "OK",
        message: "Your journal is still loading. Please try again in a moment.",
        title: "Journal loading",
      });
      return;
    }

    if (currentUserEntries.length === 0) {
      showDialog({
        confirmText: "OK",
        icon: "📝",
        message: "No entries to export.",
        title: "No entries to export",
      });
      return;
    }

    showDialog({
      actions: [
        {
          onPress: () => {
            void handleExportJournal("markdown");
          },
          text: "Export as Markdown",
          variant: "primary",
        },
        {
          onPress: () => {
            void handleExportJournal("json");
          },
          text: "Export as JSON",
          variant: "secondary",
        },
      ],
      cancelText: "Cancel",
      icon: "↓",
      message: "Choose how you want to export your local journal entries.",
      showCancel: true,
      title: "Export Journal",
    });
  }

  async function handleExportJournal(format: "json" | "markdown") {
    if (isExportingJournal) {
      return;
    }

    setIsExportingJournal(true);

    try {
      if (format === "markdown") {
        await exportJournalAsMarkdown(currentUserEntries);
        return;
      }

      await exportJournalAsJson(currentUserEntries);
    } catch (error) {
      if (!(error instanceof JournalExportError)) {
        console.warn("Journal export failed", error);
      }

      showExportErrorDialog(error);
    } finally {
      setIsExportingJournal(false);
    }
  }

  function showExportErrorDialog(error: unknown) {
    if (
      error instanceof JournalExportError &&
      error.code === "sharing-unavailable"
    ) {
      showDialog({
        confirmText: "OK",
        message: "Sharing is not available on this device.",
        title: "Sharing unavailable",
      });
      return;
    }

    showDialog({
      confirmText: "OK",
      message: "We couldn't create your journal export. Please try again.",
      title: "Export failed",
      variant: "destructive",
    });
  }

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home-tab");
  }

  function showComingSoon(label: string) {
    showDialog({
      confirmText: "OK",
      message: "Coming soon",
      title: label,
    });
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#FCE8F8", "#F8F3FC", "#FFFFFF"]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.48, 0.78]}
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
          paddingBottom: bottomNavHeight + 36,
          paddingHorizontal: 28,
          paddingTop: Math.max(66, insets.top + 34),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            onPress={handleBackPress}
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </Pressable>

          <Text className="text-[17px] font-semibold leading-6 text-[#27272A]">
            Profile
          </Text>

          <Pressable
            accessibilityLabel="Settings"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            onPress={() => showComingSoon("Settings")}
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="settings" size={22} color="#51515B" />
          </Pressable>
        </View>

        <View className="items-center pt-7">
          <View
            className="size-24 items-center justify-center rounded-full bg-[#F7DDF2]"
            style={{ boxShadow: "0 8px 24px rgba(229, 177, 222, 0.46)" }}
          >
            <Text className="text-[34px] font-bold leading-[40px] text-[#FF2056]">
              {profileInitial}
            </Text>
          </View>
          <Text className="mt-4 text-center text-[25px] font-bold leading-8 text-[#27272A]">
            {displayName}
          </Text>
          <Text className="mt-1 text-center text-[15px] leading-5 text-[#71717B]">
            {journalingSince}
          </Text>
        </View>

        <View className="flex-row gap-4 pt-7">
          {profileSummary.stats.map((stat) => (
            <View
              className="h-[116px] flex-1 items-center justify-center gap-1 rounded-[24px]"
              key={stat.label}
              style={{
                backgroundColor: stat.backgroundColor,
                boxShadow: "0 2px 5px rgba(39, 39, 42, 0.12)",
              }}
            >
              <Text className="text-[26px] leading-5">{stat.emoji}</Text>
              <Text className="text-[24px] font-bold leading-5 text-[#27272A]">
                {stat.value}
              </Text>
              <Text className="text-[13px] font-medium leading-5 text-[#71717B]">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="pt-9">
          <SectionTitle>Your Emotional Snapshot</SectionTitle>
          <View
            className="mt-5 rounded-[24px] bg-white px-6 py-6"
            style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
          >
            {profileSummary.insights.map((insight, index) => (
              <View key={insight.label}>
                <View className="flex-row items-center gap-5">
                  <View className="size-11 items-center justify-center">
                    <Text className="text-[23px] leading-8">
                      {insight.emoji}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] font-medium leading-4 text-[#71717B]">
                      {insight.label}
                    </Text>
                    <Text className="mt-1 text-[17px] font-semibold leading-6 text-[#27272A]">
                      {insight.value}
                    </Text>
                  </View>
                </View>
                {index < profileSummary.insights.length - 1 ? (
                  <View className="my-5 h-px bg-transparent" />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View className="pt-10">
          <View className="flex-row items-end justify-between gap-4">
            <View>
              <SectionTitle>Achievements</SectionTitle>
              <Text className="mt-1 text-[14px] font-medium leading-5 text-[#71717B]">
                {hasHydrated
                  ? `${profileSummary.unlockedAchievementCount} / ${profileSummary.totalAchievementCount} unlocked`
                  : "Loading achievements..."}
              </Text>
            </View>

            <Link href={achievementsHref} asChild>
              <Pressable accessibilityRole="button" className="px-2 py-1">
                <Text className="text-[16px] font-bold leading-5 text-[#FF2056]">
                  See all
                </Text>
              </Pressable>
            </Link>
          </View>

          <View className="mt-5 gap-3.5">
            {profileSummary.achievementPreview.length > 0 ? (
              profileSummary.achievementPreview.map((achievement) => (
              <View
                className="min-h-[95px] flex-row items-center gap-4 rounded-[24px] px-5 py-4"
                key={achievement.id}
                style={{
                  backgroundColor: getAchievementBackgroundColor(
                    achievement.category,
                  ),
                  boxShadow: "0 2px 5px rgba(39, 39, 42, 0.11)",
                }}
              >
                <View className="size-14 items-center justify-center rounded-[17px] bg-white/75">
                  <Text className="text-[27px] leading-8">
                    {achievement.icon}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-semibold leading-5 text-[#27272A]">
                    {achievement.title}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
                    {achievement.description}
                  </Text>
                </View>
              </View>
              ))
            ) : (
              <View
                className="min-h-[95px] flex-row items-center gap-4 rounded-[24px] bg-[#F4F4F5] px-5 py-4"
                style={{ boxShadow: "0 2px 5px rgba(39, 39, 42, 0.11)" }}
              >
                <View className="size-14 items-center justify-center rounded-[17px] bg-white/75">
                  <Text className="text-[27px] leading-8">🌱</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-semibold leading-5 text-[#27272A]">
                    First Reflection
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
                    Your first achievement is waiting for your next entry.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <MenuSection
          items={preferenceItems}
          onItemPress={(item) => {
            if (item.label === "Notifications") {
              router.push(profileNotificationsHref);
              return;
            }

            showComingSoon(item.label);
          }}
          title="Preferences"
        />
        <MenuSection
          disabledItemLabels={isSyncing ? [cloudSyncItemLabel] : undefined}
          items={accountMenuItems}
          loadingItemLabel={isSyncing ? cloudSyncItemLabel : undefined}
          onItemPress={(item) => {
            if (item.label === cloudSyncItemLabel) {
              void handleSyncNow();
              return;
            }

            if (item.label === "Export Journal") {
              handleExportJournalPress();
              return;
            }

            if (item.label === "Clear My Journal Data") {
              handleClearCurrentUserData();
              return;
            }

            showComingSoon(item.label);
          }}
          title="Account"
        />

        <View className="items-center pt-9">
          <Pressable
            accessibilityRole="button"
            className="min-h-10 flex-row items-center justify-center gap-2 px-5"
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Feather name="log-out" size={17} color={colors.primary} />
            )}
            <Text className="text-[15px] font-semibold leading-5 text-[#FF2056]">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Profile" />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-[21px] font-bold leading-7 text-[#27272A]">
      {children}
    </Text>
  );
}

function MenuSection({
  disabledItemLabels,
  items,
  loadingItemLabel,
  onItemPress,
  title,
}: {
  disabledItemLabels?: string[];
  items: ProfileMenuItem[];
  loadingItemLabel?: string;
  onItemPress: (item: ProfileMenuItem) => void;
  title: string;
}) {
  const disabledItemLabelSet = new Set(disabledItemLabels);

  return (
    <View className="pt-10">
      <SectionTitle>{title}</SectionTitle>
      <View
        className="mt-5 rounded-[24px] bg-white p-2"
        style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
      >
        {items.map((item, index) => (
          <View key={item.label}>
            <Pressable
              accessibilityState={{
                disabled: disabledItemLabelSet.has(item.label),
              }}
              accessibilityRole="button"
              className="min-h-[58px] flex-row items-center justify-between gap-3 rounded-[18px] p-3"
              disabled={disabledItemLabelSet.has(item.label)}
              onPress={() => onItemPress(item)}
            >
              <View className="flex-1 flex-row items-center gap-4">
                <View
                  className="size-10 items-center justify-center rounded-[13px]"
                  style={{ backgroundColor: item.backgroundColor }}
                >
                  <MenuIcon item={item} />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-medium leading-5 text-[#27272A]">
                    {item.label}
                  </Text>
                  {item.subtitle ? (
                    <Text className="mt-0.5 text-[12px] leading-4 text-[#A1A1AA]">
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>

              {item.badge ? (
                <View className="rounded-full bg-[#FF2056] px-3 py-1">
                  <Text className="text-[10px] font-semibold leading-3 text-white">
                    {item.badge}
                  </Text>
                </View>
              ) : item.label === loadingItemLabel ? (
                <ActivityIndicator color={colors.iconMuted} size="small" />
              ) : (
                <Feather
                  name="chevron-right"
                  size={22}
                  color={colors.iconMuted}
                />
              )}
            </Pressable>

            {index < items.length - 1 ? (
              <View className="mx-3 h-px bg-[#E4E4E7]" />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function MenuIcon({ item }: { item: ProfileMenuItem }) {
  if (item.iconSet === "ionicons") {
    return <Ionicons name={item.icon} size={21} color={item.iconColor} />;
  }

  if (item.iconSet === "material-community") {
    return (
      <MaterialCommunityIcons
        name={item.icon}
        size={21}
        color={item.iconColor}
      />
    );
  }

  return <Feather name={item.icon} size={21} color={item.iconColor} />;
}

function getSyncResultMessage(pushedCount: number, restoredCount: number) {
  const backedUpLabel = pushedCount === 1 ? "entry" : "entries";
  const restoredLabel = restoredCount === 1 ? "update" : "updates";

  return `Backed up ${pushedCount} ${backedUpLabel} and restored ${restoredCount} ${restoredLabel}.`;
}

function getDisplayName({
  emailAddress,
  firstName,
  fullName,
}: {
  emailAddress?: string;
  firstName?: string | null;
  fullName?: string | null;
}) {
  const name = fullName?.trim() || firstName?.trim();

  if (name) {
    return name;
  }

  const emailName = emailAddress?.split("@")[0]?.trim();

  return emailName || "DearDiary Friend";
}

function getSyncStatusLabel({
  isSyncing,
  lastSyncFailedAt,
  lastSyncedAt,
}: {
  isSyncing: boolean;
  lastSyncFailedAt: string | null;
  lastSyncedAt: string | null;
}) {
  if (isSyncing) {
    return "Syncing...";
  }

  if (
    lastSyncFailedAt &&
    (!lastSyncedAt ||
      Date.parse(lastSyncFailedAt) > Date.parse(lastSyncedAt))
  ) {
    return "Last sync failed";
  }

  if (!lastSyncedAt) {
    return "Not synced yet";
  }

  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(lastSyncedAt)) / (60 * 1000)),
  );

  if (elapsedMinutes < 1) {
    return "Last synced just now";
  }

  if (elapsedMinutes < 60) {
    return `Last synced ${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `Last synced ${elapsedHours} hr ago`;
  }

  return `Last synced ${new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(new Date(lastSyncedAt))}`;
}

function getProfileSummary(entries: JournalEntry[], hasHydrated: boolean) {
  if (!hasHydrated) {
    return {
      achievementPreview: [],
      insights: getLoadingInsights(),
      stats: getLoadingStats(),
      totalAchievementCount: achievementDefinitions.length,
      unlockedAchievementCount: 0,
    };
  }

  const entryCount = entries.length;
  const streak = getReflectionStreak(entries);
  const achievements = getAchievements(entries, streak);
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  );
  const uniqueMoodCount = new Set(
    entries.flatMap((entry) => (entry.mood ? [entry.mood] : [])),
  ).size;
  const mostCommonMood = getMostCommonMood(entries);
  const averageReflectionMinutes = getAverageReflectionMinutes(entries);

  return {
    achievementPreview: unlockedAchievements.slice(-3).reverse(),
    insights: [
      {
        emoji: mostCommonMood ? moodEmoji[mostCommonMood] : "😌",
        label: "Most Common Mood",
        value: mostCommonMood ? moodLabels[mostCommonMood] : "No moods yet",
      },
      {
        emoji: "⏱️",
        label: "Average Reflection Time",
        value:
          averageReflectionMinutes > 0
            ? `${averageReflectionMinutes} min/entry`
            : "No entries yet",
      },
    ],
    stats: [
      {
        backgroundColor: "#F0DDFB",
        emoji: "📝",
        label: "Entries",
        value: String(entryCount),
      },
      {
        backgroundColor: "#FFE1EE",
        emoji: "🔥",
        label: "Streak",
        value: String(streak),
      },
      {
        backgroundColor: "#D8F3E2",
        emoji: "😊",
        label: "Moods",
        value: String(uniqueMoodCount),
      },
    ],
    totalAchievementCount: achievements.length,
    unlockedAchievementCount: unlockedAchievements.length,
  };
}

function getLoadingStats(): ProfileStat[] {
  return [
    {
      backgroundColor: "#F0DDFB",
      emoji: "📝",
      label: "Entries",
      value: "…",
    },
    {
      backgroundColor: "#FFE1EE",
      emoji: "🔥",
      label: "Streak",
      value: "…",
    },
    {
      backgroundColor: "#D8F3E2",
      emoji: "😊",
      label: "Moods",
      value: "…",
    },
  ];
}

function getLoadingInsights(): ProfileInsight[] {
  return [
    {
      emoji: "😌",
      label: "Most Common Mood",
      value: "Loading...",
    },
    {
      emoji: "⏱️",
      label: "Average Reflection Time",
      value: "Loading...",
    },
  ];
}

function getJournalingSinceLabel(entries: JournalEntry[], hasHydrated: boolean) {
  if (!hasHydrated) {
    return "Loading journal history...";
  }

  if (entries.length === 0) {
    return "Start your journaling journey 🌸";
  }

  const firstEntry = entries.reduce((earliestEntry, entry) =>
    new Date(entry.createdAt).getTime() <
    new Date(earliestEntry.createdAt).getTime()
      ? entry
      : earliestEntry,
  );
  const firstEntryDate = new Date(firstEntry.createdAt);
  const label = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(firstEntryDate);

  return `Journaling since ${label} 🌸`;
}

function getMostCommonMood(entries: JournalEntry[]) {
  const moodCounts = entries.reduce<Partial<Record<MoodId, number>>>(
    (counts, entry) => {
      if (!entry.mood) {
        return counts;
      }

      counts[entry.mood] = (counts[entry.mood] ?? 0) + 1;
      return counts;
    },
    {},
  );

  return Object.entries(moodCounts).reduce<MoodId | null>(
    (currentMood, [mood, count]) => {
      if (!currentMood) {
        return mood as MoodId;
      }

      return count > (moodCounts[currentMood] ?? 0)
        ? (mood as MoodId)
        : currentMood;
    },
    null,
  );
}

function getAverageReflectionMinutes(entries: JournalEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  const totalWords = entries.reduce(
    (sum, entry) => sum + getWordCount(entry.content),
    0,
  );
  const averageWords = totalWords / entries.length;

  return Math.max(1, Math.round(averageWords / 35));
}

function getReflectionStreak(entries: JournalEntry[]) {
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

function getAchievementBackgroundColor(category: AchievementCategory) {
  switch (category) {
    case "depth":
      return "#D8F0FE";
    case "intention":
      return "#FFF0D8";
    case "journaling":
      return "#F0DDFB";
    case "mood":
      return "#D8F3E2";
    case "reflection":
      return "#FFE1EE";
    case "streak":
      return "#FFDDE8";
  }
}
