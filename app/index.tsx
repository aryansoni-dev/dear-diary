import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { SplashScreen } from "@/components/onboarding/splash-screen";
import { useOnboardingStore } from "@/store/onboarding-store";

const homeHref = "/home-tab" as const;
const loginHref = "/login" as const;
const onboardingHref = "/onboarding-screen-1" as const;

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const [hasSplashFinished, setHasSplashFinished] = useState(false);
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding,
  );
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const setHasHydrated = useOnboardingStore((state) => state.setHasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    const hydrationFallback = setTimeout(() => {
      setHasHydrated(true);
    }, 1500);

    return () => clearTimeout(hydrationFallback);
  }, [hasHydrated, setHasHydrated]);

  const handleSplashAnimationEnd = useCallback(() => {
    setHasSplashFinished(true);
  }, []);

  if (!hasSplashFinished || !isLoaded || !hasHydrated) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SplashScreen onAnimationEnd={handleSplashAnimationEnd} />
      </>
    );
  }

  if (isSignedIn) {
    return <Redirect href={homeHref} />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href={loginHref} />;
  }

  return <Redirect href={onboardingHref} />;
}
