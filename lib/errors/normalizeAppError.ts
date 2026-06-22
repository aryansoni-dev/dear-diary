import type {
  AppError,
  AppErrorCategory,
  AppErrorCode,
  AppErrorSeverity,
} from "@/types/appError";

type NormalizeContext = {
  fallbackMessage?: string;
  operation?: string;
};

type ErrorShape = {
  code?: unknown;
  message?: unknown;
  name?: unknown;
  status?: unknown;
};

export const normalizeAppError = (
  error: unknown,
  context?: NormalizeContext,
): AppError => {
  const shape = getErrorShape(error);
  const message = getLowercaseMessage(shape);
  const code = typeof shape?.code === "string" ? shape.code : "";
  const status = typeof shape?.status === "number" ? shape.status : null;
  const operation = context?.operation;

  if (isOfflineError(message, code)) {
    return createAppError({
      category: "network",
      code: "offline",
      error,
      operation,
      retryable: true,
      severity: "warning",
      userMessage:
        "You are offline. Your journal changes will stay on this device and sync when you reconnect.",
    });
  }

  if (isTimeoutError(message, code)) {
    return createAppError({
      category: "network",
      code: "request_timeout",
      error,
      operation,
      retryable: true,
      severity: "warning",
      userMessage:
        "The request took too long. Please check your connection and try again.",
    });
  }

  if (status === 401 || message.includes("jwt") || message.includes("session")) {
    return createAppError({
      category: "authentication",
      code: "session_expired",
      error,
      operation,
      retryable: false,
      severity: "warning",
      userMessage: "Your session has expired. Please sign in again.",
    });
  }

  if (status === 403 || code === "42501" || message.includes("permission")) {
    return createAppError({
      category: "authorization",
      code: "permission_denied",
      error,
      operation,
      retryable: false,
      severity: "error",
      userMessage:
        "DearDiary could not access this data. Please sign in again and try once more.",
    });
  }

  if (status === 404 || code === "PGRST116" || message.includes("not found")) {
    return createAppError({
      category: "not_found",
      code: "resource_not_found",
      error,
      operation,
      retryable: false,
      severity: "warning",
      userMessage: "This item could not be found.",
    });
  }

  if (status === 429 || message.includes("rate limit")) {
    return createAppError({
      category: "rate_limit",
      code: "rate_limited",
      error,
      operation,
      retryable: true,
      severity: "warning",
      userMessage: "DearDiary is receiving too many requests. Please try again shortly.",
    });
  }

  if (operation?.includes("local_save") || message.includes("asyncstorage")) {
    return createAppError({
      category: "local_storage",
      code: "local_save_failed",
      error,
      operation,
      retryable: true,
      severity: "error",
      userMessage:
        "We could not save this entry on your device. Please try again before leaving this screen.",
    });
  }

  if (operation?.includes("ai")) {
    return createAppError({
      category: "ai",
      code: "ai_unavailable",
      error,
      operation,
      retryable: true,
      severity: "warning",
      userMessage:
        "DearDiary could not complete this reflection right now. Your journal entry is safe.",
    });
  }

  if (operation?.includes("sync")) {
    return createAppError({
      category: "sync",
      code: "sync_failed",
      error,
      operation,
      retryable: true,
      severity: "warning",
      userMessage:
        "Your changes are saved on this device, but cloud sync could not finish. We will try again automatically.",
    });
  }

  return createAppError({
    category: "unknown",
    code: "unexpected_error",
    error,
    operation,
    retryable: true,
    severity: "error",
    userMessage:
      context?.fallbackMessage ??
      "Something unexpected happened. Your locally saved journal data is still available.",
  });
};

function createAppError({
  category,
  code,
  error,
  operation,
  retryable,
  severity,
  userMessage,
}: {
  category: AppErrorCategory;
  code: AppErrorCode;
  error: unknown;
  operation?: string;
  retryable: boolean;
  severity: AppErrorSeverity;
  userMessage: string;
}): AppError {
  return {
    category,
    cause: error,
    code,
    operation,
    retryable,
    severity,
    userMessage,
  };
}

function getErrorShape(error: unknown): ErrorShape | null {
  return isRecord(error) ? error : null;
}

function getLowercaseMessage(shape: ErrorShape | null) {
  return typeof shape?.message === "string" ? shape.message.toLowerCase() : "";
}

function isOfflineError(message: string, code: string) {
  return (
    code === "offline" ||
    code === "NETWORK_ERROR" ||
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("offline")
  );
}

function isTimeoutError(message: string, code: string) {
  return (
    code === "request_timeout" ||
    code === "ETIMEDOUT" ||
    code === "ECONNABORTED" ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
