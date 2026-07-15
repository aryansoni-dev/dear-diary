import { useAuth } from "@clerk/expo";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

import { AutoSyncManager } from "@/components/sync/auto-sync-manager";
import { bottomTabRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";

export default function HomeTabLayout() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const tabOptions = useNativeTransitionOptions(
    bottomTabRouteTransitions["home-tab/index"],
  );
  const writingOptions = useNativeTransitionOptions(
    bottomTabRouteTransitions["journal-editor/index"],
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <AutoSyncManager />
      <Stack screenOptions={tabOptions}>
        <Stack.Screen name="home-tab/index" options={tabOptions} />
        <Stack.Screen name="reflect-tab/index" options={tabOptions} />
        <Stack.Screen name="journal-history/index" options={tabOptions} />
        <Stack.Screen name="insights-tab/index" options={tabOptions} />
        <Stack.Screen name="profile-tab/index" options={tabOptions} />
        <Stack.Screen name="ai-chat/index" options={tabOptions} />
        <Stack.Screen name="profile-notifications/index" options={tabOptions} />
        <Stack.Screen name="journal-editor/index" options={writingOptions} />
      </Stack>
    </>
  );
}
