import { useEffect, useRef, type MutableRefObject } from "react";
import { AppState } from "react-native";

import type { AppLockConfig, AppLockDelay, AppLockStatus } from "@/types/appLock";

export const APP_LOCK_DELAY_MS: Record<AppLockDelay, number> = {
  after_1_minute: 60_000,
  after_5_minutes: 300_000,
  after_15_minutes: 900_000,
  immediately: 0,
};

type UseAppLockLifecycleParams = {
  config: AppLockConfig | null;
  isAuthenticatingRef: MutableRefObject<boolean>;
  isEnabled: boolean;
  lockNow: () => void;
  setPrivacyCoverVisible: (isVisible: boolean) => void;
  status: AppLockStatus;
};

export function useAppLockLifecycle({
  config,
  isAuthenticatingRef,
  isEnabled,
  lockNow,
  setPrivacyCoverVisible,
  status,
}: UseAppLockLifecycleParams) {
  const backgroundedAtRef = useRef<number | null>(null);
  const visibilityRef = useRef(AppState.currentState === "active");
  const configRef = useRef(config);
  const isEnabledRef = useRef(isEnabled);
  const statusRef = useRef(status);

  useEffect(() => {
    configRef.current = config;
    isEnabledRef.current = isEnabled;
    statusRef.current = status;
  }, [config, isEnabled, status]);

  useEffect(() => {
    function handleLoseVisibility() {
      if (isAuthenticatingRef.current) {
        return;
      }

      if (!visibilityRef.current) {
        return;
      }

      visibilityRef.current = false;

      const latestConfig = configRef.current;

      if (isEnabledRef.current && statusRef.current === "unlocked") {
        backgroundedAtRef.current = Date.now();
        setPrivacyCoverVisible(true);

        if (latestConfig?.lockDelay === "immediately") {
          lockNow();
        }
      }
    }

    function handleBecomeVisible() {
      if (isAuthenticatingRef.current) {
        return;
      }

      if (visibilityRef.current) {
        return;
      }

      visibilityRef.current = true;

      const backgroundedAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;
      const latestConfig = configRef.current;

      if (
        isEnabledRef.current &&
        statusRef.current === "unlocked" &&
        backgroundedAt !== null &&
        latestConfig
      ) {
        const elapsedMs = Date.now() - backgroundedAt;
        const delayMs = APP_LOCK_DELAY_MS[latestConfig.lockDelay];

        if (elapsedMs >= delayMs) {
          lockNow();
          return;
        }
      }

      setPrivacyCoverVisible(false);
    }

    // Android `blur` can fire for dialogs while the app is still active.
    // Only real AppState transitions should reveal the privacy cover.
    const changeSubscription = AppState.addEventListener("change", (nextState) => {
      if (isAuthenticatingRef.current) {
        return;
      }

      if (nextState === "inactive" || nextState === "background") {
        handleLoseVisibility();
        return;
      }

      if (nextState !== "active") {
        return;
      }

      handleBecomeVisible();
    });

    return () => {
      changeSubscription.remove();
    };
  }, [
    isAuthenticatingRef,
    lockNow,
    setPrivacyCoverVisible,
  ]);

  useEffect(() => {
    if (status === "locked" || status === "disabled") {
      setPrivacyCoverVisible(false);
    }
  }, [setPrivacyCoverVisible, status]);
}
