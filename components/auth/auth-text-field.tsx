import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

type AuthTextFieldProps = {
  testID?: string;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  iconName: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
  helperText?: string;
  helperTone?: "error" | "success";
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  onRightIconPress?: () => void;
  rightAccessibilityLabel?: string;
  rightIconName?: React.ComponentProps<typeof Feather>["name"];
  rightTestID?: string;
  secureTextEntry?: boolean;
};

export function AuthTextField({
  testID,
  accessibilityHint,
  accessibilityLabel,
  iconName,
  label,
  onChangeText,
  placeholder,
  value,
  helperText,
  helperTone = "error",
  keyboardType = "default",
  onRightIconPress,
  rightAccessibilityLabel,
  rightIconName,
  rightTestID,
  secureTextEntry = false,
}: AuthTextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-[12px] font-medium leading-5 text-zinc-500">
        {label}
      </Text>
      <View
        className="h-12 flex-row items-center rounded-2xl border border-zinc-200 bg-white px-4"
        style={{ borderCurve: "continuous" }}
      >
        <Feather name={iconName} size={14} color="#a1a1aa" />
        <TextInput
          testID={testID}
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          className="ml-3 flex-1 text-[13px] font-medium leading-5 text-zinc-900"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a1a1aa"
          secureTextEntry={secureTextEntry}
          value={value}
        />
        {rightIconName ? (
          <Pressable
            testID={rightTestID}
            accessibilityRole="button"
            accessibilityLabel={rightAccessibilityLabel}
            className="-mr-2 size-9 items-center justify-center rounded-full"
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
          >
            <Feather name={rightIconName} size={14} color="#a1a1aa" />
          </Pressable>
        ) : null}
      </View>
      {helperText ? (
        <Text
          className="text-[11px] font-medium leading-4"
          style={{ color: helperTone === "success" ? "#059669" : "#ff2056" }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
