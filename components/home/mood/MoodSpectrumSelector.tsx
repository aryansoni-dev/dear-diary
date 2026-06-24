import { View } from "react-native";

import { MoodOption } from "@/components/home/mood/MoodOption";
import type { MoodMetadata } from "@/constants/moods";
import type { MoodId } from "@/types/journal";

type MoodSpectrumSelectorProps = {
  disabled?: boolean;
  moods: readonly MoodMetadata[];
  onSelectMood: (moodId: MoodId) => void;
  selectedMoodId: MoodId | null;
};

export function MoodSpectrumSelector({
  disabled = false,
  moods,
  onSelectMood,
  selectedMoodId,
}: MoodSpectrumSelectorProps) {
  return (
    <View
      accessibilityLabel="Mood selector"
      className="gap-2"
    >
      <View className="flex-row flex-wrap gap-2">
        {moods.map((mood) => (
          <MoodOption
            disabled={disabled}
            isSelected={selectedMoodId === mood.id}
            key={mood.id}
            mood={mood}
            onPress={() => onSelectMood(mood.id)}
          />
        ))}
      </View>
    </View>
  );
}
