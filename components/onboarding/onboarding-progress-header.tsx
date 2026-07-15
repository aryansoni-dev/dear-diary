import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/theme";

const inactiveDotColor = "#FFC1D2";
const skipTextColor = "#777188";

type OnboardingProgressHeaderProps = {
  activeIndex: number;
  compact?: boolean;
  height?: number;
  maxWidth?: number;
  onSkipPress?: () => void;
  total?: number;
};

export function OnboardingProgressHeader({
  activeIndex,
  compact = false,
  height,
  maxWidth = 390,
  onSkipPress,
  total = 5,
}: OnboardingProgressHeaderProps) {
  const headerHeight = height ?? (compact ? 44 : 56);
  const skipHeight = Math.min(compact ? 40 : 44, headerHeight);
  const dotsTop = Math.min(12, Math.max(10, headerHeight * 0.27));

  return (
    <View
      className="relative w-full self-center"
      style={{ height: headerHeight, maxWidth }}
    >
      <View
        testID="onboarding-page-indicator"
        accessibilityLabel={`Onboarding page ${activeIndex + 1} of ${total}`}
        className="absolute inset-x-0 flex-row items-center justify-center gap-3"
        style={{ top: dotsTop }}
      >
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            className={
              index === activeIndex
                ? "h-2 w-7 rounded-full"
                : "size-2 rounded-full"
            }
            style={{
              backgroundColor:
                index === activeIndex
                  ? colors.brandPrimary
                  : inactiveDotColor,
            }}
          />
        ))}
      </View>

      {onSkipPress ? (
        <Pressable
          testID="onboarding-skip-button"
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
          className="absolute right-0 top-0 items-center justify-center rounded-full px-5"
          onPress={onSkipPress}
          style={{
            backgroundColor: "rgba(255, 221, 232, 0.58)",
            boxShadow: "0 8px 24px -16px rgba(37, 18, 56, 0.35)",
            height: skipHeight,
          }}
        >
          <Text
            className="font-medium leading-6"
            style={{ color: skipTextColor }}
          >
            Skip
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
