import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, type ImageSourcePropType, View } from "react-native";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";

const deepPlum = "#251238";
const mutedPlum = "#777188";

const featureCards = [
  {
    background: "#FFE1EA",
    color: colors.brandPrimary,
    description: "Write freely in a clean, distraction-free space.",
    icon: "book-open",
    iconSet: "feather",
    label: "Beautiful\nJournaling",
  },
  {
    background: "#EEE2FA",
    color: "#9B51E0",
    description: "Your journal is always just yours.",
    icon: "lock",
    iconSet: "feather",
    label: "Private &\nSecure",
  },
  {
    background: "#DDF4E8",
    color: "#0BA574",
    description: "Your memories are safe and accessible.",
    icon: "cloud-outline",
    iconSet: "ionicons",
    label: "Backup &\nSync",
  },
  {
    background: "#FFEAD8",
    color: "#F97316",
    description: "Themes and settings that feel like you.",
    icon: "color-palette-outline",
    iconSet: "ionicons",
    label: "Personalize\nYour Space",
  },
] as const;

type OnboardingOverviewPreviewProps = {
  height: number;
  narrow: boolean;
  width: number;
};

export function OnboardingOverviewPreview({
  height,
  narrow,
  width,
}: OnboardingOverviewPreviewProps) {
  const centerHeight = height;
  const centerWidth = Math.min(
    width * (narrow ? 0.54 : 0.58),
    centerHeight * 0.58,
  );
  const sideHeight = centerHeight * 0.82;
  const sideWidth = centerWidth * 0.82;
  const sideOffset = Math.min(width * 0.3, centerWidth * 1.02);

  return (
    <View
      className="relative w-full items-center justify-center"
      style={{ height: centerHeight + 4 }}
    >
      <View
        pointerEvents="none"
        className="absolute rounded-full bg-[#FFDDE8] opacity-55"
        style={{
          filter: "blur(36px)",
          height: centerHeight * 0.9,
          width: centerHeight * 0.9,
        }}
      />
      <EmptyPreviewCard
        height={sideHeight}
        image={images.reflectTabMockup}
        opacity={0.68}
        style={{
          left: Math.max(0, width / 2 - sideOffset - sideWidth),
          top: centerHeight * 0.12,
        }}
        width={sideWidth}
      />
      <EmptyPreviewCard
        height={sideHeight}
        image={images.insightsTabMockup}
        opacity={0.68}
        style={{
          right: Math.max(0, width / 2 - sideOffset - sideWidth),
          top: centerHeight * 0.12,
        }}
        width={sideWidth}
      />
      <EmptyPreviewCard
        height={centerHeight}
        image={images.homeTabMockup}
        opacity={0.92}
        style={{ left: (width - centerWidth) / 2, top: 0 }}
        width={centerWidth}
      />
    </View>
  );
}

type OnboardingOverviewFeatureStripProps = {
  compact: boolean;
  height: number;
  iconSize: number;
  tiny: boolean;
};

export function OnboardingOverviewFeatureStrip({
  compact,
  height,
  iconSize,
  tiny,
}: OnboardingOverviewFeatureStripProps) {
  return (
    <View
      className="w-full flex-row items-stretch rounded-[28px] bg-white/75"
      style={{
        borderCurve: "continuous",
        boxShadow: "0 22px 52px -30px rgba(255, 100, 145, 0.45)",
        height,
        paddingHorizontal: tiny ? 5 : compact ? 6 : 8,
        paddingVertical: tiny ? 6 : compact ? 7 : 9,
      }}
    >
      {featureCards.map((feature, index) => (
        <FeatureItem
          compact={compact}
          feature={feature}
          iconSize={iconSize}
          key={feature.label}
          showDivider={index < featureCards.length - 1}
        />
      ))}
    </View>
  );
}

type EmptyPreviewCardProps = {
  height: number;
  image: ImageSourcePropType;
  opacity: number;
  style: {
    left?: number;
    right?: number;
    top: number;
  };
  width: number;
};

function EmptyPreviewCard({
  height,
  image,
  opacity,
  style,
  width,
}: EmptyPreviewCardProps) {
  return (
    <View
      className="absolute overflow-hidden border-[6px] border-white/85 bg-white/70"
      style={{
        borderCurve: "continuous",
        borderRadius: Math.min(34, height * 0.16),
        boxShadow: "0 24px 60px -18px rgba(255, 100, 145, 0.36)",
        height,
        opacity,
        width,
        ...style,
      }}
    >
      <Image
        accessible={false}
        contentFit="cover"
        contentPosition="top center"
        source={image}
        style={{ height: "100%", width: "100%" }}
      />
    </View>
  );
}

type FeatureItemProps = {
  compact: boolean;
  feature: (typeof featureCards)[number];
  iconSize: number;
  showDivider: boolean;
};

function FeatureItem({
  compact,
  feature,
  iconSize,
  showDivider,
}: FeatureItemProps) {
  const iconProps = {
    color: feature.color,
    size: compact ? 20 : 23,
  } as const;

  return (
    <>
      <View
        className="flex-1 items-center px-1"
        style={{ gap: compact ? 2 : 4 }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={{
            backgroundColor: feature.background,
            height: iconSize,
            width: iconSize,
          }}
        >
          {feature.iconSet === "feather" ? (
            <Feather
              name={feature.icon === "book-open" ? "book-open" : "lock"}
              {...iconProps}
            />
          ) : (
            <Ionicons
              name={
                feature.icon === "cloud-outline"
                  ? "cloud-outline"
                  : "color-palette-outline"
              }
              {...iconProps}
            />
          )}
        </View>
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          className="text-center font-bold"
          minimumFontScale={0.78}
          numberOfLines={2}
          style={{
            color: deepPlum,
            fontSize: compact ? 8.5 : 10,
            lineHeight: compact ? 11 : 13,
          }}
        >
          {feature.label}
        </Text>
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          className="text-center"
          minimumFontScale={0.76}
          numberOfLines={3}
          style={{
            color: mutedPlum,
            fontSize: compact ? 7 : 8,
            lineHeight: compact ? 9 : 11,
          }}
        >
          {feature.description}
        </Text>
      </View>
      {showDivider ? <View className="w-px bg-[#F0DCE6]" /> : null}
    </>
  );
}
