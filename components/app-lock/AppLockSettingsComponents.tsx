import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <View
      className="rounded-[24px] bg-white p-2"
      style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.12)" }}
    >
      {children}
    </View>
  );
}

export function Divider() {
  return <View className="mx-3 h-px bg-[#E4E4E7]" />;
}

export function SettingsRow({
  icon,
  isBusy = false,
  label,
  onPress,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  isBusy?: boolean;
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[58px] flex-row items-center justify-between gap-3 rounded-[18px] p-3"
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center gap-4">
        <View className="size-10 items-center justify-center rounded-[13px] bg-[#FFE1EE]">
          <Feather name={icon} size={20} color="#FF2056" />
        </View>
        <Text className="flex-1 text-[15px] font-medium leading-5 text-[#27272A]">
          {label}
        </Text>
      </View>

      {isBusy ? (
        <ActivityIndicator color="#A1A1AA" size="small" />
      ) : value ? (
        <Text className="text-[13px] font-semibold leading-5 text-[#71717B]">
          {value}
        </Text>
      ) : (
        <Feather name="chevron-right" size={21} color="#A1A1AA" />
      )}
    </Pressable>
  );
}

