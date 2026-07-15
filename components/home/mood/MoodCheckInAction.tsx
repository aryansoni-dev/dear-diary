import { ActivityIndicator, Pressable, Text } from "react-native";

type MoodCheckInActionProps = {
  disabled: boolean;
  isSaving: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
};

export function MoodCheckInAction({
  disabled,
  isSaving,
  label,
  onPress,
  testID,
}: MoodCheckInActionProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isSaving }}
      className="min-h-[54px] flex-row items-center justify-center gap-2 rounded-[17px] px-5"
      disabled={disabled || isSaving}
      onPress={onPress}
      style={{
        backgroundColor: disabled || isSaving ? "#F4F4F5" : "#FF2056",
      }}
    >
      {isSaving ? <ActivityIndicator color="white" size="small" /> : null}
      <Text
        className="text-[16px] font-semibold leading-6"
        style={{ color: disabled || isSaving ? "#A1A1AA" : "white" }}
      >
        {isSaving ? "Saving..." : label}
      </Text>
    </Pressable>
  );
}
