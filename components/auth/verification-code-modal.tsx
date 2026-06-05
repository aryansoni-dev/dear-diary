import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type VerificationCodeModalProps = {
  code: string;
  description?: string;
  iconName?: React.ComponentProps<typeof Feather>["name"];
  onChangeCode: (code: string) => void;
  onClose: () => void;
  onResendCode?: () => void;
  title?: string;
  visible: boolean;
};

const codeSlots = [0, 1, 2, 3, 4, 5];

export function VerificationCodeModal({
  code,
  description = "You have received an email. Enter the 6-digit verification code to continue.",
  iconName = "mail",
  onChangeCode,
  onClose,
  onResendCode,
  title = "Check your email",
  visible,
}: VerificationCodeModalProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const focusTimer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(focusTimer);
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          flex: 1,
          justifyContent: "flex-end",
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <View
          className="rounded-[28px] bg-white p-6"
          style={{
            borderCurve: "continuous",
            boxShadow: "0 18px 45px -12px rgba(0, 0, 0, 0.22)",
          }}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-2">
              <View className="size-11 items-center justify-center rounded-full bg-[#FFDDE8]">
                <Feather name={iconName} size={20} color="#ff2056" />
              </View>
              <Text className="text-[24px] font-bold leading-8 text-zinc-950">
                {title}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close verification modal"
              className="size-9 items-center justify-center rounded-full bg-zinc-100"
              onPress={onClose}
            >
              <Feather name="x" size={18} color="#71717a" />
            </Pressable>
          </View>

          <Text className="mt-3 text-[14px] leading-6 text-zinc-500">
            {description}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Verification code input"
            className="relative mt-6 flex-row gap-2"
            onPress={() => inputRef.current?.focus()}
          >
            {codeSlots.map((slot) => {
              const digit = code[slot];
              const isActive = slot === code.length && code.length < 6;

              return (
                <View
                  key={slot}
                  className="h-12 flex-1 items-center justify-center rounded-2xl border bg-white"
                  style={{
                    borderColor: digit || isActive ? "#ff2056" : "#e4e4e7",
                    borderCurve: "continuous",
                  }}
                >
                  <Text
                    className="text-center text-[19px] font-bold leading-7 text-zinc-950"
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {digit ?? ""}
                  </Text>
                </View>
              );
            })}

            <TextInput
              ref={inputRef}
              className="absolute inset-0 opacity-0"
              autoComplete="one-time-code"
              autoFocus
              caretHidden
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={onChangeCode}
              textContentType="oneTimeCode"
              value={code}
            />
          </Pressable>

          {onResendCode ? (
            <Pressable
              accessibilityRole="button"
              className="mt-5 self-center px-3 py-1"
              onPress={onResendCode}
            >
              <Text className="text-[12px] font-bold leading-5 text-[#ff2056]">
                Send a new code
              </Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
