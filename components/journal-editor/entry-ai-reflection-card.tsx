import { RefreshCw, Sparkles } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { EntryAIReflection } from "@/types/entryReflection";

const colors = {
  accent: "#FF2056",
  chipBackground: "#FFE8F0",
  mutedText: "#71717B",
};
const bodyTextStyle = {
  flexShrink: 1,
  flexWrap: "wrap",
  includeFontPadding: true,
  overflow: "visible",
  paddingBottom: 8,
  paddingTop: 3,
} as const;
const smallTextStyle = {
  flexShrink: 1,
  flexWrap: "wrap",
  includeFontPadding: true,
  overflow: "visible",
  paddingBottom: 4,
  paddingTop: 2,
} as const;

type EntryAIReflectionCardProps = {
  error: string | null;
  isGenerating: boolean;
  isLoading: boolean;
  isStale: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  reflection: EntryAIReflection | null;
};

export function EntryAIReflectionCard({
  error,
  isGenerating,
  isLoading,
  isStale,
  onGenerate,
  onRegenerate,
  reflection,
}: EntryAIReflectionCardProps) {
  const isBusy = isGenerating || isLoading;

  if (!reflection) {
    return (
      <View
        className="mt-8 rounded-[28px] bg-white p-5"
        style={{ boxShadow: "0 6px 18px rgba(39, 39, 42, 0.12)" }}
      >
        <View className="flex-row items-start gap-3">
          <View className="size-11 items-center justify-center rounded-full bg-[#FFE8F0]">
            <Sparkles color={colors.accent} size={22} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text className="text-[18px] font-bold leading-6 text-zinc-950">
              Reflect with AI ✨
            </Text>
            <Text
              className="mt-2 text-[15px] text-[#71717B]"
              style={smallTextStyle}
            >
              Get a thoughtful reflection based on this entry.
            </Text>
          </View>
        </View>

        {error ? (
          <Text
            className="mt-4 text-[14px] text-[#DC2626]"
            style={smallTextStyle}
          >
            {error}
          </Text>
        ) : null}

        <ReflectionButton
          disabled={isGenerating}
          isLoading={isGenerating}
          label={isGenerating ? "DearDiary is reflecting..." : "Reflect with AI"}
          onPress={onGenerate}
        />
      </View>
    );
  }

  return (
    <View
      className="mt-8 rounded-[28px] bg-white p-5"
      style={{ boxShadow: "0 6px 18px rgba(39, 39, 42, 0.12)" }}
    >
      <View className="flex-row items-start gap-3">
        <View className="size-11 items-center justify-center rounded-full bg-[#FFE8F0]">
          <Sparkles color={colors.accent} size={22} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="text-[18px] font-bold leading-6 text-zinc-950">
            AI Reflection ✨
          </Text>
          {isLoading ? (
            <Text
              className="mt-1 text-[13px] text-[#71717B]"
              style={smallTextStyle}
            >
              Checking for the latest reflection...
            </Text>
          ) : null}
        </View>
      </View>

      {isStale ? (
        <View className="mt-5 rounded-[20px] bg-[#FFF7ED] p-4">
          <Text
            className="text-[14px] font-semibold text-[#9A3412]"
            style={smallTextStyle}
          >
            This entry has changed since this reflection was generated.
          </Text>
        </View>
      ) : null}

      <ReflectionTextSection title="Summary" value={reflection.summary} />

      <ReflectionChipSection
        items={reflection.emotions}
        title="Emotions"
      />

      <ReflectionChipSection items={reflection.themes} title="Themes" />

      <ReflectionTextSection
        title="Something I noticed"
        value={reflection.observation}
      />

      <ReflectionTextSection
        title="Reflection question"
        value={reflection.followUpQuestion}
      />

      <ReflectionTextSection
        title="Gentle next step"
        value={reflection.suggestion}
      />

      {error ? (
        <Text
          className="mt-5 text-[14px] text-[#DC2626]"
          style={smallTextStyle}
        >
          {error}
        </Text>
      ) : null}

      <ReflectionButton
        disabled={isBusy}
        icon={<RefreshCw color="white" size={18} strokeWidth={2.4} />}
        isLoading={isGenerating}
        label={
          isGenerating
            ? "DearDiary is reflecting..."
            : isStale
              ? "Update Reflection"
              : "Regenerate Reflection"
        }
        onPress={onRegenerate}
      />
    </View>
  );
}

function ReflectionTextSection({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <View className="mt-5">
      <Text className="text-[11px] font-semibold uppercase leading-5 tracking-[2.2px] text-[#A1A1AA]">
        {title}
      </Text>
      <Text
        className="mt-2 text-[16px] text-[#3F3F46]"
        selectable
        style={bodyTextStyle}
      >
        {value}
      </Text>
    </View>
  );
}

function ReflectionChipSection({
  items,
  title,
}: {
  items: string[];
  title: string;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className="mt-5">
      <Text className="text-[11px] font-semibold uppercase leading-5 tracking-[2.2px] text-[#A1A1AA]">
        {title}
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {items.map((item) => (
          <View
            className="rounded-full px-3 py-2"
            key={item}
            style={{ backgroundColor: colors.chipBackground }}
          >
            <Text
              className="text-[14px] font-semibold text-[#FF2056]"
              style={smallTextStyle}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ReflectionButton({
  disabled,
  icon,
  isLoading,
  label,
  onPress,
}: {
  disabled: boolean;
  icon?: ReactNode;
  isLoading: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="mt-5 min-h-[52px] flex-row items-center justify-center gap-2 rounded-full px-5"
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled ? "#F4F4F5" : colors.accent,
      }}
    >
      {isLoading ? (
        <ActivityIndicator color={disabled ? colors.mutedText : "white"} />
      ) : (
        icon
      )}
      <Text
        className="text-center text-[16px] font-bold"
        style={{
          color: disabled ? colors.mutedText : "white",
          includeFontPadding: true,
          lineHeight: 24,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
