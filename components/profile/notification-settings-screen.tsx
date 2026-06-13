import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomTabBar,
  bottomTabBarBaseHeight,
} from "@/components/navigation/bottom-tab-bar";
import { useAppDialog } from "@/hooks/useAppDialog";
import {
  disableJournalReminders,
  enableJournalReminders,
} from "@/lib/notifications";
import {
  useNotificationPreferencesStore,
  type ReminderKey,
} from "@/store/notification-preferences-store";

const colors = {
  clockAccent: "#1A73E8",
  clockAccentSoft: "#D2E3FC",
  primary: "#FF2056",
};

type ActiveReminderPicker = {
  key: ReminderKey;
  label: string;
  time: string;
};

type TimePickerMode = "hour" | "minute";

export function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { showDialog } = useAppDialog();
  const bottomNavHeight = bottomTabBarBaseHeight + insets.bottom;
  const isEnabled = useNotificationPreferencesStore((state) => state.isEnabled);
  const hasHydrated = useNotificationPreferencesStore(
    (state) => state.hasHydrated,
  );
  const morningReminderTime = useNotificationPreferencesStore(
    (state) => state.morningReminderTime,
  );
  const eveningReminderTime = useNotificationPreferencesStore(
    (state) => state.eveningReminderTime,
  );
  const setIsEnabled = useNotificationPreferencesStore(
    (state) => state.setIsEnabled,
  );
  const setReminderTime = useNotificationPreferencesStore(
    (state) => state.setReminderTime,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activePicker, setActivePicker] = useState<ActiveReminderPicker | null>(
    null,
  );

  async function handleToggleNotifications(nextValue: boolean) {
    if (isSaving || !hasHydrated) {
      return;
    }

    setIsSaving(true);

    try {
      if (nextValue) {
        await enableJournalReminders({
          eveningTime: eveningReminderTime,
          morningTime: morningReminderTime,
        });
        setIsEnabled(true);
        return;
      }

      await disableJournalReminders();
      setIsEnabled(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not update your reminder settings.";
      showDialog({
        confirmText: "OK",
        message,
        title: "Notifications",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectReminderTime(key: ReminderKey, nextTime: string) {
    if (isSaving || !hasHydrated) {
      return;
    }

    const currentTime =
      key === "morning" ? morningReminderTime : eveningReminderTime;

    setReminderTime(key, nextTime);

    if (!isEnabled) {
      return;
    }

    setIsSaving(true);

    try {
      await enableJournalReminders({
        eveningTime: key === "evening" ? nextTime : eveningReminderTime,
        morningTime: key === "morning" ? nextTime : morningReminderTime,
      });
    } catch (error) {
      setReminderTime(key, currentTime);
      const message =
        error instanceof Error
          ? error.message
          : "We could not reschedule your reminder.";
      showDialog({
        confirmText: "OK",
        message,
        title: "Notifications",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile-tab");
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden />
      <LinearGradient
        colors={["#FCE8F8", "#F8F3FC", "#FFFFFF"]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.48, 0.78]}
        start={{ x: 0, y: 0 }}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: bottomNavHeight + 36,
          paddingHorizontal: 28,
          paddingTop: Math.max(66, insets.top + 34),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="size-9 items-center justify-center rounded-full bg-white/75"
            onPress={handleBackPress}
            style={{ boxShadow: "0 2px 6px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </Pressable>

          <Text className="text-[17px] font-semibold leading-6 text-[#27272A]">
            Notifications
          </Text>

          <View className="size-9" />
        </View>

        <View className="pt-9">
          <View
            className="rounded-[24px] bg-white p-2"
            style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
          >
            <View className="min-h-[66px] flex-row items-center justify-between gap-4 rounded-[18px] p-3">
              <View className="flex-1">
                <Text className="text-[16px] font-semibold leading-5 text-[#27272A]">
                  Use notifications?
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
                  Daily reflection reminders
                </Text>
              </View>
              {isSaving ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Switch
                  disabled={!hasHydrated}
                  ios_backgroundColor="#E4E4E7"
                  onValueChange={handleToggleNotifications}
                  thumbColor="#FFFFFF"
                  trackColor={{ false: "#E4E4E7", true: "#FFB3C5" }}
                  value={isEnabled}
                />
              )}
            </View>
          </View>
        </View>

        <View className="pt-7 gap-4">
          <ReminderTimeRow
            label="Morning Intention reminder time"
            onPress={() =>
              setActivePicker({
                key: "morning",
                label: "Morning Intention reminder time",
                time: morningReminderTime,
              })
            }
            time={morningReminderTime}
          />
          <ReminderTimeRow
            label="Evening Reflection reminder time"
            onPress={() =>
              setActivePicker({
                key: "evening",
                label: "Evening Reflection reminder time",
                time: eveningReminderTime,
              })
            }
            time={eveningReminderTime}
          />
        </View>
      </ScrollView>

      {activePicker ? (
        <AlarmTimePickerModal
          initialTime={activePicker.time}
          onCancel={() => setActivePicker(null)}
          onConfirm={(nextTime) => {
            const picker = activePicker;
            setActivePicker(null);
            void handleSelectReminderTime(picker.key, nextTime);
          }}
          title={activePicker.label}
          visible
        />
      ) : null}

      <BottomTabBar activeTab="Profile" />
    </View>
  );
}

function ReminderTimeRow({
  label,
  onPress,
  time,
}: {
  label: string;
  onPress: () => void;
  time: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`Set ${label}`}
      accessibilityRole="button"
      className="min-h-[88px] flex-row items-center justify-between gap-4 rounded-[24px] bg-white px-5 py-4"
      onPress={onPress}
      style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.14)" }}
    >
      <View className="flex-1">
        <Text className="text-[15px] font-medium leading-5 text-[#27272A]">
          {label}
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-11 min-w-[90px] items-center justify-center rounded-[14px] bg-[#EEF3FE] px-4">
          <Text className="text-center text-[18px] font-semibold leading-6 text-[#1A73E8]">
            {formatReminderTime(time)}
          </Text>
        </View>
        <Feather name="chevron-right" size={22} color="#A1A1AA" />
      </View>
    </Pressable>
  );
}

function AlarmTimePickerModal({
  initialTime,
  onCancel,
  onConfirm,
  title,
  visible,
}: {
  initialTime: string;
  onCancel: () => void;
  onConfirm: (time: string) => void;
  title: string;
  visible: boolean;
}) {
  const initialParts = parseTimeParts(initialTime);
  const [draftHour, setDraftHour] = useState(initialParts.hour);
  const [draftMinute, setDraftMinute] = useState(initialParts.minute);
  const [mode, setMode] = useState<TimePickerMode>("hour");
  const period = draftHour >= 12 ? "PM" : "AM";
  const selectedHour = getClockHour(draftHour);

  function handleSelectHour(value: number) {
    const nextHour = getHourFromClockValue(value, period);
    setDraftHour(nextHour);
    setMode("minute");
  }

  function handleSelectMinute(value: number) {
    setDraftMinute(value);
  }

  function handleSelectPeriod(nextPeriod: "AM" | "PM") {
    setDraftHour(getHourFromClockValue(selectedHour, nextPeriod));
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-black/40 px-5 pb-8">
        <View className="rounded-[28px] bg-white px-6 pb-5 pt-6">
          <Text className="text-[14px] font-medium leading-5 text-[#5F6368]">
            {title}
          </Text>

          <View className="mt-5 flex-row items-start justify-between gap-4">
            <View className="flex-row items-center gap-2">
              <TimeHeaderButton
                isSelected={mode === "hour"}
                label={String(selectedHour).padStart(2, "0")}
                onPress={() => setMode("hour")}
              />
              <Text className="text-[44px] font-medium leading-[56px] text-[#27272A]">
                :
              </Text>
              <TimeHeaderButton
                isSelected={mode === "minute"}
                label={String(draftMinute).padStart(2, "0")}
                onPress={() => setMode("minute")}
              />
            </View>

            <View className="overflow-hidden rounded-[10px] border border-[#DADCE0]">
              <PeriodButton
                isSelected={period === "AM"}
                label="AM"
                onPress={() => handleSelectPeriod("AM")}
              />
              <View className="h-px bg-[#DADCE0]" />
              <PeriodButton
                isSelected={period === "PM"}
                label="PM"
                onPress={() => handleSelectPeriod("PM")}
              />
            </View>
          </View>

          <ClockFace
            mode={mode}
            onSelectHour={handleSelectHour}
            onSelectMinute={handleSelectMinute}
            selectedHour={selectedHour}
            selectedMinute={draftMinute}
          />

          <View className="mt-5 flex-row items-center justify-end gap-5">
            <Pressable
              accessibilityRole="button"
              className="min-h-10 justify-center px-1"
              onPress={onCancel}
            >
              <Text className="text-[14px] font-semibold uppercase leading-5 text-[#1A73E8]">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="min-h-10 justify-center px-1"
              onPress={() =>
                onConfirm(
                  `${String(draftHour).padStart(2, "0")}:${String(
                    draftMinute,
                  ).padStart(2, "0")}`,
                )
              }
            >
              <Text className="text-[14px] font-semibold uppercase leading-5 text-[#1A73E8]">
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TimeHeaderButton({
  isSelected,
  label,
  onPress,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[64px] w-[86px] items-center justify-center rounded-[12px]"
      onPress={onPress}
      style={{ backgroundColor: isSelected ? "#D2E3FC" : "#F1F3F4" }}
    >
      <Text
        className="text-[43px] font-medium leading-[52px]"
        style={{ color: isSelected ? colors.clockAccent : "#3C4043" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PeriodButton({
  isSelected,
  label,
  onPress,
}: {
  isSelected: boolean;
  label: "AM" | "PM";
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-8 w-[58px] items-center justify-center"
      onPress={onPress}
      style={{ backgroundColor: isSelected ? colors.clockAccentSoft : "white" }}
    >
      <Text
        className="text-[13px] font-semibold leading-4"
        style={{ color: isSelected ? colors.clockAccent : "#5F6368" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ClockFace({
  mode,
  onSelectHour,
  onSelectMinute,
  selectedHour,
  selectedMinute,
}: {
  mode: TimePickerMode;
  onSelectHour: (hour: number) => void;
  onSelectMinute: (minute: number) => void;
  selectedHour: number;
  selectedMinute: number;
}) {
  const hourOptions = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const options = mode === "hour" ? hourOptions : minuteOptions;

  return (
    <View className="mt-7 items-center">
      <View className="size-[276px] rounded-full bg-[#F1F3F4]">
        {options.map((value) => {
          const isSelected =
            mode === "hour" ? value === selectedHour : value === selectedMinute;
          const angle = mode === "hour" ? (value % 12) * 30 : value * 6;

          return (
            <ClockFaceOption
              isSelected={isSelected}
              key={`${mode}-${value}`}
              label={
                mode === "hour"
                  ? String(value)
                  : String(value).padStart(2, "0")
              }
              onPress={() => {
                if (mode === "hour") {
                  onSelectHour(value);
                  return;
                }

                onSelectMinute(value);
              }}
              polarAngle={angle}
            />
          );
        })}
      </View>
    </View>
  );
}

function ClockFaceOption({
  isSelected,
  label,
  onPress,
  polarAngle,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
  polarAngle: number;
}) {
  const optionSize = 46;
  const radius = 104;
  const center = 138;
  const angleInRadians = ((polarAngle - 90) * Math.PI) / 180;
  const left = center + radius * Math.cos(angleInRadians) - optionSize / 2;
  const top = center + radius * Math.sin(angleInRadians) - optionSize / 2;

  return (
    <Pressable
      accessibilityRole="button"
      className="absolute items-center justify-center rounded-full"
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? colors.clockAccent : "transparent",
        height: optionSize,
        left,
        top,
        width: optionSize,
      }}
    >
      <Text
        className="text-[16px] font-medium leading-5"
        style={{ color: isSelected ? "white" : "#3C4043" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function formatReminderTime(value: string) {
  const { hour, minute } = parseTimeParts(value);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hour, minute));
}

function parseTimeParts(value: string) {
  const [hourValue, minuteValue] = value.split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return { hour: 8, minute: 0 };
  }

  return { hour, minute };
}

function getClockHour(hour: number) {
  const clockHour = hour % 12;

  return clockHour === 0 ? 12 : clockHour;
}

function getHourFromClockValue(value: number, period: "AM" | "PM") {
  if (period === "AM") {
    return value === 12 ? 0 : value;
  }

  return value === 12 ? 12 : value + 12;
}
