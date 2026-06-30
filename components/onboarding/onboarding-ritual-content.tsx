import { MoonStar, Sprout, Sun, Sunrise } from "lucide-react-native";
import { Text, View } from "react-native";

import { ScenicCardBackground } from "@/components/ui/scenic-card-background";

const ritualColors = {
  deepPlum: "#251238",
  green: "#4DB47B",
  muted: "#777188",
  pink: "#FF2056",
  purple: "#8F55D6",
} as const;

type RitualSize = "compact" | "medium" | "tiny" | "wide";

type OnboardingRitualCardProps = {
  height: number;
  size: RitualSize;
  variant: "evening" | "morning";
  width: number;
};

export function OnboardingRitualCard({
  height,
  size,
  variant,
  width,
}: OnboardingRitualCardProps) {
  const isMorning = variant === "morning";
  const isTiny = size === "tiny";
  const isCompact = size === "compact";
  const isMedium = size === "medium";
  const padding = isTiny ? 10 : isCompact ? 12 : isMedium ? 14 : 16;
  const iconSize = isTiny ? 30 : isCompact ? 34 : isMedium ? 38 : 42;
  const titleSize = isTiny ? 10 : isCompact ? 11 : isMedium ? 12 : 13;
  const titleLineHeight = titleSize + 4;
  const bodySize = isTiny ? 8 : isCompact ? 9 : isMedium ? 10 : 11;
  const bodyLineHeight = bodySize + 4;
  const bodyOffset = isTiny ? 0 : isCompact ? 2 : 4;
  const promptHeight = isTiny ? 25 : isCompact ? 28 : isMedium ? 31 : 34;
  const cardInnerWidth = width - 12;
  const textColumnRight =
    padding + bodyOffset + (cardInnerWidth - padding * 2) * 0.58;
  const imageEffectWidth = textColumnRight + 1;

  return (
    <View
      className="w-full overflow-hidden border-[6px] border-white/80"
      style={{
        backgroundColor: isMorning ? "#E8F4E3" : "#E7DAF5",
        borderCurve: "continuous",
        borderRadius: isTiny ? 24 : 30,
        boxShadow: isMorning
          ? "0 20px 48px -22px rgba(61, 162, 104, 0.42)"
          : "0 20px 48px -22px rgba(125, 83, 180, 0.42)",
        height,
      }}
    >
      <ScenicCardBackground
        blurRadius={isTiny ? 6 : 10}
        cardWidth={width}
        effectWidth={imageEffectWidth}
        variant={isMorning ? "morning" : "evening"}
      />

      <View className="h-full justify-between" style={{ padding }}>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View
            className="items-center justify-center rounded-full bg-white/85"
            style={{ height: iconSize, width: iconSize }}
          >
            {isMorning ? (
              <Sun color="#F5B900" size={iconSize * 0.62} strokeWidth={2.2} />
            ) : (
              <MoonStar
                color={ritualColors.purple}
                size={iconSize * 0.6}
                strokeWidth={2.2}
              />
            )}
          </View>
          <Text
            allowFontScaling={false}
            className="font-bold leading-6"
            numberOfLines={1}
            style={{
              color: ritualColors.deepPlum,
              fontSize: titleSize,
              lineHeight: titleLineHeight,
            }}
          >
            {isMorning ? "Morning Intention" : "Evening Reflection"}
          </Text>
        </View>

        <Text
          allowFontScaling={false}
          className="font-medium leading-6"
          numberOfLines={3}
          style={{
            color: ritualColors.muted,
            fontSize: bodySize,
            lineHeight: bodyLineHeight,
            width: "58%",
            marginLeft: bodyOffset,
          }}
        >
          {isMorning
            ? "Start your day with clarity. Set one focus and carry it through your day."
            : "End your day with gratitude. Reflect on what moved you and what you learned."}
        </Text>

        <View
          className="justify-center rounded-2xl bg-white/78 px-3"
          style={{ height: promptHeight, width: "58%" }}
        >
          <Text
            allowFontScaling={false}
            className="font-medium leading-6"
            numberOfLines={1}
            style={{
              color: "#9893A5",
              fontSize: isTiny ? 7.5 : isCompact ? 8.5 : isMedium ? 9 : 10,
              lineHeight: isTiny ? 10 : isCompact ? 12 : 14,
            }}
          >
            {isMorning
              ? "What will you focus on today?"
              : "How did today feel?"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const ritualFeatures = [
  {
    icon: "sunrise",
    label: "Start with Purpose",
    subtitle: "Set intentions that guide your day.",
  },
  {
    icon: "moon",
    label: "End with Peace",
    subtitle: "Reflect and let go before you sleep.",
  },
  {
    icon: "sprout",
    label: "Create Lasting Growth",
    subtitle: "Small daily rituals lead to big change.",
  },
] as const;

type OnboardingRitualFeaturesProps = {
  height: number;
  size: RitualSize;
};

export function OnboardingRitualFeatures({
  height,
  size,
}: OnboardingRitualFeaturesProps) {
  const isTiny = size === "tiny";
  const isCompact = size === "compact";
  const isMedium = size === "medium";
  const iconSize = isTiny ? 28 : isCompact ? 32 : isMedium ? 36 : 40;
  const labelSize = isTiny ? 7 : isCompact ? 8 : isMedium ? 8.5 : 9;
  const subtitleSize = isTiny ? 6.5 : isCompact ? 7 : isMedium ? 8 : 9;

  return (
    <View
      className="w-full flex-row items-stretch rounded-[28px] bg-white/76"
      style={{
        borderCurve: "continuous",
        boxShadow: "0 20px 50px -28px rgba(125, 83, 180, 0.45)",
        height,
        paddingHorizontal: isTiny ? 5 : isCompact ? 7 : 9,
        paddingVertical: isTiny ? 5 : isCompact ? 7 : isMedium ? 9 : 10,
      }}
    >
      {ritualFeatures.map((feature, index) => (
        <View className="flex-1 flex-row" key={feature.label}>
          <View className="flex-1 items-center justify-center px-1">
            <View
              className="items-center justify-center rounded-2xl"
              style={{
                backgroundColor:
                  feature.icon === "sunrise"
                    ? "#FFE1EA"
                    : feature.icon === "moon"
                      ? "#EEE2FA"
                      : "#E4F2DE",
                height: iconSize,
                width: iconSize,
              }}
            >
              {feature.icon === "sunrise" ? (
                <Sunrise
                  color={ritualColors.pink}
                  size={iconSize * 0.56}
                  strokeWidth={2.2}
                />
              ) : feature.icon === "moon" ? (
                <MoonStar
                  color={ritualColors.purple}
                  size={iconSize * 0.54}
                  strokeWidth={2.2}
                />
              ) : (
                <Sprout
                  color={ritualColors.green}
                  size={iconSize * 0.56}
                  strokeWidth={2.2}
                />
              )}
            </View>
            <Text
              allowFontScaling={false}
              className="w-full text-center font-bold leading-6"
              numberOfLines={1}
              style={{
                color: "#292631",
                fontSize: labelSize,
                lineHeight: labelSize + 3,
                marginTop: isTiny ? 2 : 4,
              }}
            >
              {feature.label}
            </Text>
            <Text
              allowFontScaling={false}
              className="w-full text-center leading-6"
              numberOfLines={2}
              style={{
                color: ritualColors.muted,
                fontSize: subtitleSize,
                lineHeight: subtitleSize + 3,
                marginTop: 2,
              }}
            >
              {feature.subtitle}
            </Text>
          </View>
          {index < ritualFeatures.length - 1 ? (
            <View className="w-px bg-[#F0DCE6]" />
          ) : null}
        </View>
      ))}
    </View>
  );
}
