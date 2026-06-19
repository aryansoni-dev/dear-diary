import { useEffect, useRef, type MutableRefObject } from "react";
import { AppState, type AppStateStatus } from "react-native";

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
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAtRef = useRef<number | null>(null);
  const visibilityRef = useRef(AppState.currentState === "active");

  useEffect(() => {
    function handleLoseVisibility() {
      if (!visibilityRef.current) {
        return;
      }

      visibilityRef.current = false;

      if (isAuthenticatingRef.current) {
        return;
      }

      if (isEnabled && status === "unlocked") {
        backgroundedAtRef.current = Date.now();
        setPrivacyCoverVisible(true);

        if (config?.lockDelay === "immediately") {
          lockNow();
        }
      }
    }

    function handleBecomeVisible() {
      if (visibilityRef.current) {
        return;
      }

      visibilityRef.current = true;

      if (isAuthenticatingRef.current) {
        return;
      }

      const backgroundedAt = backgroundedAtRef.current;
      backgroundedAtRef.current = null;

      if (
        isEnabled &&
        status === "unlocked" &&
        backgroundedAt !== null &&
        config
      ) {
        const elapsedMs = Date.now() - backgroundedAt;
        const delayMs = APP_LOCK_DELAY_MS[config.lockDelay];

        if (elapsedMs >= delayMs) {
          lockNow();
          return;
        }
      }

      setPrivacyCoverVisible(false);
    }

    const changeSubscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;

      if (isAuthenticatingRef.current) {
        return;
      }

      if (
        previousState === "active" &&
        (nextState === "inactive" || nextState === "background")
      ) {
        handleLoseVisibility();
        return;
      }

      if (nextState !== "active") {
        return;
      }

      handleBecomeVisible();
    });
    const blurSubscription = AppState.addEventListener(
      "blur",
      handleLoseVisibility,
    );
    const focusSubscription = AppState.addEventListener(
      "focus",
      handleBecomeVisible,
    );

    return () => {
      blurSubscription.remove();
      changeSubscription.remove();
      focusSubscription.remove();
    };
  }, [
    config,
    isAuthenticatingRef,
    isEnabled,
    lockNow,
    setPrivacyCoverVisible,
    status,
  ]);

  useEffect(() => {
    if (status === "locked" || status === "disabled") {
      setPrivacyCoverVisible(false);
    }
  }, [setPrivacyCoverVisible, status]);
}
