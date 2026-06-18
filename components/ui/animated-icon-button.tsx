import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

type AnimatedIconButtonProps = {
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  isBusy?: boolean;
  onPress: () => void;
  shadow?: string;
  size?: number;
  spinOnPress?: boolean;
};

export function AnimatedIconButton({
  accessibilityLabel,
  children,
  disabled = false,
  isBusy = false,
  onPress,
  shadow = "0 4px 14px rgba(39, 39, 42, 0.12)",
  size = 50,
  spinOnPress = false,
}: AnimatedIconButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const rotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (!isBusy) {
      loopRef.current?.stop();
      loopRef.current = null;
      spinValue.setValue(0);
      return;
    }

    spinValue.setValue(0);
    loopRef.current = Animated.loop(
      Animated.timing(spinValue, {
        duration: 760,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    loopRef.current.start();

    return () => {
      loopRef.current?.stop();
      loopRef.current = null;
      spinValue.setValue(0);
    };
  }, [isBusy, spinValue]);

  function handlePressIn() {
    if (disabled) {
      return;
    }

    Animated.spring(scaleValue, {
      friction: 7,
      tension: 180,
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

    if (!spinOnPress) {
      return;
    }

    loopRef.current?.stop();
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      duration: 760,
      toValue: 1,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isBusy) {
        spinValue.setValue(0);
      }
    });
  }

  function handlePressOut() {
    Animated.spring(scaleValue, {
      friction: 6,
      tension: 140,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: 999,
          boxShadow: shadow,
          height: size,
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
          width: size,
        }}
      >
        <Animated.View
          style={{
            transform: [{ rotate: rotation }],
          }}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
