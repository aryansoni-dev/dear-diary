import { Pressable, Text, View } from "react-native";

type StaleDataNoticeProps = {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export function StaleDataNotice({
  message,
  onRetry,
  retrying = false,
}: StaleDataNoticeProps) {
  return (
    <View
      accessibilityRole="alert"
      className="rounded-[20px] bg-error-surface px-4 py-4"
    >
      <Text className="text-[14px] font-semibold leading-6 text-error-text">
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: retrying }}
          className="mt-3 min-h-10 items-center justify-center rounded-full bg-white px-4"
          disabled={retrying}
          onPress={onRetry}
        >
          <Text className="text-[14px] font-bold leading-5 text-brand-primary">
            {retrying ? "Retrying..." : "Retry"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
