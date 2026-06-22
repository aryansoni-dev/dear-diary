import { WifiOff } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors } from "@/constants/theme";

export function OfflineNotice({ message }: { message?: string }) {
  return (
    <View className="flex-row items-start gap-3 rounded-[20px] bg-offline-surface px-4 py-4">
      <View className="mt-0.5 size-8 items-center justify-center rounded-full bg-white">
        <WifiOff color={colors.offlineIcon} size={17} strokeWidth={2.4} />
      </View>
      <Text className="flex-1 text-[14px] font-semibold leading-6 text-offline-text">
        {message ??
          "You are offline. Changes will be saved on this device and synced later."}
      </Text>
    </View>
  );
}
