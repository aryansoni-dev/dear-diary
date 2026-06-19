import { Feather } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinInput } from "@/components/app-lock/PinInput";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useAppLock } from "@/hooks/useAppLock";
import type { AppLockDelay } from "@/types/appLock";

const setupHref = "/settings/app-lock/setup" as Href;
const changePinHref = "/settings/app-lock/change-pin" as Href;

const delayOptions: { label: string; value: AppLockDelay }[] = [
  { label: "Immediately", value: "immediately" },
  { label: "After 1 minute", value: "after_1_minute" },
  { label: "After 5 minutes", value: "after_5_minutes" },
  { label: "After 15 minutes", value: "after_15_minutes" },
];

type PendingAction = "disable-lock" | "disable-biometrics" | null;

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const { showDialog } = useAppDialog();
  const {
    biometricAvailability,
    config,
    disableAppLock,
    isEnabled,
    lockNow,
    setBiometricEnabled,
    setLockDelay,
  } = useAppLock();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const biometricLabel = biometricAvailability?.displayName ?? "Biometrics";
  const canUseBiometrics =
    config?.biometricEnabled === true &&
    biometricAvailability?.isAvailable === true;

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile-tab");
  }

  function handleAppLockPress() {
    if (!isEnabled) {
      router.push(setupHref);
      return;
    }

    showDialog({
      actions: [
        {
          onPress: () => {
            setPendingAction("disable-lock");
            setPin("");
            setMessage(null);
          },
          text: "Continue",
          variant: "destructive",
        },
      ],
      cancelText: "Cancel",
      message:
        "Your journal will open without requiring your PIN or biometrics on this device.",
      showCancel: true,
      title: "Turn off App Lock?",
      variant: "destructive",
    });
  }

  async function handleEnableBiometrics() {
    setBusyAction("enable-biometrics");
    setMessage(null);

    try {
      const didEnable = await setBiometricEnabled(true);

      showDialog({
        confirmText: "OK",
        message: didEnable
          ? `${biometricLabel} can now unlock DearDiary on this device.`
          : "Biometrics could not be enabled. You can keep using your PIN.",
        title: didEnable ? "Biometrics enabled" : "Biometrics unavailable",
        variant: didEnable ? "success" : "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  }

  function handleDisableBiometricsPress() {
    showDialog({
      actions: [
        {
          onPress: () => {
            setPendingAction("disable-biometrics");
            setPin("");
            setMessage(null);
          },
          text: "Continue",
          variant: "destructive",
        },
      ],
      cancelText: "Cancel",
      message:
        "Your PIN will remain available. Biometrics can be enabled again later.",
      showCancel: true,
      title: `Turn off ${biometricLabel}?`,
    });
  }

  async function completePendingAction(useBiometric: boolean) {
    if (!pendingAction || busyAction) {
      return;
    }

    if (!useBiometric && pin.length !== 6) {
      setMessage("Enter your six-digit PIN.");
      return;
    }

    setBusyAction(pendingAction);
    setMessage(null);

    try {
      const didComplete =
        pendingAction === "disable-lock"
          ? await disableAppLock({ pin, useBiometric })
          : await setBiometricEnabled(false, { pin, useBiometric });

      if (!didComplete) {
        setMessage("Authentication failed. Please try again.");
        setPin("");
        return;
      }

      const completedAction = pendingAction;
      setPendingAction(null);
      setPin("");

      showDialog({
        confirmText: "OK",
        message:
          completedAction === "disable-lock"
            ? "DearDiary will open without App Lock on this device."
            : `${biometricLabel} has been turned off for App Lock.`,
        title:
          completedAction === "disable-lock"
            ? "App Lock disabled"
            : "Biometrics disabled",
        variant: "success",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function handleDelayPress(delay: AppLockDelay) {
    setBusyAction(delay);

    try {
      await setLockDelay(delay);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <View className="flex-1 bg-[#FFF7FB]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 36, 56),
          paddingHorizontal: 24,
          paddingTop: Math.max(insets.top + 28, 52),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            accessibilityLabel="Go back"
            onPress={handleBackPress}
            shadow="0 2px 6px rgba(39, 39, 42, 0.16)"
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </AnimatedIconButton>

          <Text className="text-[20px] font-semibold leading-6 text-[#27272A]">
            Privacy & Security
          </Text>

          <View className="size-[50px]" />
        </View>

        <View className="pt-9">
          <SettingsCard>
            <SettingsRow
              icon="lock"
              isBusy={busyAction === "disable-lock"}
              label="App Lock"
              onPress={handleAppLockPress}
              value={isEnabled ? "On" : "Off"}
            />

            {isEnabled ? (
              <>
                <Divider />
                <SettingsRow
                  icon="shield"
                  isBusy={busyAction === "enable-biometrics"}
                  label={`Use ${biometricLabel}`}
                  onPress={
                    config?.biometricEnabled
                      ? handleDisableBiometricsPress
                      : () => void handleEnableBiometrics()
                  }
                  value={config?.biometricEnabled ? "On" : "Off"}
                />
              </>
            ) : null}
          </SettingsCard>

          {isEnabled && biometricAvailability?.isAvailable === false ? (
            <Text className="mt-3 px-2 text-[13px] leading-5 text-[#71717B]">
              Biometrics are not available or enrolled on this device.
            </Text>
          ) : null}
        </View>

        {pendingAction ? (
          <View className="mt-6 gap-4 rounded-[28px] bg-white px-5 py-6">
            <View className="gap-1">
              <Text className="text-[17px] font-bold leading-6 text-[#27272A]">
                Confirm with PIN
              </Text>
              <Text className="text-[14px] leading-5 text-[#71717B]">
                This protects your App Lock settings from casual changes.
              </Text>
            </View>

            {canUseBiometrics ? (
              <Pressable
                accessibilityRole="button"
                className="h-[50px] flex-row items-center justify-center gap-2 rounded-full bg-[#FF2056]"
                onPress={() => void completePendingAction(true)}
              >
                <Feather name="shield" size={18} color="#FFFFFF" />
                <Text className="text-[15px] font-bold leading-5 text-white">
                  Use {biometricLabel}
                </Text>
              </Pressable>
            ) : null}

            <PinInput
              accessibilityLabel="Enter your six-digit App Lock PIN"
              disabled={busyAction !== null}
              onChangePin={setPin}
              onSubmit={() => void completePendingAction(false)}
              pin={pin}
            />

            {message ? (
              <Text className="text-center text-[14px] font-medium leading-5 text-[#DC2626]">
                {message}
              </Text>
            ) : null}

            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: pin.length !== 6 || busyAction !== null,
                }}
                className="h-[50px] items-center justify-center rounded-full"
                disabled={pin.length !== 6 || busyAction !== null}
                onPress={() => void completePendingAction(false)}
                style={{
                  backgroundColor:
                    pin.length === 6 && busyAction === null
                      ? "#FF2056"
                      : "#F4F4F5",
                }}
              >
                {busyAction === pendingAction ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    className="text-[15px] font-bold leading-5"
                    style={{
                      color:
                        pin.length === 6 && busyAction === null
                          ? "#FFFFFF"
                          : "#A1A1AA",
                    }}
                  >
                    Confirm
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="h-11 items-center justify-center rounded-full bg-[#F4F4F5]"
                onPress={() => {
                  setPendingAction(null);
                  setPin("");
                  setMessage(null);
                }}
              >
                <Text className="text-[14px] font-semibold leading-5 text-[#51515B]">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {isEnabled ? (
          <>
            <View className="pt-8">
              <SectionTitle>Require Authentication</SectionTitle>
              <SettingsCard>
                {delayOptions.map((option, index) => (
                  <View key={option.value}>
                    <SettingsRow
                      icon={
                        config?.lockDelay === option.value
                          ? "check-circle"
                          : "clock"
                      }
                      isBusy={busyAction === option.value}
                      label={option.label}
                      onPress={() => void handleDelayPress(option.value)}
                      value={
                        config?.lockDelay === option.value ? "Selected" : ""
                      }
                    />
                    {index < delayOptions.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </SettingsCard>
            </View>

            <View className="pt-8">
              <SectionTitle>Actions</SectionTitle>
              <SettingsCard>
                <SettingsRow
                  icon="key"
                  label="Change PIN"
                  onPress={() => router.push(changePinHref)}
                  value=""
                />
                <Divider />
                <SettingsRow
                  icon="log-in"
                  label="Lock Now"
                  onPress={lockNow}
                  value=""
                />
              </SettingsCard>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-4 text-[19px] font-bold leading-6 text-[#27272A]">
      {children}
    </Text>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View
      className="rounded-[24px] bg-white p-2"
      style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.12)" }}
    >
      {children}
    </View>
  );
}

function Divider() {
  return <View className="mx-3 h-px bg-[#E4E4E7]" />;
}

function SettingsRow({
  icon,
  isBusy = false,
  label,
  onPress,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  isBusy?: boolean;
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[58px] flex-row items-center justify-between gap-3 rounded-[18px] p-3"
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center gap-4">
        <View className="size-10 items-center justify-center rounded-[13px] bg-[#FFE1EE]">
          <Feather name={icon} size={20} color="#FF2056" />
        </View>
        <Text className="flex-1 text-[15px] font-medium leading-5 text-[#27272A]">
          {label}
        </Text>
      </View>

      {isBusy ? (
        <ActivityIndicator color="#A1A1AA" size="small" />
      ) : value ? (
        <Text className="text-[13px] font-semibold leading-5 text-[#71717B]">
          {value}
        </Text>
      ) : (
        <Feather name="chevron-right" size={21} color="#A1A1AA" />
      )}
    </Pressable>
  );
}

