import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { AutoSyncManager } from "@/components/sync/auto-sync-manager";
import { bottomTabRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";

export default function HomeTabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const tabOptions = useNativeTransitionOptions(
    bottomTabRouteTransitions["home-tab/index"],
  );
  const writingOptions = useNativeTransitionOptions(
    bottomTabRouteTransitions["journal-editor/index"],
  );

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
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
