import { usePathname } from "expo-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { AppPrivacyCover } from "@/components/app-lock/AppPrivacyCover";
import { SplashScreen } from "@/components/onboarding/splash-screen";
import { useOnboardingStore } from "@/store/onboarding-store";

const hydrationFallbackDelayMs = 1500;
const authCallbackPaths = new Set(["/sso", "/sso-callback"]);

let hasCompletedLaunchSplash = false;

export function AppLaunchGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [hasSplashFinished, setHasSplashFinished] = useState(
    hasCompletedLaunchSplash,
  );
  const [showHydrationFallback, setShowHydrationFallback] = useState(false);
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    const hydrationFallback = setTimeout(() => {
      setShowHydrationFallback(true);
    }, hydrationFallbackDelayMs);

    return () => clearTimeout(hydrationFallback);
  }, [hasHydrated]);

  useEffect(() => {
    if (!authCallbackPaths.has(pathname)) {
      return;
    }

    hasCompletedLaunchSplash = true;
    setHasSplashFinished(true);
  }, [pathname]);

  const handleSplashAnimationEnd = useCallback(() => {
    hasCompletedLaunchSplash = true;
    setHasSplashFinished(true);
  }, []);

  const isAuthCallback = authCallbackPaths.has(pathname);

  if (!hasSplashFinished && !isAuthCallback) {
    return <SplashScreen onAnimationEnd={handleSplashAnimationEnd} />;
  }

  if (isAuthCallback) {
    return children;
  }

  if (!hasHydrated) {
    return showHydrationFallback ? (
      <AppPrivacyCover className="flex-1" title="Preparing your journal..." />
    ) : (
      <SplashScreen onAnimationEnd={handleSplashAnimationEnd} />
    );
  }

  return children;
}
