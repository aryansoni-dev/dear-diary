import { Feather } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinInput } from "@/components/app-lock/PinInput";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
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
    if (message) {
      return message;
    }

    if (confirmedPin.length === 6 && pin !== confirmedPin) {
      return "PINs do not match.";
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

  return (
    <View className="flex-1 bg-[#FFF7FB]">
      <ScrollView
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
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            shadow="0 2px 6px rgba(39, 39, 42, 0.16)"
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </AnimatedIconButton>

          <Text className="text-[20px] font-semibold leading-6 text-[#27272A]">
            Set Up App Lock
          </Text>

          <View className="size-[50px]" />
        </View>

        <View className="gap-6 pt-9">
          <View className="gap-4 rounded-[28px] bg-white px-5 py-6">
            <Text className="text-[18px] font-bold leading-6 text-[#27272A]">
              Create a six-digit PIN
            </Text>
            <PinInput
              accessibilityLabel="Create your six-digit App Lock PIN"
              autoFocus
              disabled={isSaving}
              onChangePin={setPin}
              pin={pin}
            />
          </View>

          <View className="gap-4 rounded-[28px] bg-white px-5 py-6">
            <Text className="text-[18px] font-bold leading-6 text-[#27272A]">
              Confirm PIN
            </Text>
            <PinInput
              accessibilityLabel="Confirm your six-digit App Lock PIN"
              disabled={isSaving}
              onChangePin={setConfirmedPin}
              onSubmit={handleSave}
              pin={confirmedPin}
            />
            {helperMessage ? (
              <Text className="text-center text-[14px] font-medium leading-5 text-[#DC2626]">
                {helperMessage}
              </Text>
            ) : null}
          </View>

          <View className="rounded-[28px] bg-white px-5 py-5">
            <View className="flex-row items-center justify-between gap-4">
              <View className="flex-1">
                <Text className="text-[17px] font-bold leading-6 text-[#27272A]">
                  Use {biometricLabel}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-[#71717B]">
                  {canUseBiometrics
                    ? "You will confirm with your device before it is enabled."
                    : "Biometrics are not available or enrolled on this device."}
                </Text>
              </View>
              <Switch
                accessibilityLabel={`Use ${biometricLabel} for App Lock`}
                disabled={!canUseBiometrics || isSaving}
                onValueChange={setBiometricEnabled}
                value={biometricEnabled && canUseBiometrics}
              />
            </View>
          </View>

          <View className="gap-4 rounded-[28px] bg-white px-5 py-5">
            <Text className="text-[17px] font-bold leading-6 text-[#27272A]">
              Require authentication
            </Text>
            <View className="gap-2">
              {delayOptions.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: lockDelay === option.value }}
                  className="min-h-[46px] flex-row items-center justify-between rounded-2xl px-3"
                  key={option.value}
                  onPress={() => setLockDelay(option.value)}
                  style={{
                    backgroundColor:
                      lockDelay === option.value ? "#FFE1EE" : "#F8F3FC",
                  }}
                >
                  <Text className="text-[14px] font-semibold leading-5 text-[#27272A]">
                    {option.label}
                  </Text>
                  {lockDelay === option.value ? (
                    <Feather name="check" size={18} color="#FF2056" />
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            className="h-[56px] items-center justify-center rounded-full"
            disabled={!canSave}
            onPress={handleSave}
            style={{ backgroundColor: canSave ? "#FF2056" : "#F4F4F5" }}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                className="text-[16px] font-bold leading-5"
                style={{ color: canSave ? "#FFFFFF" : "#A1A1AA" }}
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
