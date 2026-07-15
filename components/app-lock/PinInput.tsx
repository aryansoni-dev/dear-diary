import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { appLockColors } from "@/constants/app-lock-theme";

type PinInputProps = {
  accessibilityLabel: string;
  accessibilityHint?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChangePin: (pin: string) => void;
  onSubmit?: () => void;
  pin: string;
  testID?: string;
};

export function PinInput({
  accessibilityHint,
  accessibilityLabel,
  autoFocus = false,
  disabled = false,
  onChangePin,
  onSubmit,
  pin,
  testID,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setFocused] = useState(false);
  const digits = Array.from({ length: 6 }, (_, index) => pin[index] ?? "");
  const activeIndex = Math.min(pin.length, digits.length - 1);

  function handleChangeText(value: string) {
    onChangePin(value.replace(/\D/g, "").slice(0, 6));
  }

  const returnKeyType: TextInputProps["returnKeyType"] =
    pin.length === 6 ? "done" : "default";

  function clearFocus() {
    inputRef.current?.blur();
    setFocused(false);
  }

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", clearFocus);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (disabled) {
      clearFocus();
    }
  }, [disabled]);

  return (
    <Pressable
      testID={testID}
      accessibilityHint={accessibilityHint}
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
            className="size-12 items-center justify-center rounded-2xl border bg-white"
            key={`${index}-${digit ? "filled" : "empty"}`}
            style={{
              borderColor:
                isFocused && index === activeIndex
                  ? appLockColors.primary
                  : appLockColors.pinBorder,
              borderCurve: "continuous",
              borderWidth: isFocused && index === activeIndex ? 2 : 1,
            }}
          >
            <Text
              className="text-[22px] font-bold leading-7"
              style={{ color: appLockColors.text }}
            >
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
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onSubmitEditing={onSubmit}
        ref={inputRef}
        returnKeyType={returnKeyType}
        secureTextEntry
        textContentType="none"
        value={pin}
      />
    </Pressable>
  );
}
