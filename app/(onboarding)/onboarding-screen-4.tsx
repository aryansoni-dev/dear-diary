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
  OnboardingRitualCard,
  OnboardingRitualFeatures,
} from "@/components/onboarding/onboarding-ritual-content";
import { OnboardingProgressHeader } from "@/components/onboarding/onboarding-progress-header";
import { colors } from "@/constants/theme";
import { useOnboardingStore } from "@/store/onboarding-store";

const backHref = "/onboarding-screen-3" as Href;
const loginHref = "/login" as Href;
const nextHref = "/onboarding-screen-5" as Href;
const deepPlum = "#251238";
const mutedPlum = "#777188";
const headingFontFamily = Platform.select({
  android: "serif",
  default: "Georgia",
  ios: "Georgia",
});

export default function OnboardingScreenFour() {
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
  const size = isTiny
    ? "tiny"
    : isCompact
      ? "compact"
      : isMedium
        ? "medium"
        : "wide";
  const horizontalPadding = isNarrow ? 22 : 30;
  const contentWidth = Math.min(width - horizontalPadding * 2, 390);
  const ritualWidth = Math.min(contentWidth, 340);
  const headerHeight = isTiny ? 34 : isCompact ? 40 : isMedium ? 44 : 48;
  const headingSize = isTiny ? 23 : isCompact ? 27 : isMedium ? 28 : 30;
  const headingLineHeight = headingSize + 4;
  const cardHeight = isTiny ? 128 : isCompact ? 140 : isMedium ? 154 : 170;
  const cardGap = isTiny ? 5 : isCompact ? 6 : isMedium ? 8 : 10;
  const featureHeight = isTiny ? 72 : isCompact ? 84 : isMedium ? 96 : 110;
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
            filter: "blur(38px)",
            height: isCompact ? 190 : 250,
            left: -110,
            top: isCompact ? 190 : 270,
            width: isCompact ? 190 : 250,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#F4EFFA] opacity-55"
          style={{
            bottom: isCompact ? 130 : 180,
            filter: "blur(38px)",
            height: isCompact ? 170 : 230,
            right: -110,
            width: isCompact ? 170 : 230,
          }}
        />
        <Text
          allowFontScaling={false}
          pointerEvents="none"
          className="absolute leading-6 text-[#F3B388]"
          style={{
            fontSize: isCompact ? 17 : 22,
            left: isNarrow ? 22 : 36,
            lineHeight: isCompact ? 21 : 26,
            top: isCompact ? 105 : 132,
          }}
        >
          ✦
        </Text>
        <Text
          allowFontScaling={false}
          pointerEvents="none"
          className="absolute leading-6 text-[#F69ABA]"
          style={{
            fontSize: isCompact ? 19 : 24,
            lineHeight: isCompact ? 23 : 28,
            right: isNarrow ? 20 : 34,
            top: isCompact ? 123 : 152,
          }}
        >
          ✦
        </Text>

        <OnboardingProgressHeader
          activeIndex={3}
          compact={isCompact}
          height={headerHeight}
          maxWidth={contentWidth}
          onSkipPress={handleSkipPress}
        />

        <View
          className="w-full flex-1 items-center justify-evenly"
          style={{ maxWidth: contentWidth }}
        >
          <View className="items-center" style={{ maxWidth: ritualWidth }}>
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
              Build daily rituals
            </Text>
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
              that{" "}
              <Text
                allowFontScaling={false}
                className="font-bold leading-6"
                style={{
                  color: colors.brandPrimary,
                  fontFamily: headingFontFamily,
                }}
              >
                transform
              </Text>{" "}
              you.
            </Text>
            <Text
              allowFontScaling={false}
              className="text-center font-medium leading-6"
              style={{
                color: mutedPlum,
                fontSize: isTiny ? 10 : isCompact ? 11.5 : isMedium ? 13 : 14,
                lineHeight: isTiny ? 14 : isCompact ? 17 : isMedium ? 19 : 21,
                marginTop: isTiny ? 2 : isCompact ? 4 : 6,
                maxWidth: isTiny ? 250 : isCompact ? 275 : 300,
              }}
            >
              Morning intentions and evening reflections help you stay mindful
              and grow consistently.
            </Text>
          </View>

          <View style={{ gap: cardGap, width: ritualWidth }}>
            <OnboardingRitualCard
              height={cardHeight}
              size={size}
              variant="morning"
              width={ritualWidth}
            />
            <OnboardingRitualCard
              height={cardHeight}
              size={size}
              variant="evening"
              width={ritualWidth}
            />
          </View>

          <View style={{ width: ritualWidth }}>
            <OnboardingRitualFeatures height={featureHeight} size={size} />
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
              className="w-full items-center justify-center rounded-full"
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
