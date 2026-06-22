import { CheckCircle2, Cloud, CloudOff, Loader2, PauseCircle } from "lucide-react-native";
import { Text, View } from "react-native";

import { SYNC_STATUS_COLORS } from "@/constants/theme";
import type { UserSyncStatus } from "@/types/syncStatus";

type SyncStatusIndicatorProps = {
  status: UserSyncStatus;
};

const statusTheme: Record<
  UserSyncStatus,
  {
    backgroundColor: string;
    color: string;
    label: string;
  }
> = {
  failed: {
    backgroundColor: SYNC_STATUS_COLORS.failed.background,
    color: SYNC_STATUS_COLORS.failed.text,
    label: "Sync failed",
  },
  idle: {
    backgroundColor: SYNC_STATUS_COLORS.idle.background,
    color: SYNC_STATUS_COLORS.idle.text,
    label: "Checking",
  },
  paused: {
    backgroundColor: SYNC_STATUS_COLORS.paused.background,
    color: SYNC_STATUS_COLORS.paused.text,
    label: "Paused",
  },
  saved_locally: {
    backgroundColor: SYNC_STATUS_COLORS.saved_locally.background,
    color: SYNC_STATUS_COLORS.saved_locally.text,
    label: "Saved locally",
  },
  synced: {
    backgroundColor: SYNC_STATUS_COLORS.synced.background,
    color: SYNC_STATUS_COLORS.synced.text,
    label: "Synced",
  },
  syncing: {
    backgroundColor: SYNC_STATUS_COLORS.syncing.background,
    color: SYNC_STATUS_COLORS.syncing.text,
    label: "Syncing",
  },
  waiting_for_network: {
    backgroundColor: SYNC_STATUS_COLORS.waiting_for_network.background,
    color: SYNC_STATUS_COLORS.waiting_for_network.text,
    label: "Waiting",
  },
};

export function SyncStatusIndicator({ status }: SyncStatusIndicatorProps) {
  const theme = statusTheme[status];
  const icon = getStatusIcon(status, theme.color);

  return (
    <View
      className="min-h-8 flex-row items-center gap-2 rounded-full px-3 py-1.5"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {icon}
      <Text
        className="text-[12px] font-bold leading-4"
        style={{ color: theme.color }}
      >
        {theme.label}
      </Text>
    </View>
  );
}

function getStatusIcon(status: UserSyncStatus, color: string) {
  if (status === "synced") {
    return <CheckCircle2 color={color} size={15} strokeWidth={2.4} />;
  }

  if (status === "syncing") {
    return <Loader2 color={color} size={15} strokeWidth={2.4} />;
  }

  if (status === "waiting_for_network" || status === "failed") {
    return <CloudOff color={color} size={15} strokeWidth={2.4} />;
  }

  if (status === "paused") {
    return <PauseCircle color={color} size={15} strokeWidth={2.4} />;
  }

  return <Cloud color={color} size={15} strokeWidth={2.4} />;
}
