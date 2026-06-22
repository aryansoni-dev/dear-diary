import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type ScreenEmptyStateProps = {
  actionLabel?: string;
  compact?: boolean;
  icon?: ReactNode;
  message: string;
  onAction?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  title: string;
};

export function ScreenEmptyState({
  actionLabel,
  compact = false,
  icon,
  message,
  onAction,
  onSecondaryAction,
  secondaryActionLabel,
  title,
}: ScreenEmptyStateProps) {
  return (
    <View
      className="items-center rounded-[24px] border border-zinc-100 bg-white px-6"
      style={{
        boxShadow: "0 2px 7px rgba(39, 39, 42, 0.1)",
        paddingBottom: compact ? 20 : 28,
        paddingTop: compact ? 20 : 28,
      }}
    >
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text className="text-center text-[18px] font-semibold leading-6 text-text-primary">
        {title}
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-6 text-text-muted">
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          className="mt-5 min-h-11 items-center justify-center rounded-full bg-brand-primary px-5"
          onPress={onAction}
        >
          <Text className="text-[15px] font-semibold leading-5 text-white">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          accessibilityLabel={secondaryActionLabel}
          accessibilityRole="button"
          className="mt-3 min-h-10 items-center justify-center rounded-full bg-zinc-100 px-5"
          onPress={onSecondaryAction}
        >
          <Text className="text-[14px] font-semibold leading-5 text-text-secondary">
            {secondaryActionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
