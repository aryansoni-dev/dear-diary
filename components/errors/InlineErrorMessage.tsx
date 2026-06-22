import { Pressable, Text, View } from "react-native";

import type { AppError } from "@/types/appError";

type InlineErrorMessageProps = {
  error: AppError;
  onRetry?: () => void;
};

export function InlineErrorMessage({ error, onRetry }: InlineErrorMessageProps) {
  return (
    <View
      accessibilityRole="alert"
      className="rounded-[20px] bg-[#FFF1F5] px-4 py-4"
    >
      <Text className="text-[14px] font-semibold leading-6 text-[#9F1239]">
        {error.userMessage}
      </Text>
      {error.retryable && onRetry ? (
        <Pressable
          accessibilityRole="button"
          className="mt-3 min-h-10 items-center justify-center rounded-full bg-white px-4"
          onPress={onRetry}
        >
          <Text className="text-[14px] font-bold leading-5 text-[#FF2056]">
            Retry
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
