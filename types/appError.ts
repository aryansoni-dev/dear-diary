export type AppErrorCategory =
  | "network"
  | "authentication"
  | "authorization"
  | "local_storage"
  | "sync"
  | "ai"
  | "validation"
  | "rate_limit"
  | "server"
  | "not_found"
  | "unknown";

export type AppErrorSeverity = "info" | "warning" | "error" | "fatal";

export type AppErrorCode =
  | "offline"
  | "request_timeout"
  | "session_expired"
  | "permission_denied"
  | "local_save_failed"
  | "sync_failed"
  | "sync_conflict"
  | "ai_unavailable"
  | "rate_limited"
  | "invalid_data"
  | "resource_not_found"
  | "unexpected_error";

export type AppError = {
  category: AppErrorCategory;
  cause?: unknown;
  code: AppErrorCode;
  operation?: string;
  retryable: boolean;
  severity: AppErrorSeverity;
  userMessage: string;
};
