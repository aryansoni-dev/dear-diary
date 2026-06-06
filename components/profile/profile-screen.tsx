import { useAuth } from "@clerk/expo";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import {
  accountItems,
  preferenceItems,
  profileAchievements,
  profileInsights,
  profileStats,
  type ProfileMenuItem,
} from "@/data/profile";

const colors = {
  iconMuted: "#A1A1AA",
  primary: "#FF2056",
};

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not sign you out. Please try again.";
      Alert.alert("Sign out failed", message);
    } finally {
      setIsSigningOut(false);
    }
  }

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/home-tab");
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#FCE8F8", "#F8F3FC", "#FFFFFF"]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.48, 0.78]}
        start={{ x: 0, y: 0 }}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 36,
          paddingHorizontal: 28,
          paddingTop: Math.max(66, insets.top + 34),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            onPress={handleBackPress}
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </Pressable>

          <Text className="text-[17px] font-semibold leading-6 text-[#27272A]">
            Profile
          </Text>

          <Pressable
            accessibilityLabel="Settings"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="settings" size={22} color="#51515B" />
          </Pressable>
        </View>

        <View className="items-center pt-7">
          <View
            className="size-24 items-center justify-center rounded-full bg-[#F7DDF2]"
            style={{ boxShadow: "0 8px 24px rgba(229, 177, 222, 0.46)" }}
          >
            <Text className="text-[34px] font-bold leading-[40px] text-[#FF2056]">
              A
            </Text>
          </View>
          <Text className="mt-4 text-center text-[25px] font-bold leading-8 text-[#27272A]">
            Aryan
          </Text>
          <Text className="mt-1 text-center text-[15px] leading-5 text-[#71717B]">
            Journaling since March 2026 🌸
          </Text>
        </View>

        <View className="flex-row gap-4 pt-7">
          {profileStats.map((stat) => (
            <View
              className="h-[116px] flex-1 items-center justify-center gap-1 rounded-[24px]"
              key={stat.label}
              style={{
                backgroundColor: stat.backgroundColor,
                boxShadow: "0 2px 5px rgba(39, 39, 42, 0.12)",
              }}
            >
              <Text className="text-[26px] leading-5">{stat.emoji}</Text>
              <Text className="text-[24px] font-bold leading-5 text-[#27272A]">
                {stat.value}
              </Text>
              <Text className="text-[13px] font-medium leading-5 text-[#71717B]">
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <View className="pt-9">
          <SectionTitle>Your Emotional Snapshot</SectionTitle>
          <View
            className="mt-5 rounded-[24px] bg-white px-6 py-6"
            style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
          >
            {profileInsights.map((insight, index) => (
              <View key={insight.label}>
                <View className="flex-row items-center gap-5">
                  <View className="size-11 items-center justify-center">
                    <Text className="text-[23px] leading-8">
                      {insight.emoji}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[13px] font-medium leading-4 text-[#71717B]">
                      {insight.label}
                    </Text>
                    <Text className="mt-1 text-[17px] font-semibold leading-6 text-[#27272A]">
                      {insight.value}
                    </Text>
                  </View>
                </View>
                {index < profileInsights.length - 1 ? (
                  <View className="my-5 h-px bg-transparent" />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View className="pt-10">
          <SectionTitle>Achievements</SectionTitle>
          <View className="mt-5 gap-3.5">
            {profileAchievements.map((achievement) => (
              <View
                className="min-h-[95px] flex-row items-center gap-4 rounded-[24px] px-5 py-4"
                key={achievement.title}
                style={{
                  backgroundColor: achievement.backgroundColor,
                  boxShadow: "0 2px 5px rgba(39, 39, 42, 0.11)",
                }}
              >
                <View className="size-14 items-center justify-center rounded-[17px] bg-white/75">
                  <Text className="text-[27px] leading-8">
                    {achievement.emoji}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-semibold leading-5 text-[#27272A]">
                    {achievement.title}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
                    {achievement.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <MenuSection items={preferenceItems} title="Preferences" />
        <MenuSection items={accountItems} title="Account" />

        <View className="items-center pt-9">
          <Pressable
            accessibilityRole="button"
            className="min-h-10 flex-row items-center justify-center gap-2 px-5"
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Feather name="log-out" size={17} color={colors.primary} />
            )}
            <Text className="text-[15px] font-semibold leading-5 text-[#FF2056]">
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Profile" />
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="text-[21px] font-bold leading-7 text-[#27272A]">
      {children}
    </Text>
  );
}

function MenuSection({
  items,
  title,
}: {
  items: ProfileMenuItem[];
  title: string;
}) {
  return (
    <View className="pt-10">
      <SectionTitle>{title}</SectionTitle>
      <View
        className="mt-5 rounded-[24px] bg-white p-2"
        style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
      >
        {items.map((item, index) => (
          <View key={item.label}>
            <Pressable
              accessibilityRole="button"
              className="min-h-[58px] flex-row items-center justify-between gap-3 rounded-[18px] p-3"
            >
              <View className="flex-1 flex-row items-center gap-4">
                <View
                  className="size-10 items-center justify-center rounded-[13px]"
                  style={{ backgroundColor: item.backgroundColor }}
                >
                  <MenuIcon item={item} />
                </View>
                <Text className="flex-1 text-[15px] font-medium leading-5 text-[#27272A]">
                  {item.label}
                </Text>
              </View>

              {item.badge ? (
                <View className="rounded-full bg-[#FF2056] px-3 py-1">
                  <Text className="text-[10px] font-semibold leading-3 text-white">
                    {item.badge}
                  </Text>
                </View>
              ) : (
                <Feather
                  name="chevron-right"
                  size={22}
                  color={colors.iconMuted}
                />
              )}
            </Pressable>

            {index < items.length - 1 ? (
              <View className="mx-3 h-px bg-[#E4E4E7]" />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function MenuIcon({ item }: { item: ProfileMenuItem }) {
  if (item.iconSet === "ionicons") {
    return <Ionicons name={item.icon} size={21} color={item.iconColor} />;
  }

  if (item.iconSet === "material-community") {
    return (
      <MaterialCommunityIcons
        name={item.icon}
        size={21}
        color={item.iconColor}
      />
    );
  }

  return <Feather name={item.icon} size={21} color={item.iconColor} />;
}
