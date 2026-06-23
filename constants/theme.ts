import type { UserSyncStatus } from "@/types/syncStatus";

export const colors = {
  brandPrimary: "#FF2056",
  errorSurface: "#FFF1F5",
  errorText: "#9F1239",
  legalBackground: "#FFF7FB",
  legalCard: "#FFFFFF",
  legalGradientEnd: "#FFFFFF",
  legalGradientStart: "#FFF4FA",
  onlineIcon: "#10B981",
  onlineSurface: "#CFF8E6",
  onlineText: "#047857",
  offlineIcon: "#C2410C",
  offlineIndicator: "#F97316",
  offlineSurface: "#FFF7ED",
  offlineText: "#9A3412",
  syncFailedSurface: "#FFE8F0",
  syncFailedText: "#BE123C",
  syncIdleSurface: "#F4F4F5",
  syncSavedLocallySurface: "#F4EFFA",
  syncSavedLocallyText: "#6D28D9",
  syncSyncedSurface: "#DCFCE7",
  syncSyncedText: "#15803D",
  syncSyncingSurface: "#E0F2FE",
  syncSyncingText: "#0369A1",
  textMuted: "#71717B",
  textPrimary: "#27272A",
  textSecondary: "#51515B",
} as const;

export const CONNECTION_STATE_COLORS = {
  offline: {
    background: colors.offlineSurface,
    dot: colors.offlineIndicator,
    text: colors.offlineIcon,
  },
  online: {
    background: colors.onlineSurface,
    dot: colors.onlineIcon,
    text: colors.onlineText,
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
    background: colors.syncFailedSurface,
    text: colors.syncFailedText,
  },
  idle: {
    background: colors.syncIdleSurface,
    text: colors.textMuted,
  },
  paused: {
    background: colors.syncIdleSurface,
    text: colors.textMuted,
  },
  saved_locally: {
    background: colors.syncSavedLocallySurface,
    text: colors.syncSavedLocallyText,
  },
  synced: {
    background: colors.syncSyncedSurface,
    text: colors.syncSyncedText,
  },
  syncing: {
    background: colors.syncSyncingSurface,
    text: colors.syncSyncingText,
  },
  waiting_for_network: {
    background: colors.offlineSurface,
    text: colors.offlineIcon,
  },
};
