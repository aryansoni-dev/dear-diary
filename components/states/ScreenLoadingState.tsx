import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type ScreenLoadingStateProps = {
  message?: string;
  testID?: string;
  title?: string;
};

export function ScreenLoadingState({
  message,
  testID,
  title = "Loading...",
}: ScreenLoadingStateProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="items-center rounded-[24px] border border-zinc-100 bg-white px-6 py-8"
      style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.1)" }}
      testID={testID}
    >
      <ActivityIndicator color={colors.brandPrimary} />
      <Text className="mt-4 text-center text-[18px] font-semibold leading-6 text-text-primary">
        {title}
      </Text>
      {message ? (
        <Text className="mt-2 text-center text-[14px] leading-6 text-text-muted">
          {message}
        </Text>
      ) : null}
    </View>
  );
}
