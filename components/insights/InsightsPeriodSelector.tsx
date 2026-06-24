import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import type { InsightsPeriod } from "@/types/insights";

const periods: { label: string; value: InsightsPeriod }[] = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

type InsightsPeriodSelectorProps = {
  onChange: (period: InsightsPeriod) => void;
  value: InsightsPeriod;
};

export function InsightsPeriodSelector({
  onChange,
  value,
}: InsightsPeriodSelectorProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const selectedIndex = periods.findIndex((period) => period.value === value);
  const thumbPosition = useRef(
    new Animated.Value(selectedIndex >= 0 ? selectedIndex : 0),
  ).current;
  const thumbWidth =
    containerWidth > 0 ? (containerWidth - 8) / periods.length : 0;
  const thumbTranslateX = thumbPosition.interpolate({
    inputRange: periods.map((_, index) => index),
    outputRange: periods.map((_, index) => index * thumbWidth),
  });

  useEffect(() => {
    Animated.timing(thumbPosition, {
      duration: 220,
      toValue: selectedIndex >= 0 ? selectedIndex : 0,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, thumbPosition]);

  function handleLayout(event: LayoutChangeEvent) {
    setContainerWidth(event.nativeEvent.layout.width);
  }

  return (
    <View
      accessibilityRole="tablist"
      className="relative flex-row overflow-hidden rounded-[20px] bg-white/75 p-1"
      onLayout={handleLayout}
      style={{ boxShadow: "0 8px 24px rgba(160, 140, 200, 0.14)" }}
    >
      {thumbWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          className="absolute left-1 top-1 min-h-11 rounded-full bg-[#FF2056]"
          style={{
            transform: [{ translateX: thumbTranslateX }],
            width: thumbWidth,
          }}
        />
      ) : null}
      {periods.map((period) => {
        const isSelected = value === period.value;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            className="min-h-11 flex-1 items-center justify-center rounded-full px-3"
            key={period.value}
            onPress={() => onChange(period.value)}
          >
            <Text
              className={`text-[14px] font-bold leading-6 ${
                isSelected ? "text-white" : "text-[#52525B]"
              }`}
            >
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
