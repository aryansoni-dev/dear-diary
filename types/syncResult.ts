import type { AppErrorCode } from "@/types/appError";

export type SyncResult =
  | {
      completedAt: string;
      conflictsResolved: number;
      pulled: number;
      pushed: number;
      success: true;
    }
  | {
      code: AppErrorCode;
      localDataPreserved: boolean;
      retryable: boolean;
      success: false;
    };
