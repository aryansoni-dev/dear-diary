import type { UserSyncStatus } from "@/types/syncStatus";

export const colors = {
  brandPrimary: "#FF2056",
  errorSurface: "#FFF1F5",
  errorText: "#9F1239",
  legalBackground: "#FFF7FB",
  legalCard: "#FFFFFF",
  legalGradientEnd: "#FFFFFF",
  legalGradientStart: "#FFF4FA",
  offlineIcon: "#C2410C",
  offlineSurface: "#FFF7ED",
  offlineText: "#9A3412",
  textMuted: "#71717B",
  textPrimary: "#27272A",
  textSecondary: "#51515B",
} as const;

export const CONNECTION_STATE_COLORS = {
  offline: {
    background: colors.offlineSurface,
    dot: "#F97316",
    text: colors.offlineIcon,
  },
  online: {
    background: "#CFF8E6",
    dot: "#10B981",
    text: "#047857",
  },
} as const;

export const SYNC_STATUS_COLORS: Record<
  UserSyncStatus,
  {
    background: string;
    text: string;
  }
> = {
  failed: {
    background: "#FFE8F0",
    text: "#BE123C",
  },
  idle: {
    background: "#F4F4F5",
    text: colors.textMuted,
  },
  paused: {
    background: "#F4F4F5",
    text: colors.textMuted,
  },
  saved_locally: {
    background: "#F4EFFA",
    text: "#6D28D9",
  },
  synced: {
    background: "#DCFCE7",
    text: "#15803D",
  },
  syncing: {
    background: "#E0F2FE",
    text: "#0369A1",
  },
  waiting_for_network: {
    background: colors.offlineSurface,
    text: colors.offlineIcon,
  },
};
