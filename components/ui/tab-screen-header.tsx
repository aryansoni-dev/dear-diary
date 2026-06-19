import type { ReactNode } from "react";
import { Text, View } from "react-native";

type TabScreenHeaderProps = {
  eyebrow?: string;
  rightAccessory?: ReactNode;
  subtitle?: string;
  title: string;
};

export function TabScreenHeader({
  eyebrow,
  rightAccessory,
  subtitle,
  title,
}: TabScreenHeaderProps) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <View className="min-w-0 flex-1">
        {eyebrow ? (
          <Text
            allowFontScaling={false}
            className="text-[13px] font-semibold uppercase leading-5 tracking-wide text-zinc-400"
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text
          allowFontScaling={false}
          className="text-[34px] font-bold leading-[42px] tracking-normal text-zinc-900"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            allowFontScaling={false}
            className="mt-1 text-[15px] leading-5 text-zinc-500"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAccessory ? (
        <View className="size-[50px] items-center justify-center mt-5">
          {rightAccessory}
        </View>
      ) : null}
    </View>
  );
}
