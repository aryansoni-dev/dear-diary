import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { AutoSyncManager } from "@/components/sync/auto-sync-manager";

export default function HomeTabLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <AutoSyncManager />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
