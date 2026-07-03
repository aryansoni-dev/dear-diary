import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ConfigurationErrorScreen({
  developerMessage,
}: {
  developerMessage?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center bg-white px-8"
      style={{
        paddingBottom: Math.max(32, insets.bottom + 24),
        paddingTop: Math.max(32, insets.top + 24),
      }}
    >
      <Text className="text-center text-[24px] font-bold leading-6 text-zinc-950">
        DearDiary could not start
      </Text>
      <Text className="mt-4 text-center text-[16px] leading-6 text-zinc-600">
        DearDiary could not start because its configuration is incomplete.
      </Text>
      {developerMessage ? (
        <Text
          selectable
          className="mt-5 text-center text-[13px] leading-6 text-zinc-500"
        >
          {developerMessage}
        </Text>
      ) : null}
    </View>
  );
}
