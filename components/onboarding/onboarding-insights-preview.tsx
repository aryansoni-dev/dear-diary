import { Image } from "expo-image";
import { BarChart3, Star, TrendingUp } from "lucide-react-native";
import { Text, View } from "react-native";

import { images } from "@/constants/images";

const previewColors = {
  green: "#0BA574",
  lavender: "#9B51E0",
  muted: "#777188",
  paleGreen: "#DDF4E8",
  palePink: "#FFE1EA",
  palePurple: "#EEE2FA",
} as const;

type OnboardingInsightsPreviewProps = {
  height: number;
  width: number;
};

export function OnboardingInsightsPreview({
  height,
  width,
}: OnboardingInsightsPreviewProps) {
  const previewHeight = Math.min(height * 0.96, 378);
  const previewWidth = Math.min(width * 0.68, previewHeight * 0.61);

  return (
    <View
      className="relative items-center justify-center"
      style={{ height, width }}
    >
      <View
        pointerEvents="none"
        className="absolute rounded-full bg-[#FFDDE8] opacity-60"
        style={{
          filter: "blur(30px)",
          height: previewHeight * 0.82,
          width: previewHeight * 0.82,
        }}
      />
      <View
        className="overflow-hidden border-[6px] border-white/85 bg-white/70"
        style={{
          borderCurve: "continuous",
          borderRadius: 34,
          boxShadow: "0 24px 60px -18px rgba(255, 100, 145, 0.38)",
          height: previewHeight,
          width: previewWidth,
        }}
      >
        <Image
          accessibilityLabel="DearDiary insights screen preview"
          contentFit="cover"
          contentPosition="top center"
          source={images.insightsTabMockup}
          style={{ height: "100%", width: "100%" }}
        />
      </View>
    </View>
  );
}

type InsightFeatureProps = {
  compact: boolean;
  icon: "mood" | "personal" | "trend";
  label: string;
  subtitle: string;
};

export function InsightFeature({
  compact,
  icon,
  label,
  subtitle,
}: InsightFeatureProps) {
  const iconSize = compact ? 34 : 38;
  const iconProps = { size: compact ? 19 : 22, strokeWidth: 2.2 } as const;

  return (
    <View
      className="flex-1 items-center px-1"
      style={{ gap: compact ? 2 : 3 }}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          backgroundColor:
            icon === "mood"
              ? previewColors.palePink
              : icon === "trend"
                ? previewColors.palePurple
                : previewColors.paleGreen,
          height: iconSize,
          width: iconSize,
        }}
      >
        {icon === "mood" ? (
          <TrendingUp {...iconProps} color="#ED4D87" />
        ) : icon === "trend" ? (
          <BarChart3 {...iconProps} color={previewColors.lavender} />
        ) : (
          <Star {...iconProps} color={previewColors.green} />
        )}
      </View>
      <Text
        adjustsFontSizeToFit
        allowFontScaling={false}
        className="text-center font-bold"
        minimumFontScale={0.82}
        numberOfLines={1}
        style={{
          color: "#292631",
          fontSize: compact ? 8.5 : 10,
          lineHeight: compact ? 12 : 14,
        }}
      >
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        allowFontScaling={false}
        className="text-center"
        minimumFontScale={0.82}
        numberOfLines={2}
        style={{
          color: previewColors.muted,
          fontSize: compact ? 7.5 : 8.5,
          lineHeight: compact ? 10 : 12,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
