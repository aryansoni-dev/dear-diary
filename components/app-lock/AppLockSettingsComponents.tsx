import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { appLockColors } from "@/constants/app-lock-theme";

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="rounded-[24px] p-2"
      style={{
        backgroundColor: appLockColors.surface,
        boxShadow: `0 2px 8px ${appLockColors.shadow}`,
      }}
    >
      {children}
    </View>
  );
}

export function Divider() {
  return (
    <View
      className="mx-3 h-px"
      style={{ backgroundColor: appLockColors.border }}
    />
  );
}

export function SettingsRow({
  icon,
  isBusy = false,
  label,
  onPress,
  testID,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  isBusy?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
  value: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={label}
      accessibilityRole="button"
      className="min-h-[58px] flex-row items-center justify-between gap-3 rounded-[18px] p-3"
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center gap-4">
        <View
          className="size-10 items-center justify-center rounded-[13px]"
          style={{ backgroundColor: appLockColors.primarySoft }}
        >
          <Feather name={icon} size={20} color={appLockColors.primary} />
        </View>
        <Text
          className="flex-1 text-[15px] font-medium leading-5"
          style={{ color: appLockColors.text }}
        >
          {label}
        </Text>
      </View>

      {isBusy ? (
        <ActivityIndicator color={appLockColors.disabledText} size="small" />
      ) : value ? (
        <Text
          className="text-[13px] font-semibold leading-5"
          style={{ color: appLockColors.textMuted }}
        >
          {value}
        </Text>
      ) : (
        <Feather
          name="chevron-right"
          size={21}
          color={appLockColors.disabledText}
        />
      )}
    </Pressable>
  );
}
