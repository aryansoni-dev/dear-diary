import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { appLockColors } from "@/constants/app-lock-theme";

type BiometricLockSwitchProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  value: boolean;
};

const switchColors = {
  off: "#FB7185",
  on: "#10B981",
  thumb: "#F9FAFB",
} as const;

const switchSize = {
  height: 48,
  icon: 34,
  iconOffset: 7,
  thumb: 40,
  thumbOffset: 4,
  travel: 48,
  width: 96,
} as const;

export function BiometricLockSwitch({
  accessibilityLabel,
  disabled = false,
  onValueChange,
  testID,
  value,
}: BiometricLockSwitchProps) {
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));
  const [thumbScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.timing(progress, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
      toValue: value ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  function handlePress() {
    if (disabled) {
      return;
    }

    onValueChange(!value);
  }

  function handlePressIn() {
    if (disabled) {
      return;
    }

    Animated.spring(thumbScale, {
      friction: 8,
      tension: 180,
      toValue: 0.95,
      useNativeDriver: false,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(thumbScale, {
      friction: 7,
      tension: 150,
      toValue: 1,
      useNativeDriver: false,
    }).start();
  }

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [switchColors.off, switchColors.on],
  });
  const thumbTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, switchSize.travel],
  });

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{
        alignSelf: "center",
        height: switchSize.height,
        opacity: disabled ? 0.7 : 1,
        width: switchSize.width,
      }}
    >
      <Animated.View
        className="rounded-full"
        style={{
          backgroundColor: disabled ? appLockColors.disabled : backgroundColor,
          boxShadow: `0 2px 4px ${appLockColors.shadow}`,
          height: switchSize.height,
          overflow: "hidden",
          width: switchSize.width,
        }}
      >
        <View
          className="absolute items-center justify-center"
          style={{
            height: switchSize.icon,
            left: switchSize.iconOffset,
            top: switchSize.iconOffset,
            width: switchSize.icon,
          }}
        >
          <LockIcon />
        </View>

        <View
          className="absolute items-center justify-center"
          style={{
            height: switchSize.icon,
            right: switchSize.iconOffset,
            top: switchSize.iconOffset,
            width: switchSize.icon,
          }}
        >
          <UnlockIcon />
        </View>

        <Animated.View
          className="absolute rounded-full"
          style={{
            backgroundColor: switchColors.thumb,
            boxShadow: `0 1px 3px ${appLockColors.shadow}`,
            height: switchSize.thumb,
            left: switchSize.thumbOffset,
            top: switchSize.thumbOffset,
            transform: [
              { translateX: thumbTranslate },
              { scale: thumbScale },
            ],
            width: switchSize.thumb,
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

function LockIcon() {
  return (
    <Svg height={switchSize.icon} viewBox="0 0 100 100" width={switchSize.icon}>
      <Path
        d="M30,46V38a20,20,0,0,1,40,0v8a8,8,0,0,1,8,8V74a8,8,0,0,1-8,8H30a8,8,0,0,1-8-8V54A8,8,0,0,1,30,46Zm32-8v8H38V38a12,12,0,0,1,24,0Z"
        fill={appLockColors.text}
        fillRule="evenodd"
      />
    </Svg>
  );
}

function UnlockIcon() {
  return (
    <Svg height={switchSize.icon} viewBox="0 0 100 100" width={switchSize.icon}>
      <Path
        d="M50,18A19.9,19.9,0,0,0,30,38v8a8,8,0,0,0-8,8V74a8,8,0,0,0,8,8H70a8,8,0,0,0,8-8V54a8,8,0,0,0-8-8H38V38a12,12,0,0,1,23.6-3,4,4,0,1,0,7.8-2A20.1,20.1,0,0,0,50,18Z"
        fill={appLockColors.text}
      />
    </Svg>
  );
}
