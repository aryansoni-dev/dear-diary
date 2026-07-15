import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PinInput } from "@/components/app-lock/PinInput";
import { useAppLock } from "@/hooks/useAppLock";
import { useAppSignOut } from "@/hooks/useAppSignOut";

export function AppLockScreen() {
  const insets = useSafeAreaInsets();
  const signOutApp = useAppSignOut();
  const {
    biometricAvailability,
    config,
    status,
    unlockWithBiometrics,
    unlockWithPin,
  } = useAppLock();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmittingPin, setSubmittingPin] = useState(false);
  const [isSigningOut, setSigningOut] = useState(false);
  const [hasAutoPrompted, setHasAutoPrompted] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const biometricLabel = biometricAvailability?.displayName ?? "Biometrics";
  const canUseBiometrics =
    config?.biometricEnabled === true &&
    biometricAvailability?.isAvailable === true;
  const lockedUntilTime = config?.lockedUntil
    ? Date.parse(config.lockedUntil)
    : null;
  const remainingLockoutSeconds =
    lockedUntilTime && lockedUntilTime > now
      ? Math.ceil((lockedUntilTime - now) / 1000)
      : 0;
  const isPinTemporarilyLocked = remainingLockoutSeconds > 0;

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (status !== "locked") {
      setHasAutoPrompted(false);
      setPin("");
    }
  }, [status]);

  const handleBiometricUnlock = useCallback(
    async (isAutomatic = false) => {
      if (!canUseBiometrics) {
        setMessage("Biometrics are not available or enrolled on this device.");
        return;
      }

      const result = await unlockWithBiometrics();

      if (result.success) {
        setMessage(null);
        return;
      }

      if (result.reason === "cancelled") {
        if (!isAutomatic) {
          setMessage("Biometric unlock was cancelled.");
        }
        return;
      }

      if (result.reason === "temporarily_locked") {
        setMessage("Biometrics are temporarily locked. Use your PIN instead.");
        return;
      }

      setMessage("Biometric unlock failed. Use your PIN instead.");
    },
    [canUseBiometrics, unlockWithBiometrics],
  );

  useEffect(() => {
    if (!canUseBiometrics || hasAutoPrompted) {
      return;
    }

    setHasAutoPrompted(true);
    void handleBiometricUnlock(true);
  }, [canUseBiometrics, handleBiometricUnlock, hasAutoPrompted]);

  const helperMessage = useMemo(() => {
    if (isPinTemporarilyLocked) {
      return `Too many incorrect attempts. Try again in ${remainingLockoutSeconds} seconds.`;
    }

    return message;
  }, [isPinTemporarilyLocked, message, remainingLockoutSeconds]);

  async function handlePinSubmit() {
    if (pin.length !== 6 || isSubmittingPin || isPinTemporarilyLocked) {
      return;
    }

    setSubmittingPin(true);

    try {
      const result = await unlockWithPin(pin);

      if (result.success) {
        setPin("");
        setMessage(null);
        return;
      }

      if (result.reason === "temporarily_locked") {
        setMessage("Too many incorrect attempts. Try again in a moment.");
      } else {
        setMessage("Incorrect PIN. Try again.");
      }

      setPin("");
    } finally {
      setSubmittingPin(false);
    }
  }

  async function handleSignOut() {
    if (isSigningOut) {
      return;
    }

    setSigningOut(true);

    try {
      await signOutApp();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "We could not sign you out. Please try again.",
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#FFF7FB]"
    >
      <ScrollView
        testID="app-lock-screen"
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: Math.max(insets.bottom + 28, 44),
          paddingHorizontal: 28,
          paddingTop: Math.max(insets.top + 28, 56),
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-8">
          <View className="items-center">
            <View
              className="size-20 items-center justify-center rounded-[28px] bg-[#FFDDE8]"
              style={{ boxShadow: "0 10px 26px rgba(255, 32, 86, 0.18)" }}
            >
              <Feather name="lock" size={34} color="#FF2056" />
            </View>
          </View>

          <View className="w-full gap-4">
            <View className="items-center gap-4 rounded-[28px] bg-white px-5 py-6">
              <Text className="text-center text-[15px] font-semibold leading-5 text-[#51515B]">
                Use six-digit PIN
              </Text>
              <PinInput
                testID="app-lock-pin-input"
                accessibilityLabel="Enter your six-digit App Lock PIN"
                accessibilityHint="Enter the PIN to unlock DearDiary"
                disabled={isSubmittingPin || isPinTemporarilyLocked}
                onChangePin={setPin}
                onSubmit={handlePinSubmit}
                pin={pin}
              />

              {helperMessage ? (
                <Text
                  testID="app-lock-error-message"
                  accessibilityLiveRegion="polite"
                  className="text-center text-[14px] font-medium leading-5 text-[#DC2626]"
                >
                  {helperMessage}
                </Text>
              ) : null}

              <Pressable
                testID="app-lock-unlock-button"
                accessibilityLabel="Unlock DearDiary"
                accessibilityRole="button"
                accessibilityState={{
                  disabled:
                    pin.length !== 6 ||
                    isSubmittingPin ||
                    isPinTemporarilyLocked,
                }}
                className="h-[52px] w-full items-center justify-center rounded-full"
                disabled={
                  pin.length !== 6 ||
                  isSubmittingPin ||
                  isPinTemporarilyLocked
                }
                onPress={handlePinSubmit}
                style={{
                  backgroundColor:
                    pin.length === 6 &&
                    !isSubmittingPin &&
                    !isPinTemporarilyLocked
                      ? "#FF2056"
                      : "#F4F4F5",
                }}
              >
                {isSubmittingPin ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text
                    className="text-[16px] font-bold leading-5"
                    style={{
                      color:
                        pin.length === 6 && !isPinTemporarilyLocked
                          ? "#FFFFFF"
                          : "#A1A1AA",
                    }}
                  >
                    Unlock
                  </Text>
                )}
              </Pressable>

              {canUseBiometrics ? (
                <Pressable
                  testID="app-lock-biometric-button"
                  accessibilityLabel={`Unlock with ${biometricLabel}`}
                  accessibilityRole="button"
                  className="h-[52px] w-full flex-row items-center justify-center gap-2 rounded-full bg-[#FFE1EE]"
                  onPress={() => void handleBiometricUnlock(false)}
                >
                  <Feather name="shield" size={19} color="#FF2056" />
                  <Text className="text-[15px] font-bold leading-5 text-[#FF2056]">
                    Unlock with {biometricLabel}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <Pressable
            testID="app-lock-signout-button"
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            className="min-h-11 flex-row items-center justify-center gap-2 px-4"
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#FF2056" size="small" />
            ) : (
              <Feather name="log-out" size={17} color="#FF2056" />
            )}
            <Text className="text-[15px] font-semibold leading-5 text-[#FF2056]">
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
