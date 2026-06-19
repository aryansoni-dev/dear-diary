import { useRef } from "react";
import {
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type PinInputProps = {
  accessibilityLabel: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChangePin: (pin: string) => void;
  onSubmit?: () => void;
  pin: string;
};

export function PinInput({
  accessibilityLabel,
  autoFocus = false,
  disabled = false,
  onChangePin,
  onSubmit,
  pin,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length: 6 }, (_, index) => pin[index] ?? "");

  function handleChangeText(value: string) {
    onChangePin(value.replace(/\D/g, "").slice(0, 6));
  }

  const returnKeyType: TextInputProps["returnKeyType"] =
    pin.length === 6 ? "done" : "default";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="items-center"
      disabled={disabled}
      onPress={() => inputRef.current?.focus()}
    >
      <View className="flex-row gap-2.5">
        {digits.map((digit, index) => (
          <View
            className="size-12 items-center justify-center rounded-2xl border border-[#F1C8DC] bg-white"
            key={`${index}-${digit ? "filled" : "empty"}`}
            style={{ borderCurve: "continuous" }}
          >
            <Text className="text-[22px] font-bold leading-7 text-[#27272A]">
              {digit ? "•" : ""}
            </Text>
          </View>
        ))}
      </View>

      <TextInput
        accessibilityElementsHidden
        autoFocus={autoFocus}
        caretHidden
        className="h-0 w-0 opacity-0"
        contextMenuHidden
        editable={!disabled}
        importantForAccessibility="no-hide-descendants"
        keyboardType="number-pad"
        maxLength={6}
        onChangeText={handleChangeText}
        onSubmitEditing={onSubmit}
        ref={inputRef}
        returnKeyType={returnKeyType}
        secureTextEntry
        textContentType="oneTimeCode"
        value={pin}
      />
    </Pressable>
  );
}

