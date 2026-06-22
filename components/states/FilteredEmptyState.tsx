import { ScreenEmptyState } from "@/components/states/ScreenEmptyState";

type FilteredEmptyStateProps = {
  message?: string;
  onClearFilters: () => void;
  title?: string;
};

export function FilteredEmptyState({
  message = "Try another search or clear your filters.",
  onClearFilters,
  title = "No entries match your search",
}: FilteredEmptyStateProps) {
  return (
    <ScreenEmptyState
      actionLabel="Clear filters"
      message={message}
      onAction={onClearFilters}
      title={title}
    />
  );
}
