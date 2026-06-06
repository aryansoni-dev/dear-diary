import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { images } from "@/constants/images";

type SplashScreenProps = {
  onAnimationEnd?: () => void;
};

const fadeDuration = 650;
const burstDuration = 720;
const redirectDelay = 3000;

type SplashParticle =
  | {
      color: string;
      delay: number;
      kind: "feather";
      name: ComponentProps<typeof Feather>["name"];
      rotate: string;
      size: number;
      x: number;
      y: number;
    }
  | {
      color: string;
      delay: number;
      kind: "ionicon";
      name: ComponentProps<typeof Ionicons>["name"];
      rotate: string;
      size: number;
      x: number;
      y: number;
    }
  | {
      color: string;
      delay: number;
      kind: "dot";
      rotate: string;
      size: number;
      x: number;
      y: number;
    };

const splashParticles: SplashParticle[] = [
  {
    kind: "ionicon",
    name: "sparkles-outline",
    color: "#ff8aae",
    size: 18,
    x: -118,
    y: -64,
    rotate: "-28deg",
    delay: 0,
  },
  {
    kind: "feather",
    name: "star",
    color: "#d9c5ff",
    size: 14,
    x: -150,
    y: 2,
    rotate: "34deg",
    delay: 55,
  },
  {
    kind: "ionicon",
    name: "star-outline",
    color: "#f6c959",
    size: 16,
    x: -84,
    y: 78,
    rotate: "18deg",
    delay: 85,
  },
  {
    kind: "ionicon",
    name: "sparkles-outline",
    color: "#f0ce62",
    size: 15,
    x: 104,
    y: -82,
    rotate: "26deg",
    delay: 20,
  },
  {
    kind: "ionicon",
    name: "flower-outline",
    color: "#e4b3ff",
    size: 15,
    x: 142,
    y: -14,
    rotate: "-20deg",
    delay: 70,
  },
  {
    kind: "ionicon",
    name: "star-outline",
    color: "#ffb6c7",
    size: 20,
    x: 122,
    y: 76,
    rotate: "38deg",
    delay: 110,
  },
  {
    kind: "dot",
    color: "#DDEFFF",
    size: 8,
    x: -132,
    y: 118,
    rotate: "0deg",
    delay: 120,
  },
  {
    kind: "dot",
    color: "#ffb6c7",
    size: 7,
    x: 68,
    y: -116,
    rotate: "0deg",
    delay: 45,
  },
  {
    kind: "dot",
    color: "#ffffff",
    size: 7,
    x: 158,
    y: 30,
    rotate: "0deg",
    delay: 135,
  },
  {
    kind: "dot",
    color: "#ffb6c7",
    size: 5,
    x: -58,
    y: -108,
    rotate: "0deg",
    delay: 35,
  },
];

export function SplashScreen({ onAnimationEnd }: SplashScreenProps) {
  const { height } = useWindowDimensions();
  const isCompact = height < 680;
  const logoHeight = isCompact ? 142 : 170;
  const logoWidth = isCompact ? 300 : 342;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const particleAnimations = useRef(
    splashParticles.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(300),
      Animated.timing(logoOpacity, {
        duration: fadeDuration,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.stagger(
        16,
        particleAnimations.map((particleAnimation, index) =>
          Animated.sequence([
            Animated.delay(splashParticles[index].delay),
            Animated.timing(particleAnimation, {
              duration: burstDuration,
              toValue: 1,
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
      Animated.delay(120),
      Animated.timing(quoteOpacity, {
        duration: fadeDuration,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(220),
      Animated.timing(taglineOpacity, {
        duration: fadeDuration,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(redirectDelay),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        onAnimationEnd?.();
      }
    });

    return () => animation.stop();
  }, [
    logoOpacity,
    onAnimationEnd,
    particleAnimations,
    quoteOpacity,
    taglineOpacity,
  ]);

  function renderParticle(particle: SplashParticle, index: number) {
    const particleAnimation = particleAnimations[index];
    const opacity = particleAnimation.interpolate({
      inputRange: [0, 0.18, 1],
      outputRange: [0, 1, 1],
    });
    const scale = particleAnimation.interpolate({
      inputRange: [0, 0.55, 1],
      outputRange: [0.25, 1.28, 1],
    });
    const translateX = particleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, particle.x],
    });
    const translateY = particleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, particle.y],
    });
    const rotate = particleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", particle.rotate],
    });

    return (
      <Animated.View
        className="absolute"
        key={`${particle.kind}-${index}`}
        style={{
          left: "50%",
          marginLeft: -particle.size / 2,
          marginTop: -particle.size / 2,
          opacity,
          top: "50%",
          transform: [{ translateX }, { translateY }, { scale }, { rotate }],
        }}
      >
        {particle.kind === "dot" ? (
          <View
            className="rounded-full"
            style={{
              backgroundColor: particle.color,
              height: particle.size,
              width: particle.size,
            }}
          />
        ) : particle.kind === "ionicon" ? (
          <Ionicons
            color={particle.color}
            name={particle.name}
            size={particle.size}
          />
        ) : (
          <Feather
            color={particle.color}
            name={particle.name}
            size={particle.size}
          />
        )}
      </Animated.View>
    );
  }

  return (
    <LinearGradient
      colors={["#F4EFFA", "#FFDDE8", "#FAF7F2"]}
      locations={[0, 0.48, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: isCompact ? 22 : 34,
          paddingHorizontal: 22,
          paddingTop: isCompact ? 30 : 52,
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar hidden />

        <View className="relative flex-1 items-center overflow-visible">
          <View
            className="items-center"
            style={{ marginTop: isCompact ? 52 : 106 }}
          >
            <View
              className="relative items-center justify-center overflow-visible"
              style={{ height: logoHeight, width: logoWidth }}
            >
              {splashParticles.map(renderParticle)}

              <Animated.View style={{ opacity: logoOpacity }}>
                <Image
                  contentFit="contain"
                  source={images.splashLogo}
                  style={{
                    height: logoHeight,
                    width: logoWidth,
                  }}
                />
              </Animated.View>
            </View>

            <Animated.View style={{ opacity: quoteOpacity }}>
              <Text className="mt-3 max-w-[240px] text-center font-serif text-[18px] italic leading-6 text-zinc-500">
                Every thought deserves a place to rest.
              </Text>
            </Animated.View>
          </View>

          <Animated.View
            className="mt-auto w-full items-center gap-3"
            style={{ opacity: taglineOpacity }}
          >
            <Ionicons color="#ffb6c7" name="moon-outline" size={14} />

            <Text className="text-[15px] font-bold tracking-[7px] text-zinc-300">
              REST · REFLECT · GROW
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
