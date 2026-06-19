import * as LocalAuthentication from "expo-local-authentication";

import type {
  AppLockUnlockResult,
  BiometricAvailability,
} from "@/types/appLock";

export const getBiometricAvailability =
  async (): Promise<BiometricAvailability> => {
    try {
      const [hasHardware, isEnrolled, supportedAuthenticationTypes] =
        await Promise.all([
          LocalAuthentication.hasHardwareAsync(),
          LocalAuthentication.isEnrolledAsync(),
          LocalAuthentication.supportedAuthenticationTypesAsync(),
        ]);
      const supportedTypes = supportedAuthenticationTypes.map(
        getAuthenticationTypeLabel,
      );
      const displayName = getBiometricDisplayName(supportedAuthenticationTypes);

      return {
        displayName,
        hasHardware,
        isAvailable: hasHardware && isEnrolled,
        isEnrolled,
        supportedTypes,
      };
    } catch {
      return {
        displayName: "Biometrics",
        hasHardware: false,
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  };

export const authenticateWithBiometrics =
  async (): Promise<AppLockUnlockResult> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        cancelLabel: "Use PIN",
        disableDeviceFallback: true,
        fallbackLabel: "",
        promptMessage: "Unlock DearDiary",
      });

      if (result.success) {
        return { success: true };
      }

      switch (result.error) {
        case "app_cancel":
        case "system_cancel":
        case "user_cancel":
        case "user_fallback":
          return { reason: "cancelled", success: false };
        case "lockout":
          return { reason: "temporarily_locked", success: false };
        case "authentication_failed":
        case "timeout":
        case "unable_to_process":
          return { reason: "failed", success: false };
        case "not_available":
        case "not_enrolled":
        case "passcode_not_set":
          return { reason: "not_available", success: false };
        default:
          return { reason: "unknown", success: false };
      }
    } catch {
      return { reason: "unknown", success: false };
    }
  };

function getAuthenticationTypeLabel(
  type: LocalAuthentication.AuthenticationType,
) {
  const isIos = process.env.EXPO_OS === "ios";

  switch (type) {
    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
      return isIos ? "Face ID" : "Face unlock";
    case LocalAuthentication.AuthenticationType.FINGERPRINT:
      return isIos ? "Touch ID" : "Fingerprint";
    case LocalAuthentication.AuthenticationType.IRIS:
      return "Iris";
    default:
      return "Biometric";
  }
}

function getBiometricDisplayName(
  types: LocalAuthentication.AuthenticationType[],
) {
  const hasFaceRecognition = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const hasFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );
  const isIos = process.env.EXPO_OS === "ios";

  if (isIos && hasFaceRecognition) {
    return "Face ID";
  }

  if (isIos && hasFingerprint) {
    return "Touch ID";
  }

  if (hasFingerprint) {
    return "Fingerprint";
  }

  if (types.length > 0) {
    return "Biometrics";
  }

  return "Biometrics";
}
