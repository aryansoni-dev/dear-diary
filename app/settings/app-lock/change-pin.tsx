import { Feather } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
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
import { useAppLock } from "@/hooks/useAppLock";

const privacyHref = "/settings/privacy" as Href;

export default function ChangeAppLockPinScreen() {
  const insets = useSafeAreaInsets();
  const { biometricAvailability, changePin, config } = useAppLock();
  const [currentPin, setCurrentPin] = useState("");
  const [nextPin, setNextPin] = useState("");
  const [confirmedPin, setConfirmedPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);
  const biometricLabel = biometricAvailability?.displayName ?? "Biometrics";
  const canUseBiometrics =
    config?.biometricEnabled === true &&
    biometricAvailability?.isAvailable === true;
  const canSave =
    nextPin.length === 6 && confirmedPin.length === 6 && !isSaving;

  useEffect(
    () => () => {
      setCurrentPin("");
      setNextPin("");
      setConfirmedPin("");
    },
    [],
  );

  async function handleSave(useBiometric: boolean) {
    if (!canSave) {
      return;
    }

    if (!useBiometric && currentPin.length !== 6) {
      setMessage("Enter your current six-digit PIN.");
      return;
    }

    if (nextPin !== confirmedPin) {
      setConfirmedPin("");
      setMessage("New PINs do not match.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const didChange = await changePin({
        currentPin: useBiometric ? undefined : currentPin,
        nextPin,
        useBiometric,
      });

      if (!didChange) {
        setCurrentPin("");
        setMessage("Authentication failed. Please try again.");
        return;
      }

      setCurrentPin("");
      setNextPin("");
      setConfirmedPin("");
      router.replace(privacyHref);
    } catch (error) {
      if (__DEV__) {
        console.warn(
          "App Lock PIN change failed",
          error instanceof Error ? error.message : "Unknown error",
        );
      }

      setCurrentPin("");
      setMessage("We couldn't change your PIN. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCurrentPinChange(pin: string) {
    setCurrentPin(pin);
    setMessage(null);
  }

  function handleNextPinChange(pin: string) {
    setNextPin(pin);
    setMessage(null);
  }

  function handleConfirmedPinChange(pin: string) {
    setConfirmedPin(pin);
    setMessage(null);
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
            Change PIN
          </Text>

          <View className="size-[50px]" />
        </View>

        <View className="gap-6 pt-9">
          <View className="gap-4 rounded-[28px] bg-white px-5 py-6">
            <Text className="text-[18px] font-bold leading-6 text-[#27272A]">
              Current PIN
            </Text>
            <PinInput
              accessibilityLabel="Enter your current six-digit App Lock PIN"
              disabled={isSaving}
              onChangePin={handleCurrentPinChange}
              pin={currentPin}
            />
          </View>

          <View className="gap-4 rounded-[28px] bg-white px-5 py-6">
            <Text className="text-[18px] font-bold leading-6 text-[#27272A]">
              New PIN
            </Text>
            <PinInput
              accessibilityLabel="Enter your new six-digit App Lock PIN"
              disabled={isSaving}
              onChangePin={handleNextPinChange}
              pin={nextPin}
            />
          </View>

          <View className="gap-4 rounded-[28px] bg-white px-5 py-6">
            <Text className="text-[18px] font-bold leading-6 text-[#27272A]">
              Confirm new PIN
            </Text>
            <PinInput
              accessibilityLabel="Confirm your new six-digit App Lock PIN"
              disabled={isSaving}
              onChangePin={handleConfirmedPinChange}
              onSubmit={() => void handleSave(false)}
              pin={confirmedPin}
            />
            {message ? (
              <Text className="text-center text-[14px] font-medium leading-5 text-[#DC2626]">
                {message}
              </Text>
            ) : null}
          </View>

          {canUseBiometrics ? (
            <Pressable
              accessibilityRole="button"
              className="h-[52px] flex-row items-center justify-center gap-2 rounded-full bg-[#FFE1EE]"
              disabled={!canSave}
              onPress={() => void handleSave(true)}
              style={{ opacity: canSave ? 1 : 0.55 }}
            >
              <Feather name="shield" size={18} color="#FF2056" />
              <Text className="text-[15px] font-bold leading-5 text-[#FF2056]">
                Confirm with {biometricLabel}
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !canSave || currentPin.length !== 6,
            }}
            className="h-[56px] items-center justify-center rounded-full"
            disabled={!canSave || currentPin.length !== 6}
            onPress={() => void handleSave(false)}
            style={{
              backgroundColor:
                canSave && currentPin.length === 6 ? "#FF2056" : "#F4F4F5",
            }}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text
                className="text-[16px] font-bold leading-5"
                style={{
                  color:
                    canSave && currentPin.length === 6
                      ? "#FFFFFF"
                      : "#A1A1AA",
                }}
              >
                Save New PIN
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
