import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Check,
  ChevronLeft,
  Image as ImageIcon,
  Mic,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { journalEditorMoods } from "@/data/journal-editor";

const colors = {
  body: "#71717B",
  heading: "#09090B",
  primary: "#FF2056",
  mutedChip: "#F4F4F5",
  placeholder: "#8B8B93",
};

const editorToolbarHeight = 84;

export function JournalEditorScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const [selectedMood, setSelectedMood] = useState("Happy");
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const bottomChromeHeight = bottomNavHeight + editorToolbarHeight;
  const activeTab = source === "history" ? "History" : "Today";

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <StatusBar hidden />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          minHeight: 874,
          paddingBottom: bottomChromeHeight + 48,
          paddingHorizontal: 24,
          paddingTop: Math.max(58, insets.top + 20),
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="size-[54px] items-center justify-center rounded-full bg-zinc-100"
            onPress={() => router.back()}
            style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.16)" }}
          >
            <ChevronLeft color={colors.heading} size={25} strokeWidth={3} />
          </Pressable>

          <View className="items-center">
            <Text className="text-[11px] font-semibold uppercase leading-5 tracking-[3.2px] text-[#71717B]">
              Today
            </Text>
            <Text className="text-[19px] font-bold leading-7 text-zinc-950">
              Mon, Jun 16
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            className="h-[54px] flex-row items-center justify-center gap-2 rounded-full bg-[#FF2056] px-7"
            style={{ boxShadow: "0 4px 12px rgba(255, 32, 86, 0.28)" }}
          >
            <Check color="white" size={22} strokeWidth={2.6} />
            <Text className="text-[17px] font-semibold leading-6 text-white">
              Save
            </Text>
          </Pressable>
        </View>

        <View
          className="mb-9 overflow-hidden rounded-[28px]"
          style={{ boxShadow: "0 6px 14px rgba(39, 39, 42, 0.13)" }}
        >
          <LinearGradient
            colors={["#F8E3FA", "#FFE2EA"]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={{ paddingHorizontal: 24, paddingVertical: 24 }}
          >
            <View className="mb-5 flex-row items-center gap-4">
              <View className="size-10 items-center justify-center rounded-full bg-white/60">
                <Sparkles color={colors.primary} size={22} strokeWidth={2.2} />
              </View>
              <Text className="flex-1 text-[11px] font-semibold uppercase leading-5 tracking-[2.4px] text-[#FF2056]">
                {"Today's Reflection Prompt"}
              </Text>
            </View>

            <Text className="text-[23px] font-bold leading-5 text-zinc-950">
              What made you smile unexpectedly today?
            </Text>
          </LinearGradient>
        </View>

        <View className="mb-8">
          <Text className="mb-3 text-[11px] font-semibold uppercase leading-5 tracking-[3.2px] text-[#71717B]">
            How are you feeling?
          </Text>
          <ScrollView
            className="-mx-6"
            contentContainerStyle={{
              gap: 10,
              paddingHorizontal: 24,
              paddingVertical: 2,
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {journalEditorMoods.map((mood) => {
              const isSelected = selectedMood === mood.label;

              return (
                <Pressable
                  accessibilityRole="button"
                  className="h-[52px] shrink-0 flex-row items-center justify-center gap-2 rounded-full px-5"
                  key={mood.label}
                  onPress={() => setSelectedMood(mood.label)}
                  style={{
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.mutedChip,
                    boxShadow: isSelected
                      ? "0 4px 10px rgba(255, 32, 86, 0.24)"
                      : undefined,
                  }}
                >
                  <Text className="text-[18px] leading-6">{mood.emoji}</Text>
                  <Text
                    className="text-[17px] leading-6"
                    style={{
                      color: isSelected ? "white" : colors.heading,
                      fontWeight: isSelected ? "700" : "500",
                    }}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View className="flex-1">
          <TextInput
            accessibilityLabel="Journal title"
            className="min-h-[58px] text-[30px] font-bold leading-10 text-zinc-950"
            placeholder="What's on your mind?"
            placeholderTextColor={colors.placeholder}
          />
          <View className="h-px w-full bg-zinc-200" />
          <TextInput
            accessibilityLabel="Journal entry"
            className="min-h-[280px] pt-6 text-[20px] leading-8 text-zinc-950"
            multiline
            placeholder="Write freely... this is your safe space 🌿"
            placeholderTextColor={colors.placeholder}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* <View
        className="absolute right-6 rounded-full bg-[#FF2056] py-3.5 pl-5 pr-6"
        pointerEvents="box-none"
        style={{
          bottom: bottomNavHeight + 24,
          boxShadow: "0 8px 24px rgba(255, 32, 86, 0.3)",
        }}
      >
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-2"
        >
          <Sparkles color="white" size={21} strokeWidth={2.2} />
          <Text className="text-[14px] font-semibold leading-5 text-white">
            Reflect With AI
          </Text>
        </Pressable>
      </View> */}

      <View
        className="absolute inset-x-0 border-t border-zinc-200 bg-zinc-100/70 px-4 py-3"
        style={{ bottom: bottomNavHeight, height: editorToolbarHeight }}
      >
        <View className="flex-row items-center justify-around">
          <EditorToolbarButton Icon={Mic} label="Voice" />
          <EditorToolbarButton Icon={ImageIcon} label="Photo" />
          <EditorToolbarButton Icon={Tag} label="Tags" />
        </View>
      </View>

      <BottomTabBar activeTab={activeTab} />
    </KeyboardAvoidingView>
  );
}

type EditorToolbarButtonProps = {
  Icon: LucideIcon;
  label: string;
};

function EditorToolbarButton({ Icon, label }: EditorToolbarButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[60px] w-24 items-center justify-center gap-1"
    >
      <Icon color={colors.body} size={26} strokeWidth={2.2} />
      <Text className="text-[12px] font-medium leading-4 text-[#71717B]">
        {label}
      </Text>
    </Pressable>
  );
}
