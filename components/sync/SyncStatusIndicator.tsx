import { CheckCircle2, Cloud, CloudOff, Loader2, PauseCircle } from "lucide-react-native";
import { Text, View } from "react-native";

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
    backgroundColor: "#FFE8F0",
    color: "#BE123C",
    label: "Sync failed",
  },
  idle: {
    backgroundColor: "#F4F4F5",
    color: "#71717B",
    label: "Checking",
  },
  paused: {
    backgroundColor: "#F4F4F5",
    color: "#71717B",
    label: "Paused",
  },
  saved_locally: {
    backgroundColor: "#F4EFFA",
    color: "#6D28D9",
    label: "Saved locally",
  },
  synced: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    label: "Synced",
  },
  syncing: {
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
    label: "Syncing",
  },
  waiting_for_network: {
    backgroundColor: "#FFF7ED",
    color: "#C2410C",
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
