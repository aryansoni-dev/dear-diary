import type { EmptyStateReason, LoadableStatus } from "@/types/uiState";

export type HistoryViewState = {
  emptyReason: EmptyStateReason | null;
  status: LoadableStatus;
};

type DeriveHistoryViewStateParams<TEntry> = {
  entries: TEntry[];
  filteredEntries: TEntry[];
  hasActiveFilters: boolean;
  hasHydrated: boolean;
};

export function deriveHistoryViewState<TEntry>({
  entries,
  filteredEntries,
  hasActiveFilters,
  hasHydrated,
}: DeriveHistoryViewStateParams<TEntry>): HistoryViewState {
  if (!hasHydrated) {
    return {
      emptyReason: null,
      status: "hydrating",
    };
  }

  if (entries.length === 0) {
    return {
      emptyReason: "first_use",
      status: "empty",
    };
  }

  if (filteredEntries.length === 0 && hasActiveFilters) {
    return {
      emptyReason: "filtered",
      status: "empty",
    };
  }

  return {
    emptyReason: null,
    status: "success",
  };
}
