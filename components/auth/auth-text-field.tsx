import { Feather } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

type AuthTextFieldProps = {
  iconName: React.ComponentProps<typeof Feather>["name"];
  label: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
  keyboardType?: "default" | "email-address";
  rightIconName?: React.ComponentProps<typeof Feather>["name"];
  secureTextEntry?: boolean;
};

export function AuthTextField({
  iconName,
  label,
  onChangeText,
  placeholder,
  value,
  keyboardType = "default",
  rightIconName,
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
          <Feather name={rightIconName} size={14} color="#a1a1aa" />
        ) : null}
      </View>
    </View>
  );
}
