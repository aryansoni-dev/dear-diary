import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

export default function OnboardingScreenTwo() {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;

  const artworkHeight = isCompact ? 236 : 340;
  const mainCardSize = isCompact ? 128 : 176;
  const mainIconSize = isCompact ? 72 : 94;
  const badgeSize = isCompact ? 40 : 48;
  const featureIconSize = isCompact ? 48 : 56;

  return (
    <ScrollView
      className="flex-1 bg-[linear-gradient(to_bottom,#F4EFFA_0%,#FAF7F2_100%)]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: isCompact ? 24 : 32,
        paddingHorizontal: 32,
        paddingTop: isCompact ? 32 : 48,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="items-center justify-center" style={{ paddingTop: 8 }}>
        <View className="flex-row items-center justify-center gap-2">
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="h-2 w-6 rounded-full bg-[#ff2056]" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
        </View>
      </View>

      <View
        className="relative w-full items-center justify-center"
        style={{ height: artworkHeight, marginTop: isCompact ? 18 : 24 }}
      >
        <View
          className="absolute rounded-full bg-[#F4EFFA] opacity-80"
          style={{
            filter: "blur(28px)",
            height: isCompact ? 176 : 224,
            width: isCompact ? 176 : 224,
          }}
        />
        <View
          className="absolute rounded-full bg-[#FFDDE8] opacity-70"
          style={{
            filter: "blur(20px)",
            height: 48,
            left: isCompact ? 24 : 24,
            top: isCompact ? 8 : 24,
            width: 48,
          }}
        />
        <View
          className="absolute rounded-full bg-[#DDEFFF] opacity-70"
          style={{
            bottom: isCompact ? 28 : 40,
            filter: "blur(20px)",
            height: 56,
            right: 24,
            width: 56,
          }}
        />
        <View
          className="absolute rounded-full bg-[#D8EEDB] opacity-70"
          style={{
            filter: "blur(16px)",
            height: 32,
            right: isCompact ? 34 : 40,
            top: isCompact ? 18 : 40,
            width: 32,
          }}
        />

        <Ionicons
          name="sparkles-outline"
          size={isCompact ? 28 : 34}
          color="rgba(255, 32, 86, 0.62)"
          style={{
            position: "absolute",
            right: isCompact ? 46 : 58,
            top: isCompact ? 18 : 34,
          }}
        />
        <Ionicons
          name="sparkles-outline"
          size={isCompact ? 22 : 26}
          color="rgba(255, 32, 86, 0.45)"
          style={{
            bottom: isCompact ? 38 : 50,
            left: 22,
            position: "absolute",
          }}
        />
        <Ionicons
          name="star-outline"
          size={isCompact ? 22 : 26}
          color="#DDEFFF"
          style={{
            left: isCompact ? 36 : 48,
            position: "absolute",
            top: isCompact ? 58 : 84,
          }}
        />

        <View
          className="relative items-center justify-center rounded-3xl bg-white/70"
          style={{
            borderCurve: "continuous",
            boxShadow: "0 20px 60px -15px rgba(180, 150, 230, 0.45)",
            height: mainCardSize,
            width: mainCardSize,
          }}
        >
          <Feather name="book-open" size={mainIconSize} color="#ff2056" />
          <View
            className="absolute items-center justify-center rounded-full bg-white/80"
            style={{
              boxShadow: "0 8px 18px -10px rgba(0, 0, 0, 0.35)",
              height: badgeSize,
              right: -12,
              top: -12,
              width: badgeSize,
            }}
          >
            <Ionicons
              name="sparkles-outline"
              size={isCompact ? 24 : 30}
              color="#ff2056"
            />
          </View>
        </View>
      </View>

      <View className="items-center gap-4" style={{ marginTop: isCompact ? 0 : 8 }}>
        <Text
          className="text-center font-bold text-zinc-950"
          style={{
            fontSize: isCompact ? 24 : 32,
            lineHeight: isCompact ? 30 : 40,
          }}
        >
          ✨ AI-Powered{"\n"}Reflection
        </Text>
        <Text
          className="px-2 text-center text-zinc-500"
          style={{
            fontSize: isCompact ? 12 : 16,
            lineHeight: isCompact ? 18 : 28,
          }}
        >
          Discover patterns in your thoughts. DearDiary AI reads between the
          lines to help you understand yourself better.
        </Text>
      </View>

      <View
        className="w-full rounded-3xl bg-white/70"
        style={{
          borderCurve: "continuous",
          boxShadow: "0 18px 50px -15px rgba(180, 150, 230, 0.4)",
          marginTop: isCompact ? 20 : 32,
          padding: isCompact ? 16 : 24,
        }}
      >
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 items-center gap-2">
            <View
              className="items-center justify-center rounded-2xl bg-[#FFDDE8]"
              style={{ height: featureIconSize, width: featureIconSize }}
            >
              <Ionicons name="sparkles-outline" size={28} color="#ff2056" />
            </View>
            <Text className="text-[13px] font-bold text-zinc-800">
              AI Prompts
            </Text>
          </View>

          <View className="flex-1 items-center gap-2">
            <View
              className="items-center justify-center rounded-2xl bg-[#D8EEDB]"
              style={{ height: featureIconSize, width: featureIconSize }}
            >
              <Feather name="trending-up" size={28} color="#059669" />
            </View>
            <Text className="text-[13px] font-bold text-zinc-800">
              Patterns
            </Text>
          </View>

          <View className="flex-1 items-center gap-2">
            <View
              className="items-center justify-center rounded-2xl bg-[#DDEFFF]"
              style={{ height: featureIconSize, width: featureIconSize }}
            >
              <MaterialCommunityIcons name="brain" size={30} color="#0284c7" />
            </View>
            <Text className="text-[13px] font-bold text-zinc-800">
              Insights
            </Text>
          </View>
        </View>
      </View>

      <View
        className="mt-auto items-center gap-4"
        style={{ paddingTop: isCompact ? 20 : 32 }}
      >
        <Link href="/onboarding-screen-3" asChild>
          <Pressable
            className="w-full items-center justify-center rounded-full bg-[#ff2056]"
            style={{
              boxShadow: "0 10px 30px -8px rgba(255, 32, 86, 0.5)",
              height: isCompact ? 52 : 56,
            }}
          >
            <Text className="text-[17px] font-semibold leading-6 text-rose-50">
              Next →
            </Text>
          </Pressable>
        </Link>

        <Link href="/onboarding-screen-1" asChild>
          <Pressable className="px-4 py-1">
            <Text className="text-[15px] font-medium text-zinc-400">Back</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
