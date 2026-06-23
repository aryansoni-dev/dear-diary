export type FaultInjectionKey =
  | "async_storage_read_failure"
  | "async_storage_write_failure"
  | "sync_network_failure"
  | "sync_remote_failure"
  | "sync_timeout"
  | "ai_timeout"
  | "ai_empty_response"
  | "ai_invalid_response"
  | "backup_failure"
  | "restore_failure"
  | "expired_session"
  | "malformed_local_record";

