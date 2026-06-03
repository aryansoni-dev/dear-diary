import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const featureCards = [
  {
    icon: "book-open",
    label: "Daily\nPrompts",
    background: "#FFDDE8",
    color: "#ff2056",
  },
  {
    icon: "sparkles-outline",
    label: "AI Insights",
    background: "#D8EEDB",
    color: "#059669",
  },
  {
    icon: "bar-chart-2",
    label: "Mood Trends",
    background: "#F4EFFA",
    color: "#8b5cf6",
  },
] as const;

export default function OnboardingScreenFive() {
  const { height } = useWindowDimensions();
  const isCompact = height < 760;

  const heroHeight = isCompact ? 260 : 332;
  const outerSize = isCompact ? 156 : 176;
  const innerSize = isCompact ? 112 : 128;
  const featureIconSize = isCompact ? 50 : 56;

  return (
    <ScrollView
      className="flex-1 bg-[linear-gradient(to_bottom,#F4EFFA_0%,#FFDDE8_45%,#FAF7F2_100%)]"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: isCompact ? 24 : 32,
        paddingHorizontal: 32,
        paddingTop: isCompact ? 40 : 64,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View className="flex-row items-center justify-center gap-3">
        <View className="size-2 rounded-full bg-[#ff2056]" />
        <View className="size-2 rounded-full bg-[#ff2056]" />
        <View className="size-2 rounded-full bg-[#ff2056]" />
        <View className="size-2 rounded-full bg-[#ff2056]" />
        <View className="size-2 rounded-full bg-[#ff2056]" />
      </View>

      <View
        className="relative items-center justify-center"
        style={{ height: heroHeight, marginTop: isCompact ? 4 : 8 }}
      >
        <View
          className="absolute size-56 rounded-full bg-[radial-gradient(circle,rgba(255,32,86,0.35)_0%,rgba(255,32,86,0)_70%)]"
          style={{ filter: "blur(14px)" }}
        />

        <Feather
          name="star"
          size={isCompact ? 24 : 30}
          color="#ff2056"
          style={{
            left: 32,
            position: "absolute",
            top: isCompact ? 26 : 34,
          }}
        />
        <Ionicons
          name="sparkles-outline"
          size={isCompact ? 34 : 40}
          color="#ff2056"
          style={{
            position: "absolute",
            right: 38,
            top: isCompact ? 54 : 70,
          }}
        />
        <Feather
          name="heart"
          size={isCompact ? 18 : 22}
          color="#FFAEC9"
          style={{
            left: 8,
            position: "absolute",
            top: isCompact ? 92 : 112,
          }}
        />
        <Feather
          name="star"
          size={isCompact ? 18 : 22}
          color="rgba(255, 32, 86, 0.65)"
          style={{
            bottom: isCompact ? 54 : 64,
            position: "absolute",
            right: 12,
          }}
        />

        <View
          className="absolute rounded-full bg-[#D8EEDB]"
          style={{
            height: 10,
            left: "52%",
            top: isCompact ? 50 : 64,
            width: 10,
          }}
        />
        <View
          className="absolute size-2 rounded-full bg-[#DDEFFF]"
          style={{ bottom: isCompact ? 64 : 80, left: 42 }}
        />
        <View
          className="absolute size-2 rounded-full border border-white/60 bg-[#F4EFFA]"
          style={{ right: 78, top: isCompact ? 82 : 98 }}
        />
        <View
          className="absolute rounded-full bg-[#FFDDE8]"
          style={{
            bottom: isCompact ? 32 : 42,
            height: 10,
            right: 62,
            width: 10,
          }}
        />

        <View
          className="relative items-center justify-center rounded-full bg-white/70"
          style={{
            boxShadow: "0 20px 60px -10px rgba(255, 32, 86, 0.45)",
            height: outerSize,
            width: outerSize,
          }}
        >
          <View
            className="items-center justify-center rounded-3xl bg-[linear-gradient(145deg,#FFDDE8,#F4EFFA)]"
            style={{
              height: innerSize,
              width: innerSize,
            }}
          >
            <View className="relative items-center justify-center">
              <Feather name="book-open" size={64} color="#ff2056" />
              <Feather
                name="check"
                size={34}
                color="#ff2056"
                style={{
                  position: "absolute",
                  right: -20,
                  top: 10,
                }}
              />
            </View>
          </View>
        </View>
      </View>

      <View className="items-center gap-2" style={{ marginTop: isCompact ? -8 : -8 }}>
        <Text
          className="text-center font-bold tracking-tight text-zinc-950"
          style={{
            fontSize: isCompact ? 30 : 32,
            lineHeight: isCompact ? 36 : 40,
          }}
        >
          {"You're all set, Aryan! 🎉"}
        </Text>
        <Text
          className="px-2 text-center text-zinc-500"
          style={{
            fontSize: isCompact ? 16 : 17,
            lineHeight: isCompact ? 24 : 30,
          }}
        >
          Your reflection journey begins now. Write freely, grow deeply.
        </Text>
      </View>

      <View
        className="rounded-3xl bg-white/70"
        style={{
          borderCurve: "continuous",
          boxShadow: "0 12px 40px -12px rgba(255, 32, 86, 0.35)",
          marginTop: isCompact ? 20 : 24,
          padding: isCompact ? 18 : 24,
        }}
      >
        <View className="flex-row items-stretch justify-between gap-4">
          {featureCards.map((feature) => (
            <View key={feature.label} className="flex-1 items-center gap-2">
              <View
                className="items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: feature.background,
                  height: featureIconSize,
                  width: featureIconSize,
                }}
              >
                {feature.icon === "sparkles-outline" ? (
                  <Ionicons
                    name="sparkles-outline"
                    size={26}
                    color={feature.color}
                  />
                ) : (
                  <Feather
                    name={
                      feature.icon === "book-open"
                        ? "book-open"
                        : "bar-chart-2"
                    }
                    size={26}
                    color={feature.color}
                  />
                )}
              </View>
              <Text className="text-center text-[13px] font-bold leading-tight text-zinc-700">
                {feature.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className="mt-auto items-center gap-4"
        style={{ paddingTop: isCompact ? 28 : 32 }}
      >
        <Pressable
          className="h-14 w-full items-center justify-center rounded-full bg-[#ff2056]"
          style={{
            boxShadow: "0 16px 40px -8px rgba(255, 32, 86, 0.55)",
          }}
        >
          <Text className="text-[17px] font-bold text-white">
            Start Writing ✨
          </Text>
        </Pressable>

        <Pressable className="px-4 py-1">
          <Text className="text-sm font-medium text-zinc-400">
            Remind me later
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
