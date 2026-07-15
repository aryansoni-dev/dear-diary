import { Feather } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BiometricLockSwitch } from "@/components/app-lock/BiometricLockSwitch";
import { PinInput } from "@/components/app-lock/PinInput";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { appLockColors, appLockLayout } from "@/constants/app-lock-theme";
import { useAppLock } from "@/hooks/useAppLock";
import type { AppLockDelay } from "@/types/appLock";

const delayOptions: { label: string; value: AppLockDelay }[] = [
  { label: "Immediately", value: "immediately" },
  { label: "After 1 minute", value: "after_1_minute" },
  { label: "After 5 minutes", value: "after_5_minutes" },
  { label: "After 15 minutes", value: "after_15_minutes" },
];
const privacyHref = "/settings/privacy" as Href;

export default function AppLockSetupScreen() {
  const insets = useSafeAreaInsets();
  const { biometricAvailability, enableAppLock } = useAppLock();
  const [pin, setPin] = useState("");
  const [confirmedPin, setConfirmedPin] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [lockDelay, setLockDelay] = useState<AppLockDelay>("immediately");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);
  const biometricLabel = biometricAvailability?.displayName ?? "Biometrics";
  const canUseBiometrics = biometricAvailability?.isAvailable === true;
  const canSave = pin.length === 6 && confirmedPin.length === 6 && !isSaving;

  useEffect(
    () => () => {
      setPin("");
      setConfirmedPin("");
    },
    [],
  );

  const helperMessage = useMemo(() => {
    if (confirmedPin.length === 6 && pin !== confirmedPin) {
      return "PINs do not match.";
    }

    if (message) {
      return message;
    }

    return null;
  }, [confirmedPin, message, pin]);

  async function handleSave() {
    if (!canSave) {
      return;
    }

    if (pin !== confirmedPin) {
      setConfirmedPin("");
      setMessage("PINs do not match.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await enableAppLock({
        biometricEnabled,
        lockDelay,
        pin,
      });
      setPin("");
      setConfirmedPin("");
      router.replace(privacyHref);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "App Lock could not be enabled. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handlePinChange(nextPin: string) {
    setPin(nextPin);
    setMessage(null);
  }

  function handleConfirmedPinChange(nextConfirmedPin: string) {
    setConfirmedPin(nextConfirmedPin);
    setMessage(null);
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: appLockColors.background }}
    >
      <ScrollView
        testID="app-lock-setup-screen"
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 36, 56),
          paddingHorizontal: appLockLayout.screenPaddingHorizontal,
          paddingTop: Math.max(insets.top + 28, 52),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            testID="app-lock-setup-back-button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            shadow="0 2px 6px rgba(39, 39, 42, 0.16)"
          >
            <Feather name="chevron-left" size={24} color={appLockColors.textMuted} />
          </AnimatedIconButton>

          <Text
            className="text-[20px] font-semibold leading-6"
            style={{ color: appLockColors.text }}
          >
            Set Up App Lock
          </Text>

          <View className="size-[50px]" />
        </View>

        <View className="gap-6 pt-9">
          <View
            className="gap-4"
            style={{
              backgroundColor: appLockColors.surface,
              borderRadius: appLockLayout.cardRadius,
              paddingHorizontal: appLockLayout.cardPaddingHorizontal,
              paddingVertical: appLockLayout.cardPaddingVertical,
            }}
          >
            <Text
              className="text-[18px] font-bold leading-6"
              style={{ color: appLockColors.text }}
            >
              Create a six-digit PIN
            </Text>
            <PinInput
              testID="app-lock-setup-pin-input"
              accessibilityLabel="Create your six-digit App Lock PIN"
              accessibilityHint="Create a six-digit PIN for App Lock"
              autoFocus
              disabled={isSaving}
              onChangePin={handlePinChange}
              pin={pin}
            />
          </View>

          <View
            className="gap-4"
            style={{
              backgroundColor: appLockColors.surface,
              borderRadius: appLockLayout.cardRadius,
              paddingHorizontal: appLockLayout.cardPaddingHorizontal,
              paddingVertical: appLockLayout.cardPaddingVertical,
            }}
          >
            <Text
              className="text-[18px] font-bold leading-6"
              style={{ color: appLockColors.text }}
            >
              Confirm PIN
            </Text>
            <PinInput
              testID="app-lock-confirm-pin-input"
              accessibilityLabel="Confirm your six-digit App Lock PIN"
              accessibilityHint="Re-enter your six-digit App Lock PIN"
              disabled={isSaving}
              onChangePin={handleConfirmedPinChange}
              onSubmit={handleSave}
              pin={confirmedPin}
            />
            {helperMessage ? (
              <Text
                testID="app-lock-error-message"
                className="text-center text-[14px] font-medium leading-5"
                style={{ color: appLockColors.danger }}
              >
                {helperMessage}
              </Text>
            ) : null}
          </View>

          <View
            style={{
              backgroundColor: appLockColors.surface,
              borderRadius: appLockLayout.cardRadius,
              paddingHorizontal: appLockLayout.cardPaddingHorizontal,
              paddingVertical: appLockLayout.compactCardPaddingVertical,
            }}
          >
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text
                  className="text-[17px] font-bold leading-6"
                  style={{ color: appLockColors.text }}
                >
                  Use {biometricLabel}
                </Text>
                <Text
                  className="mt-1 text-[13px] leading-5"
                  style={{ color: appLockColors.textMuted }}
                >
                  {canUseBiometrics
                    ? "You will confirm with your device before it is enabled."
                    : "Biometrics are not available or enrolled on this device."}
                </Text>
              </View>
              <BiometricLockSwitch
                testID="app-lock-biometric-toggle"
                accessibilityLabel={`Use ${biometricLabel} for App Lock`}
                disabled={!canUseBiometrics || isSaving}
                onValueChange={setBiometricEnabled}
                value={biometricEnabled && canUseBiometrics}
              />
            </View>
          </View>

          <View
            className="gap-4"
            style={{
              backgroundColor: appLockColors.surface,
              borderRadius: appLockLayout.cardRadius,
              paddingHorizontal: appLockLayout.cardPaddingHorizontal,
              paddingVertical: appLockLayout.compactCardPaddingVertical,
            }}
          >
            <Text
              className="text-[17px] font-bold leading-6"
              style={{ color: appLockColors.text }}
            >
              Require authentication
            </Text>
            <View className="gap-2">
              {delayOptions.map((option) => (
                <Pressable
                  testID={`app-lock-delay-${option.value}-button`}
                  accessibilityLabel={option.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: lockDelay === option.value }}
                  className="min-h-[46px] flex-row items-center justify-between"
                  key={option.value}
                  onPress={() => setLockDelay(option.value)}
                  style={{
                    backgroundColor:
                      lockDelay === option.value
                        ? appLockColors.primarySoft
                        : appLockColors.option,
                    borderRadius: appLockLayout.optionRadius,
                    paddingHorizontal: appLockLayout.optionPaddingHorizontal,
                  }}
                >
                  <Text
                    className="text-[14px] font-semibold leading-5"
                    style={{ color: appLockColors.text }}
                  >
                    {option.label}
                  </Text>
                  {lockDelay === option.value ? (
                    <Feather
                      name="check"
                      size={18}
                      color={appLockColors.primary}
                    />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            testID="app-lock-enable-button"
            accessibilityLabel="Enable App Lock"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            className="h-[56px] items-center justify-center rounded-full"
            disabled={!canSave}
            onPress={handleSave}
            style={{
              backgroundColor: canSave
                ? appLockColors.primary
                : appLockColors.disabled,
            }}
          >
            {isSaving ? (
              <ActivityIndicator color={appLockColors.surface} size="small" />
            ) : (
              <Text
                className="text-[16px] font-bold leading-5"
                style={{
                  color: canSave
                    ? appLockColors.surface
                    : appLockColors.disabledText,
                }}
              >
                Enable App Lock
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
