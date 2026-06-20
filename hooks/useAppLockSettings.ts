import { router, type Href } from "expo-router";
import { useRef, useState } from "react";

import { useAppDialog } from "@/hooks/useAppDialog";
import { useAppLock } from "@/hooks/useAppLock";
import type { AppLockDelay } from "@/types/appLock";

const setupHref = "/settings/app-lock/setup" as Href;

type PendingAction = "disable-lock" | "disable-biometrics" | null;

export function useAppLockSettings() {
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
  const mutationInFlightRef = useRef(false);
  const biometricLabel = biometricAvailability?.displayName ?? "Biometrics";
  const canUseBiometrics =
    config?.biometricEnabled === true &&
    biometricAvailability?.isAvailable === true;

  function showMutationErrorDialog({
    error,
    message,
    title,
  }: {
    error: unknown;
    message: string;
    title: string;
  }) {
    if (__DEV__) {
      console.warn(
        `App Lock settings failed: ${title}`,
        error instanceof Error ? error.message : "Unknown error",
      );
    }

    showDialog({
      confirmText: "OK",
      message,
      title,
      variant: "destructive",
    });
  }

  function beginMutation(action: string) {
    if (mutationInFlightRef.current) {
      return false;
    }

    mutationInFlightRef.current = true;
    setBusyAction(action);
    setMessage(null);
    return true;
  }

  function finishMutation() {
    mutationInFlightRef.current = false;
    setBusyAction(null);
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
    if (!beginMutation("enable-biometrics")) {
      return;
    }

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
    } catch (error) {
      showMutationErrorDialog({
        error,
        message:
          "Biometrics could not be enabled right now. Please try again.",
        title: "Could not enable biometrics",
      });
    } finally {
      finishMutation();
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
    if (!pendingAction) {
      return;
    }

    if (!useBiometric && pin.length !== 6) {
      setMessage("Enter your six-digit PIN.");
      return;
    }

    const currentPendingAction = pendingAction;

    if (!beginMutation(currentPendingAction)) {
      return;
    }

    try {
      const didComplete =
        currentPendingAction === "disable-lock"
          ? await disableAppLock({ pin, useBiometric })
          : await setBiometricEnabled(false, { pin, useBiometric });

      if (!didComplete) {
        setMessage("Authentication failed. Please try again.");
        setPin("");
        return;
      }

      setPendingAction(null);
      setPin("");

      showDialog({
        confirmText: "OK",
        message:
          currentPendingAction === "disable-lock"
            ? "DearDiary will open without App Lock on this device."
            : `${biometricLabel} has been turned off for App Lock.`,
        title:
          currentPendingAction === "disable-lock"
            ? "App Lock disabled"
            : "Biometrics disabled",
        variant: "success",
      });
    } catch (error) {
      setPin("");

      showMutationErrorDialog({
        error,
        message:
          currentPendingAction === "disable-lock"
            ? "App Lock could not be turned off right now. Please try again."
            : `${biometricLabel} could not be turned off right now. Please try again.`,
        title:
          currentPendingAction === "disable-lock"
            ? "Could not disable App Lock"
            : "Could not disable biometrics",
      });
    } finally {
      finishMutation();
    }
  }

  function handlePinChange(nextPin: string) {
    setPin(nextPin);
    setMessage(null);
  }

  function handleCancelPendingAction() {
    setPendingAction(null);
    setPin("");
    setMessage(null);
  }

  async function handleDelayPress(delay: AppLockDelay) {
    if (!beginMutation(delay)) {
      return;
    }

    try {
      await setLockDelay(delay);
    } catch (error) {
      showMutationErrorDialog({
        error,
        message:
          "Your App Lock timing could not be updated right now. Please try again.",
        title: "Could not update timing",
      });
    } finally {
      finishMutation();
    }
  }

  return {
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
  };
}
