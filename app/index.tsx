import { Feather, Ionicons } from "@expo/vector-icons";
import { images } from "@/constants/images";
import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function Index() {
  const { height } = useWindowDimensions();
  const isCompact = height < 680;

  return (
    <ScrollView
      className="flex-1 bg-[linear-gradient(to_bottom,#F4EFFA_0%,#FFDDE8_48%,#FAF7F2_100%)]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: isCompact ? 22 : 34,
        paddingHorizontal: 22,
        paddingTop: isCompact ? 30 : 52,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="relative flex-1 items-center overflow-visible">
        <View className="absolute left-2 top-3 size-1.5 rounded-full bg-white" />
        <Text className="absolute left-0 top-[116px] text-[10px] leading-3 text-[#FFAEC9]">
          |
        </Text>
        <Ionicons
          name="sparkles-outline"
          size={16}
          color="#ff8aae"
          style={{ left: 64, position: "absolute", top: 88 }}
        />
        <Feather
          name="star"
          size={12}
          color="#d9c5ff"
          style={{ left: 24, position: "absolute", top: 164 }}
        />
        <View className="absolute left-5 top-[232px] size-2 rounded-full bg-[#DDEFFF]" />
        <View className="absolute left-16 top-[344px] size-1 rounded-full bg-[#ffb6c7]" />
        <Ionicons
          name="grid-outline"
          size={13}
          color="#ff9cc0"
          style={{ left: 18, position: "absolute", top: 374 }}
        />
        <Ionicons
          name="star-outline"
          size={14}
          color="#f6c959"
          style={{ left: 118, position: "absolute", top: 356 }}
        />
        <Ionicons
          name="sparkles-outline"
          size={13}
          color="#f0ce62"
          style={{ position: "absolute", right: 36, top: 36 }}
        />
        <View className="absolute right-16 top-20 size-1.5 rounded-full bg-[#ffb6c7]" />
        <Ionicons
          name="sparkles-outline"
          size={13}
          color="#f0ce62"
          style={{ position: "absolute", right: 8, top: 138 }}
        />
        <View className="absolute right-5 top-[226px] size-1.5 rounded-full bg-white" />
        <Ionicons
          name="flower-outline"
          size={13}
          color="#e4b3ff"
          style={{ position: "absolute", right: 34, top: 178 }}
        />
        <Ionicons
          name="star-outline"
          size={18}
          color="#ffb6c7"
          style={{ position: "absolute", right: 12, top: 320 }}
        />
        <Ionicons
          name="star-outline"
          size={11}
          color="#ffb6c7"
          style={{ bottom: 110, position: "absolute", right: 12 }}
        />
        <View
          className="items-center"
          style={{ marginTop: isCompact ? 52 : 106 }}
        >
          <Image
            source={images.splashLogo}
            contentFit="contain"
            style={{
              height: isCompact ? 142 : 170,
              width: isCompact ? 300 : 342,
            }}
          />
          <Text className="mt-3 max-w-[240px] text-center font-serif text-[16px] italic leading-6 text-zinc-500">
            Every thought deserves a place to rest.
          </Text>
        </View>

        <View className="mt-auto w-full items-center gap-3">
          <Link href="/onboarding-screen-1" asChild>
            <Pressable
              className="w-full flex-row items-center justify-center gap-2 rounded-full bg-[#ff2056]"
              style={{
                boxShadow: "0 14px 32px -10px rgba(255, 32, 86, 0.7)",
                height: isCompact ? 48 : 56,
              }}
            >
              <Text className="text-base font-bold text-white">Continue</Text>
              {/* <Feather name="arrow-right" size={20} color="#ffffff" /> */}
            </Pressable>
          </Link>

          <Ionicons name="moon-outline" size={14} color="#ffb6c7" />

          <Text className="text-[10px] font-medium tracking-[7px] text-zinc-300">
            REST · REFLECT · GROW
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
