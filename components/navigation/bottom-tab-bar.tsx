import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { bottomTabItems, type BottomTabItem } from "@/data/navigation";

export const bottomTabBarBaseHeight = 92;

type BottomTabBarProps = {
  activeTab: BottomTabItem["label"];
};

const colors = {
  muted: "#71717B",
  primary: "#FF2056",
};

export function BottomTabBar({ activeTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabWidth = `${100 / bottomTabItems.length}%` as `${number}%`;

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-zinc-200 bg-white/90 px-3 pt-3"
      style={{
        height: bottomTabBarBaseHeight + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 18),
      }}
    >
      <View className="w-full flex-row items-start">
        {bottomTabItems.map((item) => {
          const isActive = activeTab === item.label;
          const Icon = item.Icon;

          return (
            <Pressable
              testID={`tab-${item.label.toLowerCase()}-button`}
              accessibilityLabel={`${item.label} tab`}
              accessibilityRole="button"
              accessibilityState={{
                disabled: !item.href,
                selected: isActive,
              }}
              className="items-center gap-1"
              key={item.label}
              onPress={() => {
                if (!item.href || isActive) {
                  return;
                }

                router.push(item.href);
              }}
              style={{ width: tabWidth }}
            >
              <View
                className="h-9 w-[54px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: isActive ? "#FFDDE8" : "transparent",
                }}
              >
                <Icon
                  size={23}
                  color={isActive ? colors.primary : colors.muted}
                  strokeWidth={2}
                />
              </View>
              <Text
                allowFontScaling={false}
                className="w-[64px] text-center text-[11px] leading-4"
                ellipsizeMode="clip"
                numberOfLines={1}
                style={{
                  color: isActive ? colors.primary : colors.muted,
                  fontWeight: isActive ? "700" : "500",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
