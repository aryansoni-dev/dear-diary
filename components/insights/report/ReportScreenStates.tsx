import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import type { ReactNode } from "react";
import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";

import { reportColors } from "@/constants/report-theme";

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
    <View className="flex-1 bg-[#FAF7F2]">
      <StatusBar hidden />
      <LinearGradient
        colors={["#F4EFFA", "#FAF7F2", "#FAF7F2"]}
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
    <View className="items-center rounded-[28px] bg-white px-6 py-8">
      <ActivityIndicator color={reportColors.primary} />
      <Text
        allowFontScaling={false}
        className="mt-4 text-center text-[17px] font-semibold leading-6 text-[#18181B]"
      >
        Loading your {periodType} reflection...
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-2 text-center text-[15px] leading-6 text-[#71717B]"
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
    <View className="flex-row items-center gap-3 rounded-[22px] bg-white px-4 py-4">
      <ActivityIndicator color={reportColors.primary} />
      <Text
        allowFontScaling={false}
        className="flex-1 text-[15px] font-semibold leading-6 text-[#52525B]"
      >
        DearDiary is reflecting on your{" "}
        {periodType === "weekly" ? "week" : "month"}...
      </Text>
    </View>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View className="rounded-[22px] bg-[#FFE2EA] px-4 py-4">
      <Text
        allowFontScaling={false}
        className="text-[15px] leading-6 text-[#A60033]"
      >
        {message}
      </Text>
    </View>
  );
}

export function StaleBanner({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <View className="rounded-[26px] bg-white px-5 py-5">
      <Text
        allowFontScaling={false}
        className="text-[17px] font-bold leading-6 text-[#18181B]"
      >
        Your journal has changed since this reflection was generated.
      </Text>
      <PrimaryButton
        disabled={disabled}
        label="Update Reflection"
        onPress={onPress}
      />
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
    <View className="rounded-[30px] bg-white px-6 py-7">
      <View className="size-12 items-center justify-center rounded-full bg-[#FFDDE8]">
        <Sparkles color={reportColors.primary} size={22} />
      </View>
      <Text
        allowFontScaling={false}
        className="mt-5 text-[23px] font-bold leading-8 text-[#18181B]"
      >
        Your {periodType} reflection has not been generated yet.
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-3 text-[16px] leading-7 text-[#71717B]"
      >
        DearDiary will analyze this{" "}
        {periodType === "weekly" ? "week's" : "month's"} entries and create a
        visual view of your moods, activity, themes, challenges and progress.
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-4 text-[15px] font-semibold leading-6 text-[#52525B]"
      >
        {availableEntryCount}{" "}
        {availableEntryCount === 1 ? "entry" : "entries"} available
      </Text>
      {!hasEnoughEntries ? (
        <Text
          allowFontScaling={false}
          className="mt-2 text-[14px] leading-6 text-[#71717B]"
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
    <View className="rounded-[30px] bg-white px-6 py-7">
      <Text
        allowFontScaling={false}
        className="text-[23px] font-bold leading-8 text-[#18181B]"
      >
        Older report format
      </Text>
      <Text
        allowFontScaling={false}
        className="mt-3 text-[16px] leading-7 text-[#71717B]"
      >
        A previous reflection is available, but it uses the older report format.
        Update it to view the new graphical report.
      </Text>
      {!hasEnoughEntries ? (
        <Text
          allowFontScaling={false}
          className="mt-3 text-[14px] leading-6 text-[#71717B]"
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
        className="mt-4 text-[13px] leading-5 text-[#71717B]"
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
  const pressValue = useRef(new Animated.Value(0)).current;
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
    <Animated.View className="mt-6" style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled === true }}
        className="h-[52px] flex-row items-center justify-center rounded-full px-5"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => animatePress(1)}
        onPressOut={() => animatePress(0)}
        style={({ pressed }) => ({
          backgroundColor: disabled ? "#E4E4E7" : reportColors.primary,
          opacity: disabled ? 0.7 : pressed ? 0.88 : 1,
        })}
      >
        <Text
          allowFontScaling={false}
          className="text-[16px] font-bold leading-6"
          style={{ color: disabled ? "#71717B" : "white" }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
