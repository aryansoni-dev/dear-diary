import { Pressable, Text, View } from "react-native";

import type { MoodMetadata } from "@/constants/moods";

type MoodOptionProps = {
  disabled?: boolean;
  isSelected: boolean;
  mood: MoodMetadata;
  onPress: () => void;
};

export function MoodOption({
  disabled = false,
  isSelected,
  mood,
  onPress,
}: MoodOptionProps) {
  return (
    <Pressable
      accessibilityHint="Select this mood for your current check-in"
      accessibilityLabel={mood.label}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected, disabled }}
      className="min-h-[76px] min-w-[86px] flex-1 items-center gap-2 rounded-[18px] border px-2.5 py-3"
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? mood.backgroundColor : "#FFFFFF",
        borderColor: isSelected ? mood.dotColor : "#F1EEF2",
        borderWidth: isSelected ? 2 : 1,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <View
        className="h-1.5 w-full rounded-full"
        style={{ backgroundColor: mood.dotColor }}
      />
      <View
        className="size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: isSelected ? "white" : mood.backgroundColor }}
      >
        <Text className="text-[22px] leading-6">{mood.emoji}</Text>
      </View>
      <Text
        className="text-center text-[12px] leading-6"
        style={{
          color: isSelected ? "#303039" : "#71717B",
          fontWeight: isSelected ? "700" : "600",
        }}
      >
        {mood.label}
      </Text>
      {isSelected ? (
        <View
          className="size-2 rounded-full"
          style={{ backgroundColor: mood.dotColor }}
        />
      ) : null}
    </Pressable>
  );
}
