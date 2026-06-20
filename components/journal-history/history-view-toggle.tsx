import { CalendarDays, List } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

import type { JournalHistoryViewMode } from "@/types/journalCalendar";

const toggleOptions: {
  icon: typeof List;
  label: string;
  value: JournalHistoryViewMode;
}[] = [
  { icon: List, label: "List", value: "list" },
  { icon: CalendarDays, label: "Calendar", value: "calendar" },
];

const viewToggleColors = {
  iconInactive: "#71717A",
  labelInactive: "#52525B",
  selectedContent: "#FFFFFF",
  selectedTrack: "#FF2056",
} as const;

export function HistoryViewToggle({
  onChange,
  value,
}: {
  onChange: (value: JournalHistoryViewMode) => void;
  value: JournalHistoryViewMode;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const thumbPosition = useRef(
    new Animated.Value(value === "calendar" ? 1 : 0),
  ).current;
  const thumbWidth = containerWidth > 0 ? (containerWidth - 8) / 2 : 0;
  const thumbTranslateX = thumbPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, thumbWidth],
  });

  useEffect(() => {
    Animated.timing(thumbPosition, {
      duration: 220,
      toValue: value === "calendar" ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [thumbPosition, value]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      accessibilityLabel="Journal history view"
      className="relative mt-6 flex-row overflow-hidden rounded-full border border-zinc-100 bg-white p-1"
      onLayout={handleLayout}
      style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.12)" }}
    >
      {thumbWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          className="absolute left-1 top-1 h-10 rounded-full"
          style={{
            backgroundColor: viewToggleColors.selectedTrack,
            transform: [{ translateX: thumbTranslateX }],
            width: thumbWidth,
          }}
        />
      ) : null}
      {toggleOptions.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-full"
            key={option.value}
            onPress={() => onChange(option.value)}
          >
            <Icon
              color={
                isSelected
                  ? viewToggleColors.selectedContent
                  : viewToggleColors.iconInactive
              }
              size={17}
              strokeWidth={2.2}
            />
            <Text
              className="text-[14px] leading-5"
              style={{
                color: isSelected
                  ? viewToggleColors.selectedContent
                  : viewToggleColors.labelInactive,
                fontWeight: isSelected ? "700" : "600",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
