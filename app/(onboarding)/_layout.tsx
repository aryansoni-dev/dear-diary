import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

const homeHref = "/home-tab" as const;

export default function OnboardingLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={homeHref} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
