import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type InsightsPeriodNavigatorProps = {
  canGoNext: boolean;
  label: string;
  onGoCurrent: () => void;
  onGoNext: () => void;
  onGoPrevious: () => void;
  showCurrentAction: boolean;
};

export function InsightsPeriodNavigator({
  canGoNext,
  label,
  onGoCurrent,
  onGoNext,
  onGoPrevious,
  showCurrentAction,
}: InsightsPeriodNavigatorProps) {
  return (
    <View className="mt-3 rounded-[24px] bg-white/80 px-3 py-3">
      <View className="flex-row items-center justify-between gap-3">
        <IconButton
          accessibilityLabel="Go to previous insights period"
          icon="previous"
          onPress={onGoPrevious}
        />
        <Text className="flex-1 text-center text-[16px] font-bold leading-6 text-[#27272A]">
          {label}
        </Text>
        <IconButton
          accessibilityLabel={
            canGoNext
              ? "Go to next insights period"
              : "Next insights period is in the future"
          }
          disabled={!canGoNext}
          icon="next"
          onPress={onGoNext}
        />
      </View>
      {showCurrentAction ? (
        <Pressable
          accessibilityRole="button"
          className="mt-3 min-h-10 flex-row items-center justify-center gap-2 rounded-full bg-[#F4EFFA] px-4"
          onPress={onGoCurrent}
        >
          <RotateCcw color="#FF2056" size={15} strokeWidth={2.4} />
          <Text className="text-[13px] font-bold leading-5 text-[#FF2056]">
            Current period
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function IconButton({
  accessibilityLabel,
  disabled = false,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  icon: "next" | "previous";
  onPress: () => void;
}) {
  const Icon = icon === "previous" ? ChevronLeft : ChevronRight;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`size-10 items-center justify-center rounded-full ${
        disabled ? "bg-zinc-100" : "bg-[#FFDDE8]"
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon
        color={disabled ? "#A1A1AA" : "#FF2056"}
        size={20}
        strokeWidth={2.5}
      />
    </Pressable>
  );
}
