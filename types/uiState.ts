export type DataFreshness = "unknown" | "fresh" | "stale";

export type LoadableStatus =
  | "idle"
  | "hydrating"
  | "loading"
  | "refreshing"
  | "success"
  | "empty"
  | "error";

export type EmptyStateReason =
  | "first_use"
  | "filtered"
  | "no_data_for_period"
  | "not_generated"
  | "permission_required"
  | "offline_unavailable";

export type RetryState = {
  available: boolean;
  inProgress: boolean;
};
