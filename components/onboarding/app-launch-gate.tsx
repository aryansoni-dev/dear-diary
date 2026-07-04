import { useCallback, useEffect, useState, type ReactNode } from "react";

import { SplashScreen } from "@/components/onboarding/splash-screen";
import { useOnboardingStore } from "@/store/onboarding-store";

const hydrationFallbackDelayMs = 1500;

export function AppLaunchGate({ children }: { children: ReactNode }) {
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const setHasHydrated = useOnboardingStore((state) => state.setHasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    const hydrationFallback = setTimeout(() => {
      setHasHydrated(true);
    }, hydrationFallbackDelayMs);

    return () => clearTimeout(hydrationFallback);
  }, [hasHydrated, setHasHydrated]);

  const handleSplashAnimationEnd = useCallback(() => {
    setHasSplashFinished(true);
  }, []);

  if (!hasSplashFinished || !hasHydrated) {
    return <SplashScreen onAnimationEnd={handleSplashAnimationEnd} />;
  }

  return children;
}
