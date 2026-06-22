export type AccountDeletionStage =
  | "idle"
  | "verifying"
  | "deleting_remote_data"
  | "deleting_auth_account"
  | "clearing_local_data"
  | "completed"
  | "failed";

export type AccountDeletionFailureCode =
  | "unauthenticated"
  | "verification_required"
  | "remote_data_deletion_failed"
  | "auth_account_deletion_failed"
  | "local_cleanup_failed"
  | "network_unavailable"
  | "already_in_progress"
  | "unknown";

export type AccountDeletionResult =
  | {
      requestId: string;
      success: true;
    }
  | {
      code: AccountDeletionFailureCode;
      remoteDataDeleted?: boolean;
      requestId?: string;
      retryable: boolean;
      success: false;
    };

export type DeleteAccountFunctionResponse = AccountDeletionResult;
