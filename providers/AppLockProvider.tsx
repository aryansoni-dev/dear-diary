import { useAuth } from "@clerk/expo";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAppLockLifecycle } from "@/hooks/useAppLockLifecycle";
import {
  deleteAppLockConfig,
  getAppLockConfig,
  isAppLockConfigLoadError,
  saveAppLockConfig,
} from "@/lib/security/appLockStorage";
import {
  authenticateWithBiometrics,
  getBiometricAvailability,
} from "@/lib/security/biometricService";
import {
  createPinHash,
  generatePinSalt,
  isValidPin,
  verifyPin,
} from "@/lib/security/pinSecurity";
import { useJournalStore } from "@/store/journal-store";
import type {
  AppLockConfig,
  AppLockDelay,
  AppLockStatus,
  AppLockUnlockResult,
  BiometricAvailability,
} from "@/types/appLock";

type SensitiveAuthParams = {
  pin?: string;
  useBiometric?: boolean;
};

type ChangePinParams = SensitiveAuthParams & {
  currentPin?: string;
  nextPin: string;
};

type AppLockContextValue = {
  biometricAvailability: BiometricAvailability | null;
  changePin: (params: ChangePinParams) => Promise<boolean>;
  config: AppLockConfig | null;
  disableAppLock: (params: SensitiveAuthParams) => Promise<boolean>;
  enableAppLock: (params: {
    biometricEnabled: boolean;
    lockDelay: AppLockDelay;
    pin: string;
  }) => Promise<void>;
  isEnabled: boolean;
  isLocked: boolean;
  hasOpenedPrivateContent: boolean;
  isPrivacyCoverVisible: boolean;
  isReady: boolean;
  lockNow: () => void;
  refreshAppLock: () => Promise<void>;
  setBiometricEnabled: (
    enabled: boolean,
    params?: SensitiveAuthParams,
  ) => Promise<boolean>;
  setLockDelay: (delay: AppLockDelay) => Promise<void>;
  status: AppLockStatus;
  unlockWithBiometrics: () => Promise<AppLockUnlockResult>;
  unlockWithPin: (pin: string) => Promise<AppLockUnlockResult>;
};

export const AppLockContext =
  createContext<AppLockContextValue | undefined>(undefined);

const lockoutDurationsMs = {
  fiveFailures: 30_000,
  tenFailures: 300_000,
  eightFailures: 120_000,
} as const;

export function AppLockProvider({ children }: { children: ReactNode }) {
  const { isLoaded, userId } = useAuth();
  const setActiveUserId = useJournalStore((state) => state.setActiveUserId);
  const [status, setStatus] = useState<AppLockStatus>("checking");
  const [config, setConfig] = useState<AppLockConfig | null>(null);
  const [biometricAvailability, setBiometricAvailability] =
    useState<BiometricAvailability | null>(null);
  const [hasOpenedPrivateContent, setHasOpenedPrivateContent] =
    useState(false);
  const [isPrivacyCoverVisible, setPrivacyCoverVisible] = useState(false);
  const isAuthenticatingRef = useRef(false);
  const configRef = useRef<AppLockConfig | null>(null);
  const pinVerificationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const userIdRef = useRef<string | null>(null);

  userIdRef.current = userId ?? null;

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const loadBiometricAvailability = useCallback(async () => {
    const availability = await getBiometricAvailability();
    setBiometricAvailability(availability);

    return availability;
  }, []);

  const refreshAppLock = useCallback(async () => {
    if (!isLoaded) {
      setStatus("checking");
      return;
    }

    setActiveUserId(null);
    setHasOpenedPrivateContent(false);

    if (!userId) {
      setConfig(null);
      setStatus("disabled");
      return;
    }

    const loadingUserId = userId;
    setConfig(null);
    setStatus("checking");

    const [storedConfig] = await Promise.all([
      getAppLockConfig(loadingUserId),
      loadBiometricAvailability(),
    ]);

    if (userIdRef.current !== loadingUserId) {
      return;
    }

    if (isAppLockConfigLoadError(storedConfig)) {
      setConfig(null);
      setStatus("checking");
      setActiveUserId(null);
      setHasOpenedPrivateContent(false);
      return;
    }

    if (!storedConfig?.enabled) {
      setConfig(storedConfig);
      setStatus("disabled");
      setActiveUserId(loadingUserId);
      setHasOpenedPrivateContent(true);
      return;
    }

    setConfig(storedConfig);
    setStatus("locked");
  }, [isLoaded, loadBiometricAvailability, setActiveUserId, userId]);

  useEffect(() => {
    void refreshAppLock();
  }, [refreshAppLock]);

  const saveCurrentConfig = useCallback(
    async (nextConfig: AppLockConfig) => {
      if (!userId) {
        throw new Error("A signed-in user is required.");
      }

      await saveAppLockConfig(userId, nextConfig);
      configRef.current = nextConfig;
      setConfig(nextConfig);
    },
    [userId],
  );

  const lockNow = useCallback(() => {
    if (!config?.enabled) {
      return;
    }

    setStatus("locked");
  }, [config?.enabled]);

  const runQueuedPinVerification = useCallback(
    async (
      operation: () => Promise<AppLockUnlockResult>,
    ): Promise<AppLockUnlockResult> => {
      const previousAttempt = pinVerificationQueueRef.current;
      let releaseCurrentAttempt = () => {};
      const currentAttempt = new Promise<void>((resolve) => {
        releaseCurrentAttempt = resolve;
      });

      pinVerificationQueueRef.current = previousAttempt.then(
        () => currentAttempt,
        () => currentAttempt,
      );

      await previousAttempt.catch(() => undefined);

      try {
        return await operation();
      } finally {
        releaseCurrentAttempt();
      }
    },
    [],
  );

  const verifyPinForConfig = useCallback(
    async (
      pin: string,
      options: { unlockOnSuccess: boolean },
    ): Promise<AppLockUnlockResult> =>
      runQueuedPinVerification(async () => {
        if (!userId || userIdRef.current !== userId) {
          return { reason: "not_available", success: false };
        }

        const currentConfig = configRef.current;

        if (!currentConfig?.enabled) {
          return { reason: "not_available", success: false };
        }

        if (!isValidPin(pin)) {
          return { reason: "invalid_pin", success: false };
        }

        const now = Date.now();

        if (isTemporarilyLocked(currentConfig, now)) {
          return { reason: "temporarily_locked", success: false };
        }

        const isMatch = await verifyPin(
          pin,
          currentConfig.pinSalt,
          currentConfig.pinHash,
        );

        if (isMatch) {
          const unlockedConfig = {
            ...currentConfig,
            failedAttempts: 0,
            lockedUntil: null,
            updatedAt: new Date().toISOString(),
          };

          await saveCurrentConfig(unlockedConfig);

          if (options.unlockOnSuccess) {
            setActiveUserId(userId);
            setHasOpenedPrivateContent(true);
            setStatus("unlocked");
          }

          return { success: true };
        }

        const failedAttempts = currentConfig.failedAttempts + 1;
        const lockedUntil = getLockoutUntil(failedAttempts, now);
        const failedConfig = {
          ...currentConfig,
          failedAttempts,
          lockedUntil,
          updatedAt: new Date().toISOString(),
        };

        await saveCurrentConfig(failedConfig);

        return { reason: "invalid_pin", success: false };
      }),
    [runQueuedPinVerification, saveCurrentConfig, setActiveUserId, userId],
  );

  const unlockWithPin = useCallback(
    async (pin: string) => verifyPinForConfig(pin, { unlockOnSuccess: true }),
    [verifyPinForConfig],
  );

  const unlockWithBiometrics =
    useCallback(async (): Promise<AppLockUnlockResult> => {
      if (!userId || !config?.enabled || !config.biometricEnabled) {
        return { reason: "not_available", success: false };
      }

      if (isAuthenticatingRef.current) {
        return { reason: "cancelled", success: false };
      }

      const authenticatingUserId = userId;
      isAuthenticatingRef.current = true;

      try {
        const result = await authenticateWithBiometrics();

        if (!result.success) {
          return result;
        }

        if (userIdRef.current !== authenticatingUserId) {
          return { reason: "cancelled", success: false };
        }

        const unlockedConfig = {
          ...config,
          failedAttempts: 0,
          lockedUntil: null,
          updatedAt: new Date().toISOString(),
        };

        await saveCurrentConfig(unlockedConfig);
        setActiveUserId(authenticatingUserId);
        setHasOpenedPrivateContent(true);
        setStatus("unlocked");

        return { success: true };
      } finally {
        isAuthenticatingRef.current = false;
      }
    }, [config, saveCurrentConfig, setActiveUserId, userId]);

  const authenticateSensitiveAction = useCallback(
    async (params: SensitiveAuthParams) => {
      if (!config?.enabled) {
        return false;
      }

      if (params.useBiometric && config.biometricEnabled) {
        const result = await unlockWithBiometrics();
        return result.success;
      }

      if (!params.pin) {
        return false;
      }

      const result = await verifyPinForConfig(params.pin, {
        unlockOnSuccess: false,
      });

      return result.success;
    },
    [config, unlockWithBiometrics, verifyPinForConfig],
  );

  const enableAppLock = useCallback(
    async ({
      biometricEnabled,
      lockDelay,
      pin,
    }: {
      biometricEnabled: boolean;
      lockDelay: AppLockDelay;
      pin: string;
    }) => {
      if (!userId) {
        throw new Error("Please sign in before enabling App Lock.");
      }

      if (!isValidPin(pin)) {
        throw new Error("Enter a six-digit PIN.");
      }

      const availability = await loadBiometricAvailability();

      if (biometricEnabled) {
        if (!availability.hasHardware) {
          throw new Error("Biometrics are not available on this device.");
        }

        isAuthenticatingRef.current = true;
        let result: AppLockUnlockResult;

        try {
          result = await authenticateWithBiometrics();
        } finally {
          isAuthenticatingRef.current = false;
        }

        if (!result.success) {
          throw new Error("Biometric authentication was not completed.");
        }

        await loadBiometricAvailability();
      }

      const now = new Date().toISOString();
      const pinSalt = await generatePinSalt();
      const pinHash = await createPinHash(pin, pinSalt);
      const nextConfig: AppLockConfig = {
        biometricEnabled,
        createdAt: now,
        enabled: true,
        failedAttempts: 0,
        lockDelay,
        lockedUntil: null,
        pinHash,
        pinSalt,
        updatedAt: now,
        version: 1,
      };

      await saveAppLockConfig(userId, nextConfig);
      setConfig(nextConfig);
      setActiveUserId(userId);
      setHasOpenedPrivateContent(true);
      setStatus("unlocked");
    },
    [loadBiometricAvailability, setActiveUserId, userId],
  );

  const disableAppLock = useCallback(
    async (params: SensitiveAuthParams) => {
      if (!userId) {
        return false;
      }

      if (!config?.enabled) {
        setConfig(null);
        setStatus("disabled");
        setActiveUserId(userId);
        setHasOpenedPrivateContent(true);
        return true;
      }

      const isAuthorized = await authenticateSensitiveAction(params);

      if (!isAuthorized) {
        return false;
      }

      await deleteAppLockConfig(userId);
      setConfig(null);
      setStatus("disabled");
      setActiveUserId(userId);
      setHasOpenedPrivateContent(true);

      return true;
    },
    [authenticateSensitiveAction, config?.enabled, setActiveUserId, userId],
  );

  const changePin = useCallback(
    async ({ currentPin, nextPin, useBiometric }: ChangePinParams) => {
      if (!config?.enabled || !isValidPin(nextPin)) {
        return false;
      }

      const isAuthorized = await authenticateSensitiveAction({
        pin: currentPin,
        useBiometric,
      });

      if (!isAuthorized) {
        return false;
      }

      const pinSalt = await generatePinSalt();
      const pinHash = await createPinHash(nextPin, pinSalt);
      const nextConfig: AppLockConfig = {
        ...config,
        failedAttempts: 0,
        lockedUntil: null,
        pinHash,
        pinSalt,
        updatedAt: new Date().toISOString(),
      };

      await saveCurrentConfig(nextConfig);

      return true;
    },
    [authenticateSensitiveAction, config, saveCurrentConfig],
  );

  const setBiometricEnabled = useCallback(
    async (enabled: boolean, params?: SensitiveAuthParams) => {
      if (!config?.enabled) {
        return false;
      }

      if (enabled) {
        const availability = await loadBiometricAvailability();

        if (!availability.hasHardware) {
          return false;
        }

        isAuthenticatingRef.current = true;
        let result: AppLockUnlockResult;

        try {
          result = await authenticateWithBiometrics();
        } finally {
          isAuthenticatingRef.current = false;
        }

        if (!result.success) {
          return false;
        }

        await loadBiometricAvailability();
      } else {
        const isAuthorized = await authenticateSensitiveAction(params ?? {});

        if (!isAuthorized) {
          return false;
        }
      }

      const nextConfig: AppLockConfig = {
        ...config,
        biometricEnabled: enabled,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date().toISOString(),
      };

      await saveCurrentConfig(nextConfig);

      return true;
    },
    [
      authenticateSensitiveAction,
      config,
      loadBiometricAvailability,
      saveCurrentConfig,
    ],
  );

  const setLockDelay = useCallback(
    async (delay: AppLockDelay) => {
      if (!config?.enabled) {
        return;
      }

      const nextConfig: AppLockConfig = {
        ...config,
        lockDelay: delay,
        updatedAt: new Date().toISOString(),
      };

      await saveCurrentConfig(nextConfig);
    },
    [config, saveCurrentConfig],
  );

  useAppLockLifecycle({
    config,
    isAuthenticatingRef,
    isEnabled: config?.enabled === true,
    lockNow,
    setPrivacyCoverVisible,
    status,
  });

  const value = useMemo<AppLockContextValue>(
    () => ({
      biometricAvailability,
      changePin,
      config,
      disableAppLock,
      enableAppLock,
      isEnabled: config?.enabled === true,
      isLocked: status === "locked",
      hasOpenedPrivateContent,
      isPrivacyCoverVisible,
      isReady: status !== "checking",
      lockNow,
      refreshAppLock,
      setBiometricEnabled,
      setLockDelay,
      status,
      unlockWithBiometrics,
      unlockWithPin,
    }),
    [
      biometricAvailability,
      changePin,
      config,
      disableAppLock,
      enableAppLock,
      hasOpenedPrivateContent,
      isPrivacyCoverVisible,
      lockNow,
      refreshAppLock,
      setBiometricEnabled,
      setLockDelay,
      status,
      unlockWithBiometrics,
      unlockWithPin,
    ],
  );

  return (
    <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>
  );
}

function isTemporarilyLocked(config: AppLockConfig, now: number) {
  if (!config.lockedUntil) {
    return false;
  }

  return Date.parse(config.lockedUntil) > now;
}

function getLockoutUntil(failedAttempts: number, now: number) {
  if (failedAttempts >= 10) {
    return new Date(now + lockoutDurationsMs.tenFailures).toISOString();
  }

  if (failedAttempts >= 8) {
    return new Date(now + lockoutDurationsMs.eightFailures).toISOString();
  }

  if (failedAttempts >= 5) {
    return new Date(now + lockoutDurationsMs.fiveFailures).toISOString();
  }

  return null;
}
