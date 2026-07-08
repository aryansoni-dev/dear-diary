import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { journalRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";

export default function JournalLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const writingOptions = useNativeTransitionOptions(
    journalRouteTransitions.new,
  );

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={writingOptions} />;
}
