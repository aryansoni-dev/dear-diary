import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { images } from "@/constants/images";
import { moodOptions, recentEntries } from "@/data/home";

type HomeScreenProps = {
  avatarUrl?: string;
  firstName?: string | null;
};

const colors = {
  primary: "#FF2056",
};

const journalEditorHref = {
  pathname: "/journal/new",
  params: { source: "home" },
} as Href;

export function HomeScreen({ avatarUrl, firstName }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState("Happy");
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const displayName = firstName?.trim() || "Aryan";

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#EFDDFC", "#FFE0EC", "#FFFFFF"]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.58, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          height: 344,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 28,
          paddingHorizontal: 28,
          paddingTop: Math.max(56, insets.top + 20),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-[15px] font-medium leading-5 text-[#71717B]">
              Friday, June 14
            </Text>
            <Text className="text-[28px] font-semibold leading-[38px] tracking-normal text-[#27272A]">
              Good Morning,{"\n"}
              {displayName}
            </Text>
          </View>

          <View
            className="size-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-white"
            style={{ boxShadow: "0 8px 18px rgba(39, 39, 42, 0.16)" }}
          >
            <Image
              accessibilityLabel={displayName}
              contentFit="cover"
              source={avatarUrl ? { uri: avatarUrl } : images.appLogo}
              style={{ height: "100%", width: "100%" }}
            />
          </View>
        </View>

        <View
          className="mb-7 flex-row items-center gap-4 rounded-[20px] bg-[#FFDDE8] px-6 py-5"
          style={{ boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)" }}
        >
          <Text className="text-[31px] leading-9">🔥</Text>
          <View>
            <Text className="text-[17px] font-semibold leading-6 text-[#303039]">
              7 Day Reflection Streak
            </Text>
            <Text className="text-[14px] font-medium leading-5 text-[#71717B]">
              Keep the momentum going
            </Text>
          </View>
        </View>

        <View
          className="mb-9 rounded-[24px] bg-white px-7 py-8"
          style={{ boxShadow: "0 12px 34px rgba(0, 0, 0, 0.08)" }}
        >
          <View className="mb-5 flex-row items-center gap-3">
            <View className="size-8 items-center justify-center rounded-full bg-white/70">
              <Ionicons
                color={colors.primary}
                name="sparkles-outline"
                size={21}
              />
            </View>
            <Text className="flex-1 text-[13px] font-semibold uppercase leading-5 tracking-normal text-zinc-950/45">
              AI Reflection Prompt
            </Text>
          </View>

          <Text className="mb-6 text-[24px] font-semibold leading-5 text-[#27272A]">
            What made you smile{"\n"}unexpectedly today?
          </Text>

          <Pressable
            accessibilityRole="button"
            className="h-[58px] items-center justify-center rounded-[17px] bg-[#FF2056]"
            onPress={() => router.push(journalEditorHref)}
          >
            <Text className="text-[19px] font-semibold leading-6 text-white">
              Start Writing ✨
            </Text>
          </Pressable>
        </View>

        <View className="mb-9 gap-4">
          <Text className="text-[23px] font-semibold leading-8 text-[#27272A]">
            How are you feeling today?
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {moodOptions.map((mood) => {
              const isSelected = selectedMood === mood.label;

              return (
                <Pressable
                  accessibilityRole="button"
                  className="h-12 flex-row items-center gap-2 rounded-full border px-5"
                  key={mood.label}
                  onPress={() => setSelectedMood(mood.label)}
                  style={{
                    backgroundColor: mood.backgroundColor,
                    borderColor: isSelected ? "#FFA1B9" : "transparent",
                  }}
                >
                  <Text className="text-[18px] leading-6">{mood.emoji}</Text>
                  <Text
                    className="text-[16px] leading-6"
                    style={{
                      color: isSelected ? colors.primary : "#51515B",
                      fontWeight: isSelected ? "600" : "500",
                    }}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mb-9 gap-4">
          <Text className="text-[23px] font-semibold leading-8 text-[#27272A]">
            Morning Intention
          </Text>
          <View
            className="rounded-[24px] bg-[#D8EEDB] px-7 py-7"
            style={{ boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)" }}
          >
            <View className="mb-4 flex-row items-center gap-4">
              <View className="size-12 items-center justify-center rounded-full bg-white/70">
                <Feather name="target" size={19} color="#0F9F7A" />
              </View>
              <Text className="text-[19px] font-semibold leading-7 text-[#303039]">
                Set your focus
              </Text>
            </View>
            <Text className="mb-5 max-w-[286px] text-[17px] leading-6 text-zinc-950/60">
              {"What is one thing you'd like to focus on today?"}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="min-h-[58px] justify-center rounded-[17px] bg-white/60 px-5"
            >
              <Text className="text-[16px] leading-6 text-[#71717B]">
                Tap to write your intention...
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-[24px] font-semibold leading-8 text-[#27272A]">
            Recent Entries
          </Text>
          <Pressable accessibilityRole="button" hitSlop={12}>
            <Text className="text-[16px] font-medium leading-6 text-[#FF2056]">
              See all
            </Text>
          </Pressable>
        </View>

        <View className="gap-5">
          {recentEntries.map((entry) => (
            <View
              className="rounded-[24px] px-7 py-6"
              key={entry.title}
              style={{
                backgroundColor: entry.backgroundColor,
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
              }}
            >
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-[14px] font-medium leading-5 text-[#71717B]">
                  {entry.date}
                </Text>
                <Text className="text-[31px] leading-9">{entry.emoji}</Text>
              </View>
              <Text className="mb-1 text-[19px] font-semibold leading-7 text-[#303039]">
                {entry.title}
              </Text>
              <Text className="text-[17px] leading-6 text-zinc-950/60">
                {entry.excerpt}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Today" />
    </View>
  );
}
