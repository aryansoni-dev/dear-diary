import { Feather } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinInput } from "@/components/app-lock/PinInput";
import {
  Divider,
  SettingsCard,
  SettingsRow,
} from "@/components/app-lock/AppLockSettingsComponents";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { appLockColors } from "@/constants/app-lock-theme";
import { useAppLockSettings } from "@/hooks/useAppLockSettings";
import { getPublicEnvironment } from "@/lib/environment";
import type { AppLockDelay } from "@/types/appLock";

const changePinHref = "/settings/app-lock/change-pin" as Href;
const privacyPolicyHref = "/legal/privacy-policy" as Href;
const termsHref = "/legal/terms" as Href;
const accountDeletionUrl = getPublicEnvironment()?.accountDeletionUrl ?? null;

const delayOptions: { label: string; value: AppLockDelay }[] = [
  { label: "Immediately", value: "immediately" },
  { label: "After 1 minute", value: "after_1_minute" },
  { label: "After 5 minutes", value: "after_5_minutes" },
  { label: "After 15 minutes", value: "after_15_minutes" },
];

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    biometricAvailability,
    biometricLabel,
    busyAction,
    canUseBiometrics,
    completePendingAction,
    config,
    handleAppLockPress,
    handleCancelPendingAction,
    handleDelayPress,
    handleDisableBiometricsPress,
    handleEnableBiometrics,
    handlePinChange,
    isEnabled,
    lockNow,
    message,
    pendingAction,
    pin,
  } = useAppLockSettings();
  const isPendingActionBusy = busyAction !== null;

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile-tab");
  }

  return (
    <View className="flex-1 bg-[#FFF7FB]">
      <ScrollView
        testID="settings-screen"
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 36, 56),
          paddingHorizontal: 24,
          paddingTop: Math.max(insets.top + 28, 52),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            testID="settings-back-button"
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
          <SectionTitle>Privacy & Data</SectionTitle>
          <SettingsCard>
            <SettingsRow
              icon="file-text"
              label="Privacy Policy"
              onPress={() => router.push(privacyPolicyHref)}
              testID="profile-privacy-policy-link"
              value=""
            />
            <Divider />
            <SettingsRow
              icon="clipboard"
              label="Terms & Conditions"
              onPress={() => router.push(termsHref)}
              testID="profile-terms-link"
              value=""
            />
            {accountDeletionUrl ? (
              <>
                <Divider />
                <SettingsRow
                  icon="external-link"
                  label="External Deletion Page"
                  onPress={() => router.push(accountDeletionUrl as Href)}
                  testID="settings-external-deletion-row"
                  value="View"
                />
              </>
            ) : null}
          </SettingsCard>
        </View>

        <View className="pt-8">
          <SettingsCard>
            <SettingsRow
              icon="lock"
              isBusy={busyAction === "disable-lock"}
              label="App Lock"
              onPress={handleAppLockPress}
              testID="settings-app-lock-row"
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
              onChangePin={handlePinChange}
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
                      : appLockColors.disabled,
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
                accessibilityState={{ disabled: busyAction !== null }}
                className="h-11 items-center justify-center rounded-full"
                disabled={busyAction !== null}
                onPress={handleCancelPendingAction}
                style={{
                  backgroundColor: appLockColors.disabled,
                  opacity: isPendingActionBusy ? 0.55 : 1,
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
