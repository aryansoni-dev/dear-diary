import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

const backHref = "/onboarding-screen-1" as Href;
const loginHref = "/login" as Href;
const nextHref = "/onboarding-screen-3" as Href;
const cream = "#FFF9F3";
const deepPlum = "#251238";
const mutedPlum = "#777188";
const headingFontFamily = Platform.select({
  android: "serif",
  default: "Georgia",
  ios: "Georgia",
});

export default function OnboardingScreenTwo() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore(
    (state) => state.completeOnboarding,
  );
  const usableHeight = height - insets.top - insets.bottom;
  const isTiny = usableHeight < 600;
  const isVeryCompact = usableHeight < 720;
  const isCompact = usableHeight < 850;
  const isNarrow = width < 380;

  const topPadding = Math.max(
    insets.top + 4,
    isTiny ? 12 : isVeryCompact ? 16 : isCompact ? 22 : 34,
  );
  const bottomPadding = Math.max(
    insets.bottom,
    isTiny ? 6 : isVeryCompact ? 8 : isCompact ? 12 : 20,
  );
  const headerHeight = isTiny ? 34 : isVeryCompact ? 40 : isCompact ? 44 : 48;
  const buttonHeight = isTiny ? 46 : isVeryCompact ? 50 : isCompact ? 54 : 60;
  const ctaTopPadding = isTiny ? 8 : isVeryCompact ? 10 : isCompact ? 14 : 24;
  const ctaGap = isTiny ? 0 : isVeryCompact ? 2 : isCompact ? 6 : 10;
  const backLineHeight = isTiny ? 24 : 28;
  const mainHeight =
    height -
    topPadding -
    bottomPadding -
    headerHeight -
    ctaTopPadding -
    buttonHeight -
    ctaGap -
    backLineHeight;

  const contentWidth = Math.min(width - (isNarrow ? 48 : 64), 390);
  const chatHeight = isTiny
    ? 198
    : isVeryCompact
      ? Math.min(258, contentWidth * 0.92)
      : isCompact
        ? Math.min(312, contentWidth * 0.94)
        : Math.min(360, contentWidth * 1.02);
  const chatWidth = Math.min(contentWidth - 40, chatHeight * 0.82, 306);
  const headingSize = isTiny ? 23 : isVeryCompact ? 27 : isCompact ? 28 : 30;
  const headingLineHeight = headingSize + 4;
  const bodySize = isTiny ? 10 : isVeryCompact ? 11.5 : isCompact ? 13 : 14;
  const bodyLineHeight = isTiny ? 14 : isVeryCompact ? 17 : isCompact ? 19 : 21;
  const featureIconSize = isTiny ? 34 : isVeryCompact ? 36 : isCompact ? 40 : 46;
  const featureLabelSize = isTiny ? 9 : isVeryCompact ? 9.5 : isCompact ? 10 : 11;
  const featureLabelLineHeight = isTiny ? 12 : isVeryCompact ? 13 : isCompact ? 14 : 16;
  const featureItemHeight =
    featureIconSize + 8 + featureLabelLineHeight * 2;

  function handleSkipPress() {
    completeOnboarding();
    router.replace(loginHref);
  }

  return (
    <LinearGradient
      colors={["#FFF4F7", cream, "#FFFDF9"]}
      locations={[0, 0.52, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          flexGrow: 1,
          minHeight: height,
          paddingBottom: bottomPadding,
          paddingHorizontal: isNarrow ? 24 : 32,
          paddingTop: topPadding,
        }}
        scrollEnabled
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar hidden />

        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#F4EFFA] opacity-75"
          style={{
            filter: "blur(32px)",
            height: isCompact ? 230 : 300,
            left: -96,
            top: isTiny ? 100 : isCompact ? 132 : 220,
            width: isCompact ? 230 : 300,
          }}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full bg-[#FFDDE8] opacity-70"
          style={{
            bottom: isCompact ? 150 : 190,
            filter: "blur(36px)",
            height: isCompact ? 190 : 250,
            right: -90,
            width: isCompact ? 190 : 250,
          }}
        />
        <OnboardingProgressHeader
          activeIndex={1}
          compact={isCompact}
          height={headerHeight}
          maxWidth={contentWidth}
          onSkipPress={handleSkipPress}
        />

        <View
          className="w-full items-center"
          style={{
            justifyContent: "space-between",
            maxWidth: contentWidth,
            minHeight: Math.max(mainHeight, 0),
          }}
        >
          <View
            className="relative items-center justify-center"
            style={{ marginTop: isTiny ? 2 : isVeryCompact ? 4 : isCompact ? 6 : 12 }}
          >
            <View
              className="absolute rounded-full bg-[#F4EFFA] opacity-70"
              style={{
                filter: "blur(26px)",
                height: chatWidth * 0.92,
                width: chatWidth * 0.92,
              }}
            />
            <View
              className="absolute rounded-full bg-[#FFDDE8] opacity-50"
              style={{
                bottom: -10,
                filter: "blur(30px)",
                height: chatWidth * 0.62,
                right: -26,
                width: chatWidth * 0.62,
              }}
            />
            <View
              className="absolute rounded-full border border-[#E8D6FF]"
              style={{
                height: chatHeight * 0.76,
                opacity: 0.58,
                right: -34,
                top: -22,
                transform: [{ rotate: "-18deg" }],
                width: 64,
              }}
            />
            <Text
              allowFontScaling={false}
              pointerEvents="none"
              className="absolute leading-6 text-[#F1B884]"
              style={{
                fontSize: isTiny ? 18 : isCompact ? 22 : 30,
                left: -18,
                top: chatHeight * 0.12,
                zIndex: 0,
              }}
            >
              ✦
            </Text>
            <Text
              allowFontScaling={false}
              pointerEvents="none"
              className="absolute leading-6 text-[#E9B6EF]"
              style={{
                fontSize: isTiny ? 16 : isCompact ? 19 : 25,
                right: -14,
                top: chatHeight * 0.28,
                zIndex: 0,
              }}
            >
              ✦
            </Text>
            <Text
              allowFontScaling={false}
              pointerEvents="none"
              className="absolute leading-6 text-[#F5A4BC]"
              style={{
                bottom: chatHeight * 0.2,
                fontSize: isTiny ? 16 : isCompact ? 19 : 24,
                left: -12,
                zIndex: 0,
              }}
            >
              ✧
            </Text>

            <View
              className="overflow-hidden bg-white/92"
              style={{
                borderColor: "rgba(244, 239, 250, 0.95)",
                borderCurve: "continuous",
                borderRadius: 34,
                borderWidth: 8,
                boxShadow: "0 28px 70px -24px rgba(154, 120, 206, 0.5)",
                height: chatHeight,
                width: chatWidth,
                zIndex: 1,
              }}
            >
              <Image
                source={images.onboardingAiChatCard}
                contentFit="cover"
                contentPosition="top center"
                accessibilityLabel="DearDiary AI chat preview"
                style={{ height: "100%", width: "100%" }}
              />
            </View>
          </View>

          <View
            className="items-center"
            style={{
              paddingBottom: 2,
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
              Never wonder
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
              where to{" "}
              <Text
                allowFontScaling={false}
                className="font-bold leading-6"
                style={{
                  color: colors.brandPrimary,
                  fontFamily: headingFontFamily,
                  includeFontPadding: true,
                }}
              >
                begin.
              </Text>
            </Text>
          </View>

          <View className="h-px bg-[#FFD1DE]" style={{ width: 210 }} />

          <Text
            allowFontScaling={false}
            className="max-w-[330px] text-center font-medium leading-6"
            style={{
              color: mutedPlum,
              fontSize: bodySize,
              lineHeight: bodyLineHeight,
            }}
          >
            DearDiary AI asks the right questions, listens to your thoughts,
            and guides you toward deeper self-reflection.
          </Text>

          <View
            className="w-full flex-row items-start justify-between rounded-[28px] bg-white/82"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 24px 55px -30px rgba(154, 120, 206, 0.46)",
              gap: 6,
              paddingHorizontal: isNarrow ? 14 : 20,
              paddingVertical: isTiny
                ? 8
                : isVeryCompact
                  ? 10
                  : isCompact
                    ? 11
                    : 14,
            }}
          >
            <FeatureItem
              background="#FFDDE8"
              color={colors.brandPrimary}
              iconSize={featureIconSize}
              icon="message-square"
              label="AI Prompts"
              labelLineHeight={featureLabelLineHeight}
              labelSize={featureLabelSize}
            />
            <View
              className="w-px self-center bg-[#F1DCE8]"
              style={{ height: featureItemHeight - 10 }}
            />
            <FeatureItem
              background="#E9D5FF"
              color="#8B5CF6"
              iconSize={featureIconSize}
              icon="brain"
              label="Smart Follow-ups"
              labelLineHeight={featureLabelLineHeight}
              labelSize={featureLabelSize}
            />
            <View
              className="w-px self-center bg-[#F1DCE8]"
              style={{ height: featureItemHeight - 10 }}
            />
            <FeatureItem
              background="#D8EEDB"
              color="#059669"
              iconSize={featureIconSize}
              icon="heart"
              label="Personalized Reflections"
              labelLineHeight={featureLabelLineHeight}
              labelSize={featureLabelSize}
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
              className="w-full items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.brandPrimary,
                boxShadow: "0 18px 36px -14px rgba(255, 32, 86, 0.72)",
                height: buttonHeight,
              }}
            >
              <Text className="text-[17px] font-bold leading-6 text-white">
                Next →
              </Text>
            </Pressable>
          </Link>

          <Link href={backHref} asChild>
            <Pressable className="px-4 py-1">
              <Text
                className="text-[15px] font-medium leading-6"
                style={{ color: mutedPlum }}
              >
                Back
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

type FeatureItemProps = {
  background: string;
  color: string;
  icon: "brain" | "heart" | "message-square";
  iconSize: number;
  label: string;
  labelLineHeight: number;
  labelSize: number;
};

function FeatureItem({
  background,
  color,
  icon,
  iconSize,
  label,
  labelLineHeight,
  labelSize,
}: FeatureItemProps) {
  const labelHeight = labelLineHeight * 2;

  return (
    <View
      className="flex-1 items-center gap-2"
      style={{ height: iconSize + 8 + labelHeight }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          backgroundColor: background,
          height: iconSize,
          width: iconSize,
        }}
      >
        {icon === "brain" ? (
          <MaterialCommunityIcons
            name="brain"
            size={iconSize * 0.56}
            color={color}
          />
        ) : (
          <Feather name={icon} size={iconSize * 0.52} color={color} />
        )}
      </View>
      <Text
        adjustsFontSizeToFit
        allowFontScaling={false}
        className="w-full text-center font-bold leading-6"
        minimumFontScale={0.85}
        numberOfLines={2}
        style={{
          color: "#27272A",
          fontSize: labelSize,
          height: labelHeight,
          includeFontPadding: false,
          lineHeight: labelLineHeight,
          textAlignVertical: "top",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
