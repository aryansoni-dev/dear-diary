import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { Link, router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  InsightFeature,
  OnboardingInsightsPreview,
} from "@/components/onboarding/onboarding-insights-preview";
import { OnboardingProgressHeader } from "@/components/onboarding/onboarding-progress-header";
import { colors } from "@/constants/theme";
import { useOnboardingStore } from "@/store/onboarding-store";

const backHref = "/onboarding-screen-2" as Href;
const loginHref = "/login" as Href;
const nextHref = "/onboarding-screen-4" as Href;
const deepPlum = "#251238";
const mutedPlum = "#777188";
const headingFontFamily = Platform.select({
  android: "serif",
  default: "Georgia",
  ios: "Georgia",
});

export default function OnboardingScreenThree() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );

  const usableHeight = height - insets.top - insets.bottom;
  const isVeryCompact = usableHeight < 600;
  const isCompact = usableHeight < 720;
  const isMedium = usableHeight < 850;
  const isNarrow = width < 380;
  const horizontalPadding = isNarrow ? 22 : 30;
  const contentWidth = Math.min(width - horizontalPadding * 2, 390);
  const featureWidth = Math.min(contentWidth, 340);
  const headerHeight = isVeryCompact
    ? 34
    : isCompact
      ? 40
      : isMedium
        ? 44
        : 48;
  const previewHeight = isVeryCompact
    ? 215
    : isCompact
      ? Math.min(282, contentWidth)
      : isMedium
        ? Math.min(340, contentWidth * 1.02)
        : Math.min(390, contentWidth * 1.12);
  const headingSize = isVeryCompact ? 23 : isCompact ? 27 : isMedium ? 28 : 30;
  const headingLineHeight = headingSize + 4;
  const buttonHeight =
    height < 680 ? 46 : height < 740 ? 50 : height < 860 ? 54 : 60;
  const ctaTopPadding =
    height < 680 ? 8 : height < 740 ? 10 : height < 860 ? 14 : 24;
  const ctaGap = height < 680 ? 0 : height < 740 ? 2 : height < 860 ? 6 : 10;

  function handleSkipPress() {
    completeOnboarding();
    router.replace(loginHref);
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
        className="flex-1 items-center"
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
            filter: "blur(36px)",
            height: isCompact ? 180 : 250,
            right: -110,
            top: isCompact ? 160 : 220,
            width: isCompact ? 180 : 250,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#F4EFFA] opacity-50"
          style={{
            bottom: isCompact ? 120 : 160,
            filter: "blur(38px)",
            height: isCompact ? 160 : 220,
            left: -100,
            width: isCompact ? 160 : 220,
          }}
        />

        <OnboardingProgressHeader
          activeIndex={2}
          compact={isCompact}
          height={headerHeight}
          maxWidth={contentWidth}
          onSkipPress={handleSkipPress}
        />

        <View
          className="w-full flex-1 items-center justify-between"
          style={{
            maxWidth: contentWidth,
            paddingTop: isVeryCompact ? 2 : isCompact ? 5 : isMedium ? 7 : 8,
          }}
        >
          <View>
            <OnboardingInsightsPreview
              height={previewHeight}
              width={contentWidth}
            />
          </View>

          <View className="items-center">
            <Text
              allowFontScaling={false}
              className="text-center font-bold leading-6"
              style={{
                color: deepPlum,
                fontFamily: headingFontFamily,
                fontSize: headingSize,
                includeFontPadding: true,
                lineHeight: headingLineHeight + 2,
              }}
            >
              See how you feel.
            </Text>
            <View className="relative flex-row items-center justify-center">
              <Text
                allowFontScaling={false}
                className="text-center font-bold leading-6"
                style={{
                  color: deepPlum,
                  fontFamily: headingFontFamily,
                  fontSize: headingSize,
                  includeFontPadding: true,
                  lineHeight: headingLineHeight + 2,
                }}
              >
                Grow with{" "}
                <Text
                  allowFontScaling={false}
                  className="font-bold leading-6"
                  style={{
                    color: colors.brandPrimary,
                    fontFamily: headingFontFamily,
                  }}
                >
                  insight.
                </Text>
              </Text>
              <Text
                allowFontScaling={false}
                className="absolute leading-6 text-[#F5A4BC]"
                style={{
                  fontSize: isCompact ? 17 : 22,
                  right: isNarrow ? -15 : -22,
                  top: isCompact ? -3 : -5,
                }}
              >
                ✦
              </Text>
              <View
                className="absolute rounded-full bg-[#F58AB0]"
                style={{
                  bottom: isCompact ? 0 : -1,
                  height: 2,
                  right: 0,
                  transform: [{ rotate: "-1deg" }],
                  width: isCompact ? 88 : 108,
                }}
              />
            </View>
          </View>

          <Text
            allowFontScaling={false}
            className="max-w-[330px] text-center font-medium leading-6"
            style={{
              color: mutedPlum,
              fontSize: isVeryCompact
                ? 10
                : isCompact
                  ? 11.5
                  : isMedium
                    ? 13
                    : 14,
              lineHeight: isVeryCompact
                ? 14
                : isCompact
                  ? 17
                  : isMedium
                    ? 19
                    : 21,
              maxWidth: isVeryCompact
                ? 250
                : isCompact
                  ? 270
                  : isMedium
                    ? 280
                    : 285,
            }}
          >
            Track your emotions over time and discover patterns that reveal
            what truly matters to you.
          </Text>

          <View
            className="w-full flex-row items-stretch rounded-[28px] bg-white/75"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 22px 52px -30px rgba(154, 120, 206, 0.48)",
              height: isVeryCompact
                ? 66
                : isCompact
                  ? 76
                  : isMedium
                    ? 90
                    : 104,
              maxWidth: featureWidth,
              paddingHorizontal: isVeryCompact ? 5 : isCompact ? 7 : 10,
              paddingVertical: isVeryCompact
                ? 5
                : isCompact
                  ? 7
                  : isMedium
                    ? 8
                    : 9,
            }}
          >
            <InsightFeature
              compact={isMedium}
              icon="mood"
              label="Mood Tracking"
              subtitle="Track daily emotions"
            />
            <View className="w-px bg-[#F0DCE6]" />
            <InsightFeature
              compact={isMedium}
              icon="trend"
              label="Trend Analysis"
              subtitle="See your emotional patterns"
            />
            <View className="w-px bg-[#F0DCE6]" />
            <InsightFeature
              compact={isMedium}
              icon="personal"
              label="Personal Insights"
              subtitle="AI reveals what matters"
            />
          </View>
        </View>

        <View
          className="w-full items-center gap-4"
          style={{
            gap: ctaGap,
            maxWidth: contentWidth,
            paddingTop: ctaTopPadding,
          }}
        >
          <Link href={nextHref} asChild>
            <Pressable
              testID="onboarding-next-button"
              accessibilityLabel="Next onboarding screen"
              accessibilityRole="button"
              className="w-full flex-row items-center justify-center gap-3 rounded-full bg-brand-primary"
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
                Next →
              </Text>
            </Pressable>
          </Link>

          <Link href={backHref} asChild>
            <Pressable
              testID="onboarding-back-button"
              accessibilityLabel="Previous onboarding screen"
              accessibilityRole="button"
              className="px-4 py-1"
            >
              <Text
                allowFontScaling={false}
                className="text-[15px] font-medium leading-6"
                style={{ color: mutedPlum }}
              >
                Back
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}
