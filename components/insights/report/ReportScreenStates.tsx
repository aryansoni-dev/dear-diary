import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";

import { reportCardShadow, reportColors } from "@/constants/report-theme";

import {
  getGenerateLabel,
  getReportTitle,
} from "./report-formatters";

type ReportPeriodType = "weekly" | "monthly";

export function ReportShell({
  bottomNavHeight,
  children,
  insetsTop,
}: {
  bottomNavHeight: number;
  children: ReactNode;
  insetsTop: number;
}) {
  return (
    <View
      className="flex-1"
      style={{ backgroundColor: reportColors.background }}
    >
      <StatusBar hidden />
      <LinearGradient
        colors={[
          reportColors.lavender,
          reportColors.background,
          reportColors.background,
        ]}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          bottom: 0,
          left: 0,
          paddingBottom: bottomNavHeight,
          paddingTop: insetsTop,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      {children}
    </View>
  );
}

export function LoadingState({ periodType }: { periodType: ReportPeriodType }) {
  return (
    <View
      className="items-center rounded-[28px] bg-white px-6 py-8"
      style={{ boxShadow: reportCardShadow }}
    >
      <ActivityIndicator color={reportColors.primary} />
      <Text
        allowFontScaling={false}
        className="mt-4 text-center text-[17px] font-semibold leading-6"
        style={{ color: reportColors.heading }}
      >
        Loading your {periodType} reflection...
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-2 text-center text-[15px] leading-6"
        style={{ color: reportColors.muted }}
      >
        Saved visual reports remain available offline after they load once.
      </Text>
    </View>
  );
}

export function UpdatingBanner({
  periodType,
}: {
  periodType: ReportPeriodType;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-[22px] bg-white px-4 py-4"
      style={{ boxShadow: reportCardShadow }}
    >
      <ActivityIndicator color={reportColors.primary} />
      <Text
        allowFontScaling={false}
        className="flex-1 text-[15px] font-semibold leading-6"
        style={{ color: reportColors.explanationText }}
      >
        DearDiary is reflecting on your{" "}
        {periodType === "weekly" ? "week" : "month"}...
      </Text>
    </View>
  );
}

export function ErrorBanner({
  message,
  onRetry,
  retrying = false,
}: {
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <View
      className="rounded-[22px] px-4 py-4"
      style={{
        backgroundColor: reportColors.rose,
        boxShadow: reportCardShadow,
      }}
    >
      <Text
        allowFontScaling={false}
        className="text-[15px] leading-6"
        selectable
        style={{ color: reportColors.errorText }}
      >
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: retrying }}
          className="mt-3 min-h-10 items-center justify-center rounded-full bg-white px-4"
          disabled={retrying}
          onPress={onRetry}
        >
          <Text
            allowFontScaling={false}
            className="text-[14px] font-bold leading-5"
            style={{ color: reportColors.primary }}
          >
            {retrying ? "Retrying..." : "Retry"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ReportRegenerateCard({
  disabled,
  isStale,
  onPress,
}: {
  disabled: boolean;
  isStale: boolean;
  onPress: () => void;
}) {
  return (
    <View
      className="rounded-[26px] bg-white px-5 py-5"
      style={{ boxShadow: reportCardShadow }}
    >
      <Text
        allowFontScaling={false}
        className="text-[17px] font-bold leading-6"
        style={{ color: reportColors.heading }}
      >
        {isStale
          ? "Your journal has changed since this reflection was generated."
          : "Want DearDiary to take another look at this period?"}
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-2 text-[14px] leading-6"
        style={{ color: reportColors.muted }}
      >
        {isStale
          ? "Regenerate the reflection to include your latest journal changes."
          : "You can regenerate this reflection anytime without changing your journal entries."}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        className="mt-5 w-full"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: disabled ? 0.7 : pressed ? 0.88 : 1 })}
      >
        <View
          className="min-h-[54px] w-full items-center justify-center rounded-full px-4 py-3"
          style={{
            backgroundColor: disabled
              ? reportColors.disabled
              : reportColors.primary,
          }}
        >
          <Text
            allowFontScaling={false}
            className="text-center text-[16px] font-bold leading-6"
            style={{ color: disabled ? reportColors.muted : reportColors.card }}
          >
            Regenerate Reflection
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

export function EmptyReportState({
  availableEntryCount,
  disabled,
  hasEnoughEntries,
  minimumEntries,
  onGenerate,
  periodType,
}: {
  availableEntryCount: number;
  disabled: boolean;
  hasEnoughEntries: boolean;
  minimumEntries: number;
  onGenerate: () => void;
  periodType: ReportPeriodType;
}) {
  return (
    <View
      className="rounded-[30px] bg-white px-6 py-7"
      style={{ boxShadow: reportCardShadow }}
    >
      <View
        className="size-12 items-center justify-center rounded-full"
        style={{ backgroundColor: reportColors.pinkSoft }}
      >
        <Sparkles color={reportColors.primary} size={22} />
      </View>
      <Text
        allowFontScaling={false}
        className="mt-5 text-[23px] font-bold leading-8"
        style={{ color: reportColors.heading }}
      >
        Your {periodType} reflection has not been generated yet.
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-3 text-[16px] leading-7"
        style={{ color: reportColors.muted }}
      >
        DearDiary will analyze this{" "}
        {periodType === "weekly" ? "week's" : "month's"} entries and create a
        visual view of your moods, activity, themes, challenges and progress.
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-4 text-[15px] font-semibold leading-6"
        style={{ color: reportColors.explanationText }}
      >
        {availableEntryCount}{" "}
        {availableEntryCount === 1 ? "entry" : "entries"} available
      </Text>
      {!hasEnoughEntries ? (
        <Text
          allowFontScaling={false}
          className="mt-2 text-[14px] leading-6"
          style={{ color: reportColors.muted }}
        >
          Add at least {minimumEntries} entries this{" "}
          {periodType === "weekly" ? "week" : "month"} before generating.
        </Text>
      ) : null}
      <PrimaryButton
        disabled={disabled}
        label={getGenerateLabel(periodType)}
        onPress={onGenerate}
      />
    </View>
  );
}

export function OlderFormatState({
  disabled,
  hasEnoughEntries,
  onGenerate,
  periodType,
}: {
  disabled: boolean;
  hasEnoughEntries: boolean;
  onGenerate: () => void;
  periodType: ReportPeriodType;
}) {
  return (
    <View
      className="rounded-[30px] bg-white px-6 py-7"
      style={{ boxShadow: reportCardShadow }}
    >
      <Text
        allowFontScaling={false}
        className="text-[23px] font-bold leading-8"
        style={{ color: reportColors.heading }}
      >
        Older report format
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-3 text-[16px] leading-7"
        style={{ color: reportColors.muted }}
      >
        A previous reflection is available, but it uses the older report format.
        Update it to view the new graphical report.
      </Text>
      {!hasEnoughEntries ? (
        <Text
          allowFontScaling={false}
          className="mt-3 text-[14px] leading-6"
          style={{ color: reportColors.muted }}
        >
          Add more entries before generating the new visual dashboard.
        </Text>
      ) : null}
      <PrimaryButton
        disabled={disabled}
        label="Generate Visual Reflection"
        onPress={onGenerate}
      />
      <Text
        allowFontScaling={false}
        className="mt-4 text-[13px] leading-5"
        style={{ color: reportColors.muted }}
      >
        {getReportTitle(periodType)} reports now use deterministic chart data
        with a concise AI interpretation.
      </Text>
    </View>
  );
}

export function PrimaryButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  const pressValue = useMemo(() => new Animated.Value(0), []);
  const scale = pressValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  function animatePress(toValue: number) {
    Animated.timing(pressValue, {
      duration: toValue === 1 ? 90 : 130,
      toValue,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View className="mt-6 w-full" style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled === true }}
        className="w-full"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animatePress(1)}
        onPressOut={() => animatePress(0)}
        style={({ pressed }) => ({
          opacity: disabled ? 1 : pressed ? 0.88 : 1,
        })}
      >
        <View
          className="min-h-[54px] w-full flex-row items-center justify-center rounded-full px-4 py-3"
          style={{
            backgroundColor: disabled
              ? reportColors.disabled
              : reportColors.primary,
          }}
        >
          <Text
            allowFontScaling={false}
            className="flex-shrink text-center text-[16px] font-bold leading-6"
            style={{ color: disabled ? reportColors.muted : reportColors.card }}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
