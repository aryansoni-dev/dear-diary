import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function SsoCallbackScreen() {
  return (
    <LinearGradient
      colors={["#FFF4FA", "#FAF7F2"]}
      locations={[0, 1]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-[18px] font-bold leading-7 text-zinc-950">
          Finishing sign in...
        </Text>
      </View>
    </LinearGradient>
  );
}
