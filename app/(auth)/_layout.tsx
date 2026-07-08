import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { authRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";
import { useOnboardingStore } from "@/store/onboarding-store";

const homeHref = "/home-tab" as const;
const onboardingHref = "/onboarding-screen-1" as const;

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const authOptions = useNativeTransitionOptions(authRouteTransitions.login);
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

  return <Stack screenOptions={authOptions} />;
}
