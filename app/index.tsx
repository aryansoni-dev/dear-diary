import { Feather, Ionicons } from "@expo/vector-icons";
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
        <View className="absolute left-1 top-1 size-1.5 rounded-full bg-white" />
        <Text className="absolute left-0 top-[82px] text-[10px] leading-3 text-[#FFAEC9]">
          |
        </Text>
        <Ionicons
          name="sparkles-outline"
          size={16}
          color="#ff8aae"
          style={{ left: 74, position: "absolute", top: 78 }}
        />
        <Feather
          name="star"
          size={12}
          color="#d9c5ff"
          style={{ left: 38, position: "absolute", top: 110 }}
        />
        <View className="absolute left-38 top-[138px] size-2 rounded-full bg-[#DDEFFF]" />
        <View className="absolute left-32 top-[258px] size-1 rounded-full bg-[#ffb6c7]" />
        <Ionicons
          name="grid-outline"
          size={13}
          color="#ff9cc0"
          style={{ left: 82, position: "absolute", top: 283 }}
        />
        <Ionicons
          name="star-outline"
          size={14}
          color="#f6c959"
          style={{ left: 153, position: "absolute", top: 287 }}
        />
        <Ionicons
          name="sparkles-outline"
          size={13}
          color="#f0ce62"
          style={{ position: "absolute", right: 42, top: 14 }}
        />
        <View className="absolute right-11 top-8 size-1.5 rounded-full bg-[#ffb6c7]" />
        <Ionicons
          name="sparkles-outline"
          size={13}
          color="#f0ce62"
          style={{ position: "absolute", right: 52, top: 104 }}
        />
        <View className="absolute right-44 top-[132px] size-1.5 rounded-full bg-white" />
        <Ionicons
          name="flower-outline"
          size={13}
          color="#e4b3ff"
          style={{ position: "absolute", right: 28, top: 132 }}
        />
        <Ionicons
          name="star-outline"
          size={18}
          color="#ffb6c7"
          style={{ position: "absolute", right: 22, top: 232 }}
        />
        <Ionicons
          name="star-outline"
          size={11}
          color="#ffb6c7"
          style={{ bottom: 110, position: "absolute", right: 12 }}
        />
        <View
          className="items-center"
          style={{ marginTop: isCompact ? 74 : 138 }}
        >
          <View
            className="relative items-center justify-center rounded-[26px] bg-white/75"
            style={{
              boxShadow: "0 18px 45px -16px rgba(255, 32, 86, 0.35)",
              height: isCompact ? 118 : 138,
              width: isCompact ? 118 : 138,
            }}
          >
            <Feather
              name="book-open"
              size={isCompact ? 56 : 66}
              color="#ff2056"
            />
            <View className="absolute -right-3 -top-3 size-8 items-center justify-center rounded-full bg-[#ff2056]">
              <Ionicons name="sparkles-outline" size={18} color="#ffffff" />
            </View>
          </View>

          <Text className="mt-5 text-center text-[10px] font-medium tracking-[6px] text-[#ff2056]">
            YOUR DIARY
          </Text>
          <Text
            className="mt-3 text-center font-serif text-zinc-950"
            style={{
              fontSize: isCompact ? 40 : 44,
              lineHeight: isCompact ? 46 : 52,
            }}
          >
            DearDiary
          </Text>
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
