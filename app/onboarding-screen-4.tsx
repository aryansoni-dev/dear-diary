import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const ritualCards = [
  {
    icon: "☀️",
    title: "Morning Intention ☀️",
    body: "Start each day with clarity. Set one focus and carry it with you.",
    prompt: "What will you focus on today?",
    background: "#D8EEDB",
    shadow: "0 12px 30px -12px rgba(120, 180, 140, 0.55)",
  },
  {
    icon: "🌙",
    title: "Evening Reflection 🌙",
    body: "End each day with gratitude. Reflect on what moved you.",
    prompt: "How did today feel?",
    background: "#F4EFFA",
    shadow: "0 12px 30px -12px rgba(160, 140, 200, 0.55)",
  },
];

export default function OnboardingScreenFour() {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;

  return (
    <ScrollView
      className="flex-1 bg-[linear-gradient(to_bottom,#FFDDE8_0%,#F4EFFA_100%)]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: isCompact ? 24 : 32,
        paddingHorizontal: 24,
        paddingTop: isCompact ? 32 : 48,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="items-center justify-center" style={{ paddingTop: 16 }}>
        <View className="flex-row items-center justify-center gap-2">
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
          <View className="h-2 w-8 rounded-full bg-[#ff2056]" />
          <View className="size-2 rounded-full bg-[#ff2056]/20" />
        </View>
      </View>

      <View
        className="items-center gap-2"
        style={{ paddingTop: isCompact ? 24 : 32 }}
      >
        <Text
          className="text-center font-bold tracking-tight text-zinc-950"
          style={{
            fontSize: isCompact ? 28 : 32,
            lineHeight: isCompact ? 34 : 40,
          }}
        >
          🌅 Build Daily Rituals
        </Text>
        <Text
          className="max-w-[320px] text-center text-zinc-500"
          style={{
            fontSize: isCompact ? 15 : 16,
            lineHeight: isCompact ? 23 : 28,
          }}
        >
          Morning intentions and evening reflections — small habits that
          transform your inner world.
        </Text>
      </View>

      <View
        className="justify-center gap-6"
        style={{
          flex: 1,
          marginTop: isCompact ? 24 : 32,
        }}
      >
        {ritualCards.map((card) => (
          <View
            key={card.title}
            className="rounded-3xl"
            style={{
              backgroundColor: card.background,
              borderCurve: "continuous",
              boxShadow: card.shadow,
              gap: isCompact ? 12 : 16,
              padding: isCompact ? 20 : 24,
            }}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-12 items-center justify-center rounded-full bg-white/60">
                <Text className="text-2xl leading-8">{card.icon}</Text>
              </View>
              <Text
                className="flex-1 font-semibold text-zinc-900"
                style={{
                  fontSize: isCompact ? 17 : 18,
                  lineHeight: isCompact ? 24 : 28,
                }}
              >
                {card.title}
              </Text>
            </View>

            <Text
              className="text-zinc-600"
              style={{
                fontSize: isCompact ? 14 : 15,
                lineHeight: isCompact ? 22 : 26,
              }}
            >
              {card.body}
            </Text>

            <View
              className="rounded-2xl bg-white/60 px-4"
              style={{ paddingVertical: isCompact ? 10 : 12 }}
            >
              <Text className="text-sm leading-5 text-zinc-400">
                {card.prompt}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View
        className="items-center gap-4"
        style={{ paddingTop: isCompact ? 24 : 32 }}
      >
        <Link href="/onboarding-screen-5" asChild>
          <Pressable
            className="h-14 w-full items-center justify-center rounded-full bg-[#ff2056]"
            style={{
              boxShadow: "0 10px 24px -8px rgba(255, 32, 86, 0.6)",
            }}
          >
            <Text className="text-base font-semibold leading-6 text-white">
              Next →
            </Text>
          </Pressable>
        </Link>

        <Link href="/onboarding-screen-3" asChild>
          <Pressable className="px-4 py-1">
            <Text className="text-sm font-medium leading-5 text-zinc-400">
              Back
            </Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
