import { useCallback, useEffect, useState, type ReactNode } from "react";

import { AppPrivacyCover } from "@/components/app-lock/AppPrivacyCover";
import { SplashScreen } from "@/components/onboarding/splash-screen";
import { useOnboardingStore } from "@/store/onboarding-store";

const hydrationFallbackDelayMs = 1500;

export function AppLaunchGate({ children }: { children: ReactNode }) {
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
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

  const handleSplashAnimationEnd = useCallback(() => {
    setHasSplashFinished(true);
  }, []);

  if (!hasSplashFinished) {
    return <SplashScreen onAnimationEnd={handleSplashAnimationEnd} />;
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
