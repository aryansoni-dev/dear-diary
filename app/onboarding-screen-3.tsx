import { LinearGradient } from "expo-linear-gradient";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const moods = [
  {
    emoji: "😊",
    label: "Happy",
    background: "#FFDDE8",
    color: "#ff2056",
    selected: true,
    shadow: "0 8px 20px -8px rgba(255, 32, 86, 0.4)",
  },
  {
    emoji: "😌",
    label: "Calm",
    background: "#D8EEDB",
    color: "#3f3f46",
    shadow: "0 8px 20px -8px rgba(120, 170, 130, 0.4)",
  },
  {
    emoji: "😔",
    label: "Sad",
    background: "#DDEFFF",
    color: "#3f3f46",
    shadow: "0 8px 20px -8px rgba(120, 150, 200, 0.4)",
  },
  {
    emoji: "🔥",
    label: "Motivated",
    background: "#F4EFFA",
    color: "#3f3f46",
    shadow: "0 8px 20px -8px rgba(160, 140, 200, 0.4)",
  },
  {
    emoji: "🙏",
    label: "Grateful",
    background: "#D8EEDB",
    color: "#3f3f46",
    shadow: "0 8px 20px -8px rgba(120, 170, 130, 0.4)",
  },
];

export default function OnboardingScreenThree() {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;

  const sceneHeight = isCompact ? 280 : 340;
  const sceneMarginTop = isCompact ? 24 : 32;

  return (
    <LinearGradient
      colors={["#DDEFFF", "#FFDDE8", "#FAF7F2"]}
      locations={[0, 0.48, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
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

      <View className="items-center justify-center pt-2">
        <View className="flex-row items-center justify-center gap-2">
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="h-2 w-6 rounded-full bg-[#ff2056]" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
        </View>
      </View>

      <LinearGradient
        colors={["#DDEFFF", "#F4EFFA", "#D8EEDB"]}
        locations={[0, 0.55, 1]}
        style={{
          borderCurve: "continuous",
          borderRadius: 24,
          boxShadow: "0 20px 50px -15px rgba(180, 160, 210, 0.5)",
          height: sceneHeight,
          marginTop: sceneMarginTop,
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        <View
          className="absolute rounded-full bg-white/40"
          style={{
            filter: "blur(14px)",
            height: 80,
            left: 40,
            top: isCompact ? 28 : 40,
            width: 80,
          }}
        />
        <View
          className="absolute rounded-full bg-[#FFDDE8]/60"
          style={{
            filter: "blur(14px)",
            height: 112,
            right: 48,
            top: isCompact ? 48 : 64,
            width: 112,
          }}
        />
        <View
          className="absolute rounded-full bg-white/50"
          style={{
            filter: "blur(14px)",
            height: 64,
            left: "33%",
            top: isCompact ? 72 : 96,
            width: 64,
          }}
        />

        <View
          className="absolute inset-x-0 bottom-0 rounded-t-[999px] bg-[#D8EEDB]"
          style={{ height: isCompact ? 132 : 160 }}
        />
        <View
          className="absolute inset-x-0 bottom-0 rounded-t-[999px] bg-[#bfe3c7]"
          style={{ height: isCompact ? 86 : 96 }}
        />
        <View
          className="absolute -right-10 -bottom-6 rounded-t-[999px] bg-[#F4EFFA]"
          style={{ height: isCompact ? 108 : 128, width: 224 }}
        />

        <Text
          className="absolute text-3xl leading-9"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))",
            left: 32,
            top: isCompact ? 40 : 48,
          }}
        >
          😊
        </Text>
        <Text
          className="absolute text-2xl leading-8"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))",
            right: 40,
            top: isCompact ? 84 : 96,
          }}
        >
          😌
        </Text>
        <Text
          className="absolute text-2xl leading-8"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))",
            left: 56,
            top: isCompact ? 128 : 160,
          }}
        >
          😔
        </Text>
        <Text
          className="absolute text-3xl leading-9"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))",
            right: 80,
            top: isCompact ? 112 : 128,
          }}
        >
          🔥
        </Text>
        <Text
          className="absolute text-2xl leading-8"
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2))",
            left: "50%",
            top: isCompact ? 72 : 80,
            transform: [{ translateX: -16 }],
          }}
        >
          🙏
        </Text>
      </LinearGradient>

      <Text
        className="text-center font-bold tracking-tight text-zinc-950"
        style={{
          fontSize: isCompact ? 28 : 32,
          lineHeight: isCompact ? 36 : 40,
          marginTop: isCompact ? 24 : 32,
        }}
      >
        😊 Understand Your{"\n"}Emotions
      </Text>

      <Text
        className="px-2 text-center text-zinc-500"
        style={{
          fontSize: isCompact ? 15 : 16,
          lineHeight: isCompact ? 24 : 28,
          marginTop: 8,
        }}
      >
        Track how you feel every day. Visualize your emotional world and
        discover what truly moves you.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          marginHorizontal: -32,
          marginTop: isCompact ? 20 : 24,
        }}
        contentContainerStyle={{
          alignItems: "center",
          gap: 8,
          paddingBottom: 4,
          paddingHorizontal: 32,
        }}
      >
        {moods.map((mood) => (
          <View
            key={mood.label}
            className="shrink-0 flex-row items-center gap-2 px-4"
            style={{
              backgroundColor: mood.background,
              borderColor: mood.selected ? "#ff2056" : "transparent",
              borderRadius: 24,
              borderWidth: mood.selected ? 2 : 0,
              boxShadow: mood.shadow,
              height: 56,
            }}
          >
            <Text className="text-lg leading-7">{mood.emoji}</Text>
            <Text
              className="text-sm font-semibold leading-5"
              style={{ color: mood.color }}
            >
              {mood.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        className="mt-auto items-center gap-4"
        style={{ paddingTop: isCompact ? 28 : 40 }}
      >
        <Link href="/onboarding-screen-4" asChild>
          <Pressable
            className="h-14 w-full flex-row items-center justify-center gap-2 rounded-full bg-[#ff2056]"
            style={{
              boxShadow: "0 12px 30px -8px rgba(255, 32, 86, 0.5)",
            }}
          >
            <Text className="text-base font-semibold leading-6 text-white">
              Next →
            </Text>
            {/* <Feather name="arrow-right" size={22} color="#ffffff" /> */}
          </Pressable>
        </Link>

        <Link href="/onboarding-screen-2" asChild>
          <Pressable className="px-4 py-1">
            <Text className="text-sm font-medium leading-5 text-zinc-400">
              Back
            </Text>
          </Pressable>
        </Link>
      </View>
      </ScrollView>
    </LinearGradient>
  );
}
