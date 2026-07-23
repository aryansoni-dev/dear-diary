import { useEffect, useId } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  FeGaussianBlur,
  Filter,
  G,
  LinearGradient,
  Mask,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

import { colors } from "@/constants/theme";

const sparklePath =
  "M63,37c-6.7-4-4-27-13-27s-6.3,23-13,27-27,4-27,13,20.3,9,27,13,4,27,13,27,6.3-23,13-27,27-4,27-13-20.3-9-27-13Z";
const animationDuration = 1000;
const animationStops = [0, 0.25, 0.5, 0.75, 1];

type SparkleDirection = "center" | "left" | "right";

type AnimatedSparkleProps = {
  delay: number;
  direction: SparkleDirection;
  idSuffix: string;
  scale: number;
};

type AiProcessingAnimationProps = {
  size?: "compact" | "default";
};

export function AiProcessingAnimation({
  size = "default",
}: AiProcessingAnimationProps) {
  const idSuffix = useId().replace(/:/g, "");
  const scale = size === "compact" ? 0.67 : 1;

  return (
    <View
      accessibilityLabel="DearDiary AI is generating a response"
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      className="overflow-hidden"
      pointerEvents="none"
      style={{ height: 48 * scale, width: 64 * scale }}
      testID="ai-processing-animation"
    >
      <AnimatedSparkle
        delay={0}
        direction="center"
        idSuffix={idSuffix}
        scale={scale}
      />
      <AnimatedSparkle
        delay={300}
        direction="left"
        idSuffix={idSuffix}
        scale={scale}
      />
      <AnimatedSparkle
        delay={600}
        direction="right"
        idSuffix={idSuffix}
        scale={scale}
      />
    </View>
  );
}

function AnimatedSparkle({
  delay,
  direction,
  idSuffix,
  scale,
}: AnimatedSparkleProps) {
  const progress = useSharedValue(0);
  const gradientId = `ai-sparkle-${direction}-${idSuffix}`;

  useEffect(() => {
    progress.set(withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: animationDuration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    ));

    return () => cancelAnimation(progress);
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const isCenter = direction === "center";
    const horizontalMovement =
      direction === "left"
        ? [-14, -8, -4, 0, 4].map((value) => value * scale)
        : direction === "right"
          ? [14, 8, 4, 0, -4].map((value) => value * scale)
          : [0, 0, 0, 0, 0];
    const rotation =
      direction === "left"
        ? [-10, -5, 0, 5, 10]
        : direction === "right"
          ? [10, 5, 0, -5, -10]
          : [0, 0, 0, 0, 0];

    return {
      opacity: interpolate(
        progress.value,
        animationStops,
        [0, 1, 1, 1, 0],
      ),
      transform: [
        {
          translateX: interpolate(
            progress.value,
            animationStops,
            horizontalMovement,
          ),
        },
        {
          translateY: interpolate(
            progress.value,
            animationStops,
            [-21, -10, 0, 7, 17].map((value) => value * scale),
          ),
        },
        {
          rotateZ: `${interpolate(
            progress.value,
            animationStops,
            rotation,
          )}deg`,
        },
        {
          scale: interpolate(
            progress.value,
            animationStops,
            isCenter ? [0.5, 0.75, 1, 0.5, 0] : [0.5, 1, 1, 0.5, 0],
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      className="absolute"
      style={[
        {
          height: 24 * scale,
          left: 20 * scale,
          top: 12 * scale,
          width: 24 * scale,
        },
        animatedStyle,
      ]}
    >
      <Sparkle gradientId={gradientId} />
    </Animated.View>
  );
}

function Sparkle({ gradientId }: { gradientId: string }) {
  const shadowGradientId = `${gradientId}-shadow`;
  const topGradientId = `${gradientId}-top`;
  const sideGradientId = `${gradientId}-side`;
  const baseGradientId = `${gradientId}-base`;
  const depthGradientId = `${gradientId}-depth`;
  const shineFilterId = `${gradientId}-shine`;
  const sparkleMaskId = `${gradientId}-mask`;

  return (
    <Svg height="100%" viewBox="0 0 100 100" width="100%">
      <Defs>
        <Filter id={shineFilterId}>
          <FeGaussianBlur stdDeviation={3} />
        </Filter>
        <Mask id={sparkleMaskId}>
          <Path d={sparklePath} fill="#FFFFFF" />
        </Mask>
        <RadialGradient
          cx="50"
          cy="66"
          fx="50"
          fy="66"
          gradientTransform="translate(0 35) scale(1 0.5)"
          gradientUnits="userSpaceOnUse"
          id={shadowGradientId}
          r="30"
        >
          <Stop offset="0" stopColor="#000000" stopOpacity={0.3} />
          <Stop offset="0.5" stopColor="#000000" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          cx="55"
          cy="20"
          fx="55"
          fy="20"
          gradientUnits="userSpaceOnUse"
          id={topGradientId}
          r="30"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.3} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          cx="85"
          cy="50"
          fx="85"
          fy="50"
          gradientUnits="userSpaceOnUse"
          id={sideGradientId}
          r="30"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.3} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          cx="50"
          cy="58"
          fx="50"
          fy="58"
          gradientTransform="translate(0 47) scale(1 0.2)"
          gradientUnits="userSpaceOnUse"
          id={baseGradientId}
          r="60"
        >
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.3} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.1} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient
          gradientUnits="userSpaceOnUse"
          id={depthGradientId}
          x1="50"
          x2="50"
          y1="90"
          y2="10"
        >
          <Stop offset="0" stopColor="#000000" stopOpacity={0.2} />
          <Stop offset="0.4" stopColor="#000000" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G>
        <Path d={sparklePath} fill={colors.brandPrimary} />
        <Path d={sparklePath} fill={`url(#${shadowGradientId})`} />
        <Path
          d={sparklePath}
          fill="none"
          filter={`url(#${shineFilterId})`}
          mask={`url(#${sparkleMaskId})`}
          opacity={0.3}
          stroke="#FFFFFF"
          strokeWidth={3}
        />
        <Path d={sparklePath} fill={`url(#${topGradientId})`} />
        <Path d={sparklePath} fill={`url(#${sideGradientId})`} />
        <Path d={sparklePath} fill={`url(#${baseGradientId})`} />
        <Path d={sparklePath} fill={`url(#${depthGradientId})`} />
      </G>
    </Svg>
  );
}
