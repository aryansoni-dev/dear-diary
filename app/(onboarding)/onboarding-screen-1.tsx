import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { Link, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OnboardingProgressHeader } from "@/components/onboarding/onboarding-progress-header";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { useOnboardingStore } from "@/store/onboarding-store";

const loginHref = "/login" as Href;
const nextHref = "/onboarding-screen-2" as Href;
const cream = "#FFF9F3";
const deepPlum = "#251238";
const mutedPlum = "#777188";
const headingFontFamily = Platform.select({
  android: "serif",
  default: "Georgia",
  ios: "Georgia",
});

export default function OnboardingScreenOne() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );
  const usableHeight = height - insets.top - insets.bottom;
  const isTiny = usableHeight < 600;
  const isVeryCompact = usableHeight < 740;
  const isCompact = usableHeight < 860;
  const isTextCompact = usableHeight < 720;
  const isTextMedium = usableHeight < 850;
  const isNarrow = width < 380;

  const horizontalPadding = isNarrow ? 28 : 34;
  const heroWidth = Math.min(
    width - horizontalPadding * 2,
    isVeryCompact ? 244 : isCompact ? 272 : 306,
  );
  const heroHeight = isVeryCompact ? 270 : isCompact ? 306 : 354;
  const headingSize = isTiny ? 27 : isTextCompact ? 31 : isTextMedium ? 36 : 40;
  const headingLineHeight = headingSize + 4;
  const bodySize = isTiny ? 11.5 : isTextCompact ? 13 : isTextMedium ? 15 : 16;
  const bodyLineHeight = isTiny ? 17 : isTextCompact ? 20 : isTextMedium ? 23 : 25;

  function handleExistingAccountPress() {
    completeOnboarding();
    router.replace(loginHref);
  }

  function handleSkipPress() {
    completeOnboarding();
    router.replace(loginHref);
  }

  return (
    <LinearGradient
      colors={["#FFF4F7", cream, "#FFFDF9"]}
      locations={[0, 0.5, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          minHeight: height,
          paddingBottom: Math.max(
            insets.bottom,
            isVeryCompact ? 18 : isCompact ? 22 : 30,
          ),
          paddingHorizontal: isNarrow ? 24 : 32,
          paddingTop: Math.max(
            insets.top + 4,
            isVeryCompact ? 24 : isCompact ? 32 : 46,
          ),
        }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden />

        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#FFDDE8] opacity-60"
          style={{
            filter: "blur(30px)",
            height: isCompact ? 170 : 230,
            left: -80,
            top: isCompact ? 172 : 236,
            width: isCompact ? 170 : 230,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#F4EFFA] opacity-70"
          style={{
            filter: "blur(34px)",
            height: isCompact ? 138 : 164,
            right: -80,
            top: isCompact ? 224 : 314,
            width: isCompact ? 138 : 164,
          }}
        />
        <OnboardingProgressHeader
          activeIndex={0}
          compact={isCompact}
          onSkipPress={handleSkipPress}
        />

        <View className="w-full max-w-[390px] flex-1 items-center">
          <View
            className="relative items-center justify-center"
            style={{ marginTop: isVeryCompact ? 12 : isCompact ? 20 : 28 }}
          >
            <View
              className="absolute rounded-full bg-[#FFDDE8] opacity-70"
              style={{
                filter: "blur(24px)",
                height: heroWidth * 0.84,
                left: -22,
                top: 12,
                width: heroWidth * 0.84,
              }}
            />
            <View
              className="absolute rounded-full bg-[#F4EFFA] opacity-80"
              style={{
                filter: "blur(30px)",
                height: heroWidth * 0.76,
                right: -24,
                top: 28,
                width: heroWidth * 0.76,
              }}
            />
            <Text
              pointerEvents="none"
              className="absolute text-center leading-6 text-[#F1BD91]"
              style={{
                fontSize: isCompact ? 22 : 26,
                right: isNarrow ? -16 : -26,
                top: isCompact ? 40 : 58,
              }}
            >
              ✦
            </Text>
            <Text
              pointerEvents="none"
              className="absolute text-center leading-6 text-[#FFDDE8]"
              style={{
                fontSize: isCompact ? 13 : 16,
                right: isNarrow ? -22 : -34,
                top: heroHeight * 0.45,
              }}
            >
              ✦
            </Text>
            <Text
              pointerEvents="none"
              className="absolute text-center leading-6 text-[#F5A4BC]"
              style={{
                bottom: isCompact ? 44 : 54,
                fontSize: isCompact ? 28 : 32,
                left: isNarrow ? -18 : -28,
              }}
            >
              ✿
            </Text>
            <View
              pointerEvents="none"
              className="absolute rounded-full bg-[#F9B7C9] opacity-40"
              style={{
                bottom: isCompact ? 26 : 34,
                height: isCompact ? 20 : 28,
                right: isNarrow ? -22 : -36,
                transform: [{ rotate: "-16deg" }],
                width: isCompact ? 42 : 54,
              }}
            />

            <View
              className="overflow-hidden border-[7px] border-white/90 bg-white/40"
              style={{
                borderCurve: "continuous",
                borderBottomLeftRadius: isCompact ? 28 : 34,
                borderBottomRightRadius: isCompact ? 28 : 34,
                borderTopLeftRadius: heroWidth / 2,
                borderTopRightRadius: heroWidth / 2,
                boxShadow: "0 28px 70px -18px rgba(255, 32, 86, 0.32)",
                height: heroHeight,
                width: heroWidth,
              }}
            >
              <Image
                source={images.onboardingReflect}
                contentFit="cover"
                accessibilityLabel="Person sitting peacefully journaling"
                style={{ height: "100%", width: "100%" }}
              />
            </View>
          </View>

          <View
            className="items-center"
            style={{
              marginTop: isVeryCompact ? 18 : isCompact ? 22 : 28,
              paddingBottom: 4,
            }}
          >
            <Text
              allowFontScaling={false}
              className="text-center font-bold leading-6"
              style={{
                color: deepPlum,
                fontFamily: headingFontFamily,
                fontSize: headingSize,
                includeFontPadding: true,
                lineHeight: headingLineHeight,
              }}
            >
              Your thoughts
            </Text>
            <Text
              allowFontScaling={false}
              className="text-center font-bold leading-6"
              style={{
                color: deepPlum,
                fontFamily: headingFontFamily,
                fontSize: headingSize,
                includeFontPadding: true,
                lineHeight: headingLineHeight,
                marginTop: -4,
              }}
            >
              deserve a
            </Text>
            <View className="relative">
              <Text
                allowFontScaling={false}
                className="text-center font-bold leading-6"
                style={{
                  color: colors.brandPrimary,
                  fontFamily: headingFontFamily,
                  fontSize: headingSize,
                  includeFontPadding: true,
                  lineHeight: headingLineHeight + 8,
                  marginTop: -4,
                  paddingBottom: 4,
                }}
              >
                safe place.
              </Text>
              <Text
                pointerEvents="none"
                className="absolute text-center leading-6 text-[#F5A4BC]"
                style={{
                  fontSize: isCompact ? 20 : 24,
                  right: isCompact ? -24 : -32,
                  top: isCompact ? 6 : 8,
                }}
              >
                ✧
              </Text>
            </View>
          </View>

          <Text
            allowFontScaling={false}
            className="max-w-[310px] text-center font-medium leading-6"
            style={{
              color: mutedPlum,
              fontSize: bodySize,
              lineHeight: bodyLineHeight,
              marginTop: isVeryCompact ? 10 : 14,
            }}
          >
            DearDiary is your personal space to write freely, reflect deeply,
            and grow every day.
          </Text>

          <View
            className="flex-row items-center justify-center gap-4"
            style={{ marginTop: isVeryCompact ? 14 : 20 }}
          >
            <View className="h-px bg-[#FFD1DE]" style={{ width: 66 }} />
            <Text className="text-center text-[24px] leading-6 text-[#F5A4BC]">
              ✿
            </Text>
            <View className="h-px bg-[#FFD1DE]" style={{ width: 66 }} />
          </View>
        </View>

        <View
          className="w-full max-w-[390px] items-center gap-4"
          style={{ paddingTop: isVeryCompact ? 18 : isCompact ? 24 : 32 }}
        >
          <Link href={nextHref} asChild>
            <Pressable
              testID="onboarding-next-button"
              accessibilityLabel="Next onboarding screen"
              accessibilityRole="button"
              className="w-full items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.brandPrimary,
                boxShadow: "0 18px 36px -14px rgba(255, 32, 86, 0.72)",
                height: isCompact ? 58 : 64,
              }}
            >
              <Text className="text-[17px] font-bold leading-6 text-white">
                Get Started →
              </Text>
            </Pressable>
          </Link>

          <Pressable
            testID="onboarding-login-button"
            accessibilityLabel="I already have an account"
            accessibilityRole="button"
            className="px-4 py-1"
            onPress={handleExistingAccountPress}
          >
            <Text
              className="text-[15px] font-medium leading-6"
              style={{ color: mutedPlum }}
            >
              I already have an account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
