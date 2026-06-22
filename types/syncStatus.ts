import type { AppErrorCode } from "@/types/appError";

export type UserSyncStatus =
  | "idle"
  | "saved_locally"
  | "waiting_for_network"
  | "syncing"
  | "synced"
  | "failed"
  | "paused";

export type SyncStatusSnapshot = {
  canRetry: boolean;
  errorCode: AppErrorCode | null;
  failedCount: number;
  lastAttemptAt: string | null;
  lastSuccessfulSyncAt: string | null;
  pendingCount: number;
  status: UserSyncStatus;
};
