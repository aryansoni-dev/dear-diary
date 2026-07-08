import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { onboardingRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";

const homeHref = "/home-tab" as const;

export default function OnboardingLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const onboardingOptions = useNativeTransitionOptions(
    onboardingRouteTransitions["onboarding-screen-1"],
  );

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={homeHref} />;
  }

  return <Stack screenOptions={onboardingOptions} />;
}
