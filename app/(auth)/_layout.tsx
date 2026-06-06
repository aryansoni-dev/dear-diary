import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { useOnboardingStore } from "@/store/onboarding-store";

const homeHref = "/home-tab" as const;
const onboardingHref = "/onboarding-screen-1" as const;

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasCompletedOnboarding = useOnboardingStore(
    (state) => state.hasCompletedOnboarding,
  );
  const hasHydrated = useOnboardingStore((state) => state.hasHydrated);

  if (!isLoaded || !hasHydrated) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={homeHref} />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={onboardingHref} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
