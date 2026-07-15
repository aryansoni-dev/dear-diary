import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";

type AnimatedIconButtonProps = {
  accessibilityHint?: string;
  accessibilityLabel: string;
  children: ReactNode;
  disabled?: boolean;
  isBusy?: boolean;
  onPress: () => void;
  shadow?: string;
  size?: number;
  spinOnPress?: boolean;
  testID?: string;
};

export function AnimatedIconButton({
  accessibilityHint,
  accessibilityLabel,
  children,
  disabled = false,
  isBusy = false,
  onPress,
  shadow = "0 4px 14px rgba(39, 39, 42, 0.12)",
  size = 50,
  spinOnPress = false,
  testID,
}: AnimatedIconButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const isBusyRef = useRef(isBusy);
  const rotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const startBusyLoop = useCallback(() => {
    spinValue.setValue(0);
    loopRef.current = Animated.loop(
      Animated.timing(spinValue, {
        duration: 760,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    loopRef.current.start();
  }, [spinValue]);

  useEffect(() => {
    isBusyRef.current = isBusy;

    if (!isBusy) {
      loopRef.current?.stop();
      loopRef.current = null;
      spinValue.setValue(0);
      return;
    }

    loopRef.current?.stop();
    loopRef.current = null;
    startBusyLoop();

    return () => {
      loopRef.current?.stop();
      loopRef.current = null;
      spinValue.setValue(0);
    };
  }, [isBusy, spinValue, startBusyLoop]);

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

    if (!isBusyRef.current) {
      loopRef.current?.stop();
      loopRef.current = null;
      spinValue.setValue(0);
    }

    Animated.timing(spinValue, {
      duration: 760,
      toValue: 1,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      if (isBusyRef.current) {
        loopRef.current = null;
        startBusyLoop();
        return;
      }

      spinValue.setValue(0);
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
        testID={testID}
        accessibilityHint={accessibilityHint}
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
