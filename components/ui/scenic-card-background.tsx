import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

import { images } from "@/constants/images";

const cardFadeColors = {
  ai: [
    "rgba(255, 250, 247, 0.82)",
    "rgba(255, 250, 247, 0.62)",
    "rgba(255, 250, 247, 0.2)",
    "rgba(255, 250, 247, 0)",
  ],
  evening: [
    "rgba(255, 248, 252, 0.76)",
    "rgba(255, 248, 252, 0.56)",
    "rgba(255, 248, 252, 0.18)",
    "rgba(255, 248, 252, 0)",
  ],
  morning: [
    "rgba(250, 252, 248, 0.82)",
    "rgba(250, 252, 248, 0.62)",
    "rgba(250, 252, 248, 0.2)",
    "rgba(250, 252, 248, 0)",
  ],
} as const;

const cardImages = {
  ai: images.aiCard,
  evening: images.eveningCard,
  morning: images.morningCard,
} as const;

export type ScenicCardVariant = keyof typeof cardImages;

type ScenicCardBackgroundProps = {
  blurRadius?: number;
  cardWidth: number;
  effectWidth?: number;
  variant: ScenicCardVariant;
};

export function ScenicCardBackground({
  blurRadius = 0,
  cardWidth,
  effectWidth,
  variant,
}: ScenicCardBackgroundProps) {
  const imageWidth = Math.max(cardWidth - 12, 0);
  const resolvedEffectWidth = Math.min(
    Math.max(effectWidth ?? imageWidth * 0.62, 0),
    imageWidth,
  );
  const source = cardImages[variant];

  return (
    <>
      <Image
        className="absolute inset-0"
        contentFit="cover"
        pointerEvents="none"
        source={source}
      />
      {blurRadius > 0 ? (
        <View
          pointerEvents="none"
          className="absolute bottom-0 left-0 top-0 overflow-hidden"
          style={{ width: resolvedEffectWidth }}
        >
          <Image
            blurRadius={blurRadius}
            contentFit="cover"
            source={source}
            style={{ height: "100%", width: imageWidth }}
          />
        </View>
      ) : null}
      <LinearGradient
        className="absolute bottom-0 left-0 top-0"
        colors={cardFadeColors[variant]}
        end={{ x: 1, y: 0.5 }}
        locations={[0, 0.46, 0.76, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={{ width: resolvedEffectWidth }}
      />
    </>
  );
}
