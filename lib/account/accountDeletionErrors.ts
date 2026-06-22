import type { AccountDeletionFailureCode } from "@/types/accountDeletion";

export function getAccountDeletionFailureMessage(
  code: AccountDeletionFailureCode,
) {
  switch (code) {
    case "network_unavailable":
      return "You need an internet connection to permanently delete your account. Your account has not been deleted.";
    case "remote_data_deletion_failed":
      return "We couldn't delete your account data yet. Nothing has been reported as completed. Please try again.";
    case "auth_account_deletion_failed":
      return "Your DearDiary data was removed, but your sign-in account could not be closed. Please retry account removal or contact support.";
    case "verification_required":
      return "Please finish the required account verification, then try deleting your account again.";
    case "already_in_progress":
      return "Account deletion is already in progress. Please keep DearDiary open.";
    case "local_cleanup_failed":
      return "Your account deletion reached local cleanup, but some device data could not be cleared. Please try again before using another account.";
    case "unauthenticated":
      return "Please sign in before deleting your account.";
    case "unknown":
      return "We couldn't delete your account right now. Please try again.";
  }
}
