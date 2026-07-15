import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OnboardingProgressHeader } from "@/components/onboarding/onboarding-progress-header";
import {
  OnboardingOverviewFeatureStrip,
  OnboardingOverviewPreview,
} from "@/components/onboarding/onboarding-overview-content";
import { colors } from "@/constants/theme";
import { useOnboardingStore } from "@/store/onboarding-store";

const deepPlum = "#251238";
const mutedPlum = "#777188";
const headingFontFamily = Platform.select({
  android: "serif",
  default: "Georgia",
  ios: "Georgia",
});

export default function OnboardingScreenFive() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );

  const usableHeight = height - insets.top - insets.bottom;
  const isTiny = usableHeight < 600;
  const isCompact = usableHeight < 720;
  const isMedium = usableHeight < 850;
  const isNarrow = width < 380;
  const horizontalPadding = isNarrow ? 18 : 24;
  const contentWidth = Math.min(width - horizontalPadding * 2, 390);
  const headerHeight = isTiny ? 34 : isCompact ? 40 : isMedium ? 44 : 48;
  const headingSize = isTiny ? 23 : isCompact ? 27 : isMedium ? 29 : 31;
  const headingLineHeight = headingSize + 4;
  const subtitleSize = isTiny ? 10 : isCompact ? 11.5 : isMedium ? 13 : 14;
  const subtitleLineHeight = isTiny ? 14 : isCompact ? 17 : isMedium ? 19 : 21;
  const previewHeight = isTiny ? 140 : isCompact ? 205 : isMedium ? 270 : 330;
  const featureHeight = isTiny ? 88 : isCompact ? 98 : isMedium ? 112 : 126;
  const featureIconSize = isTiny ? 38 : isCompact ? 42 : isMedium ? 46 : 52;
  const buttonHeight =
    height < 680 ? 46 : height < 740 ? 50 : height < 860 ? 54 : 60;
  const ctaTopPadding =
    height < 680 ? 6 : height < 740 ? 8 : height < 860 ? 12 : 18;
  const ctaGap = height < 680 ? 0 : height < 740 ? 2 : height < 860 ? 6 : 10;

  function handleStartWritingPress() {
    completeOnboarding();
    router.replace("/signup");
  }

  function handleMaybeLaterPress() {
    completeOnboarding();
    router.replace("/login");
  }

  return (
    <LinearGradient
      colors={["#FFF5F7", "#FFF9F3", "#FFFDFC"]}
      locations={[0, 0.55, 1]}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar hidden />

      <View
        className="flex-1 items-center overflow-hidden"
        style={{
          paddingBottom: Math.max(insets.bottom, isCompact ? 6 : 12),
          paddingHorizontal: horizontalPadding,
          paddingTop: Math.max(insets.top + 4, isCompact ? 12 : 20),
        }}
      >
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#FFDDE8] opacity-45"
          style={{
            filter: "blur(38px)",
            height: isCompact ? 180 : 250,
            left: -115,
            top: isCompact ? 185 : 245,
            width: isCompact ? 180 : 250,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#F4EFFA] opacity-55"
          style={{
            bottom: isCompact ? 135 : 180,
            filter: "blur(38px)",
            height: isCompact ? 170 : 230,
            right: -110,
            width: isCompact ? 170 : 230,
          }}
        />
        <Text
          allowFontScaling={false}
          pointerEvents="none"
          className="absolute leading-6 text-[#F58AB0]"
          style={{
            fontSize: isCompact ? 28 : 34,
            left: isNarrow ? 18 : 28,
            lineHeight: isCompact ? 30 : 36,
            top: isCompact ? 102 : 132,
          }}
        >
          ✧
        </Text>
        <Text
          allowFontScaling={false}
          pointerEvents="none"
          className="absolute leading-6 text-[#F3B388]"
          style={{
            fontSize: isCompact ? 17 : 22,
            lineHeight: isCompact ? 21 : 26,
            right: isNarrow ? 28 : 42,
            top: isCompact ? 150 : 192,
          }}
        >
          ✦
        </Text>

        <OnboardingProgressHeader
          activeIndex={4}
          compact={isCompact}
          height={headerHeight}
          maxWidth={contentWidth}
          onSkipPress={handleMaybeLaterPress}
        />

        <View
          className="w-full flex-1 items-center justify-between"
          style={{ maxWidth: contentWidth }}
        >
          <View
            className="items-center"
            style={{
              paddingTop: isTiny ? 0 : isCompact ? 4 : isMedium ? 8 : 10,
            }}
          >
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              className="text-center font-bold leading-6"
              minimumFontScale={0.86}
              numberOfLines={2}
              style={{
                color: deepPlum,
                fontFamily: headingFontFamily,
                fontSize: headingSize,
                includeFontPadding: true,
                lineHeight: headingLineHeight + 2,
                maxWidth: isNarrow ? 300 : 340,
              }}
            >
              Everything you need in one{" "}
              <Text
                allowFontScaling={false}
                className="font-bold leading-6"
                style={{
                  color: colors.brandPrimary,
                  fontFamily: headingFontFamily,
                }}
              >
                peaceful
              </Text>{" "}
              space.
            </Text>
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              className="mt-2 text-center font-medium leading-6"
              minimumFontScale={0.86}
              numberOfLines={2}
              style={{
                color: mutedPlum,
                fontSize: subtitleSize,
                lineHeight: subtitleLineHeight,
                maxWidth: isTiny ? 260 : isCompact ? 285 : 320,
              }}
            >
              A beautiful journaling experience designed to support your mind,
              every day.
            </Text>
          </View>

          <OnboardingOverviewPreview
            height={previewHeight}
            narrow={isNarrow}
            width={contentWidth}
          />

          <OnboardingOverviewFeatureStrip
            compact={isMedium}
            height={featureHeight}
            iconSize={featureIconSize}
            tiny={isTiny}
          />
        </View>

        <View
          className="w-full items-center gap-4"
          style={{
            gap: ctaGap,
            maxWidth: contentWidth,
            paddingTop: ctaTopPadding,
          }}
        >
          <Pressable
            testID="onboarding-complete-button"
            accessibilityLabel="Start writing"
            accessibilityRole="button"
            className="w-full items-center justify-center rounded-full"
            onPress={handleStartWritingPress}
            style={{
              backgroundColor: colors.brandPrimary,
              boxShadow: "0 18px 36px -14px rgba(255, 32, 86, 0.72)",
              height: buttonHeight,
            }}
          >
            <Text
              allowFontScaling={false}
              className="text-[17px] font-bold leading-6 text-white"
            >
              Start Writing ✨
            </Text>
          </Pressable>

          <Pressable
            testID="onboarding-maybe-later-button"
            accessibilityLabel="Maybe later"
            accessibilityRole="button"
            className="px-4 py-1"
            onPress={handleMaybeLaterPress}
          >
            <Text
              allowFontScaling={false}
              className="text-[15px] font-medium leading-6"
              style={{ color: "#A5A0B1" }}
            >
              Maybe later
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
