import { WifiOff } from "lucide-react-native";
import { Text, View } from "react-native";

export function OfflineNotice({ message }: { message?: string }) {
  return (
    <View className="flex-row items-start gap-3 rounded-[20px] bg-[#FFF7ED] px-4 py-4">
      <View className="mt-0.5 size-8 items-center justify-center rounded-full bg-white">
        <WifiOff color="#C2410C" size={17} strokeWidth={2.4} />
      </View>
      <Text className="flex-1 text-[14px] font-semibold leading-6 text-[#9A3412]">
        {message ??
          "You are offline. Changes will be saved on this device and synced later."}
      </Text>
    </View>
  );
}
