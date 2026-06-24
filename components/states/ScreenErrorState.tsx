import { Pressable, Text, View } from "react-native";

import type { AppError } from "@/types/appError";

type ScreenErrorStateProps = {
  compact?: boolean;
  error: AppError;
  onRetry?: () => void;
  retrying?: boolean;
};

export function ScreenErrorState({
  compact = false,
  error,
  onRetry,
  retrying = false,
}: ScreenErrorStateProps) {
  return (
    <View
      accessibilityRole="alert"
      className="items-center rounded-[24px] bg-error-surface px-6"
      style={{
        paddingBottom: compact ? 20 : 28,
        paddingTop: compact ? 20 : 28,
      }}
    >
      <Text className="text-center text-[18px] font-semibold leading-6 text-error-text">
        Something needs attention
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-6 text-error-text">
        {error.userMessage}
      </Text>
      {error.retryable && onRetry ? (
        <Pressable
          accessibilityLabel={retrying ? "Retrying" : "Retry"}
          accessibilityRole="button"
          accessibilityState={{ disabled: retrying }}
          className="mt-5 min-h-11 items-center justify-center rounded-full bg-white px-5"
          disabled={retrying}
          onPress={onRetry}
        >
          <Text className="text-[15px] font-semibold leading-5 text-brand-primary">
            {retrying ? "Retrying..." : "Retry"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
