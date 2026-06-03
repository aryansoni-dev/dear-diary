import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";

import { images } from "@/constants/images";

export default function OnboardingScreenOne() {
  return (
    <ScrollView
      className="flex-1 bg-[linear-gradient(to_bottom,#FFDDE8_0%,#FAF7F2_55%,#FAF7F2_100%)]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 40,
        paddingHorizontal: 32,
        paddingTop: 56,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="mb-8 flex-row items-center justify-center gap-2">
        <View className="h-2 w-6 rounded-full bg-[#ff2056]" />
        <View className="size-2 rounded-full bg-[#ffb6c7]" />
        <View className="size-2 rounded-full bg-[#ffb6c7]" />
        <View className="size-2 rounded-full bg-[#ffb6c7]" />
        <View className="size-2 rounded-full bg-[#ffb6c7]" />
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="relative mb-10 items-center justify-center">
          <View
            className="absolute size-72 rounded-full bg-[radial-gradient(circle,#FFDDE8_0%,#F4EFFA_45%,rgba(244,239,250,0)_72%)]"
            style={{ filter: "blur(18px)" }}
          />
          <View
            className="size-[272px] overflow-hidden rounded-[40px] border-[8px] border-white/60"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 20px 60px -15px rgba(255, 32, 86, 0.25)",
            }}
          >
            <Image
              source={images.onboardingReflect}
              contentFit="cover"
              accessibilityLabel="Person sitting peacefully journaling"
              className="size-full"
            />
          </View>
        </View>
        <Text className="text-center text-[32px] font-bold leading-[38px] text-zinc-950">
          Your space to reflect.
        </Text>
        <Text className="mt-1 text-center text-[42px] leading-[50px]">🌸</Text>
        <Text className="mt-6 max-w-[280px] text-center text-[17px] leading-7 text-zinc-500">
          Reflect, understand, and grow.
        </Text>
      </View>

      <View className="items-center gap-4 pt-6">
        <Link href="/onboarding-screen-2" asChild>
          <Pressable
            className="h-14 w-full items-center justify-center rounded-full bg-[#ff2056]"
            style={{
              boxShadow: "0 12px 30px -8px rgba(255, 32, 86, 0.5)",
            }}
          >
            <Text className="text-base font-bold leading-6 text-rose-50">
              Get Started
            </Text>
          </Pressable>
        </Link>

        <Pressable className="px-4 py-1">
          <Text className="text-sm font-medium leading-5 text-zinc-400">
            I already have an account
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
