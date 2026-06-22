import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { SyncStatusIndicator } from "@/components/sync/SyncStatusIndicator";
import type { SyncStatusSnapshot } from "@/types/syncStatus";

type SyncStatusRowProps = {
  isRetrying?: boolean;
  onRetry: () => void;
  snapshot: SyncStatusSnapshot;
};

export function SyncStatusRow({
  isRetrying = false,
  onRetry,
  snapshot,
}: SyncStatusRowProps) {
  const copy = getSyncStatusCopy(snapshot);
  const showRetry = snapshot.canRetry && !isRetrying;

  return (
    <View
      className="rounded-[24px] bg-white p-5"
      style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
    >
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[18px] font-bold leading-6 text-text-primary">
            Data & Sync
          </Text>
          <Text className="mt-1 text-[14px] leading-6 text-text-muted">
            {copy.description}
          </Text>
        </View>
        <SyncStatusIndicator status={snapshot.status} />
      </View>

      <View className="mt-5 gap-3">
        <StatusDetail label="Sync status" value={copy.title} />
        {snapshot.lastSuccessfulSyncAt ? (
          <StatusDetail
            label="Last synced"
            value={formatSyncTime(snapshot.lastSuccessfulSyncAt)}
          />
        ) : null}
        {snapshot.pendingCount > 0 ? (
          <StatusDetail
            label="Pending changes"
            value={`${snapshot.pendingCount} ${snapshot.pendingCount === 1 ? "change" : "changes"}`}
          />
        ) : null}
      </View>

      {showRetry || isRetrying ? (
        <Pressable
          accessibilityLabel={isRetrying ? "Syncing..." : copy.retryLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: isRetrying }}
          className="mt-5 min-h-[50px] flex-row items-center justify-center gap-2 rounded-full bg-brand-primary px-5"
          disabled={isRetrying}
          onPress={onRetry}
        >
          {isRetrying ? <ActivityIndicator color="white" size="small" /> : null}
          <Text className="text-[15px] font-bold leading-5 text-white">
            {isRetrying ? "Syncing..." : copy.retryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text className="text-[13px] font-medium leading-5 text-text-muted">
        {label}
      </Text>
      <Text className="flex-1 text-right text-[13px] font-semibold leading-5 text-text-primary">
        {value}
      </Text>
    </View>
  );
}

function getSyncStatusCopy(snapshot: SyncStatusSnapshot) {
  if (snapshot.status === "paused") {
    return {
      description: "Sync is paused while account deletion is in progress.",
      retryLabel: "Retry",
      title: "Paused",
    };
  }

  if (snapshot.status === "syncing") {
    return {
      description:
        snapshot.pendingCount > 0
          ? `${snapshot.pendingCount} changes remaining.`
          : "Checking for updates.",
      retryLabel: "Sync now",
      title: "Syncing...",
    };
  }

  if (snapshot.status === "waiting_for_network") {
    return {
      description: `${snapshot.pendingCount} ${snapshot.pendingCount === 1 ? "change is" : "changes are"} safely stored on this device.`,
      retryLabel: "Retry",
      title: "Waiting for internet",
    };
  }

  if (snapshot.status === "failed") {
    return {
      description:
        "Your changes remain saved on this device. Cloud sync will retry when it can.",
      retryLabel: "Retry",
      title: "Cloud sync needs attention",
    };
  }

  if (snapshot.status === "saved_locally") {
    return {
      description: "Cloud sync will begin shortly.",
      retryLabel: "Sync now",
      title: "Saved on this device",
    };
  }

  if (snapshot.status === "synced") {
    return {
      description: "Your journal and achievements are up to date.",
      retryLabel: "Sync now",
      title: "Synced",
    };
  }

  return {
    description: "DearDiary will sync after you create or update entries.",
    retryLabel: "Sync now",
    title: "No changes waiting",
  };
}

function formatSyncTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(new Date(timestamp));
}
