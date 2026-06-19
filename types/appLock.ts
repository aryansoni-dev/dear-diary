export type AppLockDelay =
  | "immediately"
  | "after_1_minute"
  | "after_5_minutes"
  | "after_15_minutes";

export type AppLockStatus = "checking" | "disabled" | "locked" | "unlocked";

export type AppLockConfig = {
  version: 1;

  enabled: boolean;
  biometricEnabled: boolean;

  pinSalt: string;
  pinHash: string;

  lockDelay: AppLockDelay;

  failedAttempts: number;
  lockedUntil: string | null;

  createdAt: string;
  updatedAt: string;
};

export type BiometricAvailability = {
  hasHardware: boolean;
  isEnrolled: boolean;
  isAvailable: boolean;
  supportedTypes: string[];
  displayName: string;
};

export type AppLockUnlockResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "cancelled"
        | "failed"
        | "not_available"
        | "temporarily_locked"
        | "invalid_pin"
        | "unknown";
    };

