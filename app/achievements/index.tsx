import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

import { AchievementsScreen } from "@/components/achievements/AchievementsScreen";

export default function AchievementsRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AchievementsScreen />
    </>
  );
}
