import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AppPrivacyCover() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-0 items-center justify-center bg-[#FFF7FB] px-8"
      style={{
        paddingBottom: Math.max(insets.bottom, 24),
        paddingTop: Math.max(insets.top, 24),
      }}
    >
      <View className="items-center gap-4">
        <View className="size-16 items-center justify-center rounded-[22px] bg-[#FFDDE8]">
          <Text className="text-[30px] font-bold leading-9 text-[#FF2056]">
            D
          </Text>
        </View>
        <Text className="text-center text-[22px] font-bold leading-7 text-[#27272A]">
          Your journal is private.
        </Text>
      </View>
    </View>
  );
}

