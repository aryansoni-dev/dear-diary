import { useClerk, useUser } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";

export default function HomeTabScreen() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const firstName = user?.firstName ?? "there";

  return (
    <LinearGradient
      colors={["#FFF4FA", "#FAF7F2"]}
      locations={[0, 1]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="flex-1 justify-center px-6">
        <Text className="text-[30px] font-bold leading-9 text-zinc-950">
          Welcome, {firstName}
        </Text>
        <Text className="mt-3 text-[15px] leading-6 text-zinc-500">
          Your journal is ready when you are.
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-8 h-12 items-center justify-center rounded-full border border-zinc-200 bg-white/90"
          onPress={() => signOut()}
        >
          <Text className="text-[13px] font-bold leading-5 text-zinc-950">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}
