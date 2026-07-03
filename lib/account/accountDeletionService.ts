import { clearLocalUserData } from "@/lib/account/clearLocalUserData";
import { getPublicEnvironment } from "@/lib/environment";
import { setSupabaseAccessTokenProvider } from "@/lib/supabase";
import { isRecord } from "@/lib/utils/typeGuards";
import { useAccountDeletionStore } from "@/store/useAccountDeletionStore";
import type {
  AccountDeletionFailureCode,
  AccountDeletionResult,
  DeleteAccountFunctionResponse,
} from "@/types/accountDeletion";

type GetToken = () => Promise<string | null>;
type AccountDeletionFailureResult = Extract<
  AccountDeletionResult,
  { success: false }
>;

type DeleteCurrentAccountParams = {
  confirmationPhrase: string;
  getToken: GetToken;
  signOut: () => Promise<unknown>;
  userId: string | null | undefined;
};

const expectedConfirmationPhrase = "DELETE";
const deleteAccountRequestTimeoutMs = 30000;
const publicEnvironment = getPublicEnvironment();

export async function deleteCurrentAccount({
  confirmationPhrase,
  getToken,
  signOut,
  userId,
}: DeleteCurrentAccountParams): Promise<AccountDeletionResult> {
  const deletionStore = useAccountDeletionStore.getState();

  if (
    deletionStore.deletionInProgress &&
    deletionStore.failureCode !== "auth_account_deletion_failed"
  ) {
    return {
      code: "already_in_progress",
      retryable: false,
      success: false,
    };
  }

  if (!userId) {
    return {
      code: "unauthenticated",
      retryable: false,
      success: false,
    };
  }

  if (confirmationPhrase !== expectedConfirmationPhrase) {
    return {
      code: "verification_required",
      retryable: false,
      success: false,
    };
  }

  deletionStore.beginDeletion();
  setSupabaseAccessTokenProvider(() => getToken());

  try {
    deletionStore.setStage("deleting_remote_data");
    const response = await invokeDeleteAccountFunction({
      confirmationPhrase,
      getToken,
    });

    if (!response.success) {
      if (response.remoteDataDeleted) {
        deletionStore.setStage("clearing_local_data");
        try {
          await clearLocalUserData(userId);
        } catch {
          return failLocalCleanupAfterRemoteDeletion(
            deletionStore,
            response.requestId,
          );
        }
        deletionStore.failDeletion(response.code, {
          keepGuardActive: response.code === "auth_account_deletion_failed",
          requestId: response.requestId,
        });
      } else {
        deletionStore.failDeletion(response.code, {
          requestId: response.requestId,
        });
      }

      return response;
    }

    deletionStore.setStage("clearing_local_data");
    try {
      await clearLocalUserData(userId);
    } catch {
      return failLocalCleanupAfterRemoteDeletion(
        deletionStore,
        response.requestId,
      );
    }

    try {
      await signOut();
    } catch {
      // The Clerk account may already be deleted. Local data cleanup is complete.
    }

    deletionStore.completeDeletion(response.requestId);

    return response;
  } catch (error) {
    const result = getDeletionErrorResult(error);

    deletionStore.failDeletion(result.code, {
      requestId: result.requestId,
    });

    return result;
  } finally {
    setSupabaseAccessTokenProvider(null);
  }
}

async function invokeDeleteAccountFunction({
  confirmationPhrase,
  getToken,
}: {
  confirmationPhrase: string;
  getToken: GetToken;
}): Promise<DeleteAccountFunctionResponse> {
  const supabaseUrl = publicEnvironment?.supabaseUrl;
  const supabaseAnonKey = publicEnvironment?.supabasePublicKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      code: "remote_data_deletion_failed",
      retryable: true,
      success: false,
    };
  }

  const token = await getToken();

  if (!token) {
    return {
      code: "unauthenticated",
      retryable: false,
      success: false,
    };
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, deleteAccountRequestTimeoutMs);

  let response: Response;

  try {
    response = await fetch(`${supabaseUrl}/functions/v1/delete-account`, {
      body: JSON.stringify({ confirmationPhrase }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
      },
      method: "POST",
      signal: abortController.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const data: unknown = await response.json().catch(() => null);

  if (isDeleteAccountFunctionResponse(data)) {
    return data;
  }

  return {
    code: response.ok ? "unknown" : "remote_data_deletion_failed",
    retryable: true,
    success: false,
  };
}

function getDeletionErrorResult(error: unknown): AccountDeletionFailureResult {
  if (error instanceof TypeError || isAbortError(error)) {
    return {
      code: "network_unavailable",
      retryable: true,
      success: false,
    };
  }

  return {
    code: "unknown",
    retryable: true,
    success: false,
  };
}

function failLocalCleanupAfterRemoteDeletion(
  deletionStore: ReturnType<typeof useAccountDeletionStore.getState>,
  requestId: string | undefined,
): AccountDeletionFailureResult {
  deletionStore.failDeletion("local_cleanup_failed", {
    keepGuardActive: true,
    requestId,
  });

  return {
    code: "local_cleanup_failed",
    remoteDataDeleted: true,
    requestId,
    retryable: true,
    success: false,
  };
}

function isDeleteAccountFunctionResponse(
  value: unknown,
): value is DeleteAccountFunctionResponse {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return false;
  }

  if (value.success) {
    return typeof value.requestId === "string";
  }

  return (
    isAccountDeletionFailureCode(value.code) &&
    typeof value.retryable === "boolean" &&
    (value.requestId === undefined || typeof value.requestId === "string") &&
    (value.remoteDataDeleted === undefined ||
      typeof value.remoteDataDeleted === "boolean")
  );
}

function isAbortError(error: unknown) {
  return (
    isRecord(error) &&
    error.name === "AbortError"
  );
}

function isAccountDeletionFailureCode(
  value: unknown,
): value is AccountDeletionFailureCode {
  return (
    value === "unauthenticated" ||
    value === "verification_required" ||
    value === "remote_data_deletion_failed" ||
    value === "auth_account_deletion_failed" ||
    value === "local_cleanup_failed" ||
    value === "network_unavailable" ||
    value === "already_in_progress" ||
    value === "unknown"
  );
}
