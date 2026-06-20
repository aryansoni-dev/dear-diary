import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type TagInputModalProps = {
  onAddTag: (tag: string) => void;
  onClose: () => void;
  visible: boolean;
};

const slideInBottomTiming = {
  duration: 500,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
} as const;

export function TagInputModal({
  onAddTag,
  onClose,
  visible,
}: TagInputModalProps) {
  const inputRef = useRef<TextInput | null>(null);
  const slideProgress = useSharedValue(0);
  const [tagText, setTagText] = useState("");
  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    opacity: slideProgress.value,
    transform: [
      {
        translateY: interpolate(slideProgress.value, [0, 1], [1000, 0]),
      },
    ],
  }));

  useEffect(() => {
    if (!visible) {
      slideProgress.value = 0;
      setTagText("");
      return;
    }

    slideProgress.value = 0;
    slideProgress.value = withTiming(1, slideInBottomTiming);

    const focusTimeout = setTimeout(() => inputRef.current?.focus(), 520);

    return () => clearTimeout(focusTimeout);
  }, [slideProgress, visible]);

  function handleAddTag() {
    if (!tagText.trim()) {
      return;
    }

    onAddTag(tagText);
    setTagText("");
    onClose();
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/30"
      >
        <Pressable
          accessibilityLabel="Close tag input"
          accessibilityRole="button"
          className="flex-1"
          onPress={onClose}
        />

        <Animated.View
          className="rounded-t-[28px] bg-white px-6 pb-8 pt-6"
          style={[
            { boxShadow: "0 -6px 18px rgba(39, 39, 42, 0.14)" },
            sheetAnimatedStyle,
          ]}
        >
          <Text className="text-[13px] font-semibold uppercase leading-5 tracking-[2.4px] text-[#71717B]">
            Add tag
          </Text>
          <TextInput
            ref={inputRef}
            accessibilityLabel="Tag name"
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-4 h-14 rounded-[18px] border border-zinc-200 bg-zinc-50 px-4 py-3 text-[18px] leading-6 text-zinc-950"
            onChangeText={setTagText}
            onSubmitEditing={handleAddTag}
            placeholder="college, stress, gratitude"
            placeholderTextColor="#A1A1AA"
            returnKeyType="done"
            value={tagText}
          />

          <View className="mt-5 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-1 items-center justify-center rounded-full bg-zinc-100"
              onPress={onClose}
            >
              <Text className="text-[16px] font-semibold leading-6 text-zinc-700">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-12 flex-1 items-center justify-center rounded-full bg-[#FF2056]"
              onPress={handleAddTag}
            >
              <Text className="text-[16px] font-semibold leading-6 text-white">
                Add
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
