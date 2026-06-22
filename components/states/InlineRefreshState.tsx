import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "@/constants/theme";

type InlineRefreshStateProps = {
  label?: string;
};

export function InlineRefreshState({
  label = "Updating...",
}: InlineRefreshStateProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="flex-row items-center gap-2 rounded-full bg-white px-3 py-2"
      style={{ boxShadow: "0 1px 4px rgba(39, 39, 42, 0.1)" }}
    >
      <ActivityIndicator color={colors.brandPrimary} size="small" />
      <Text className="text-[13px] font-semibold leading-5 text-text-muted">
        {label}
      </Text>
    </View>
  );
}
