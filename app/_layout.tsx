import "../global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { useEffect } from "react";

import { AchievementWatcher } from "@/components/achievements/AchievementWatcher";
import { AppLockGate } from "@/components/app-lock/AppLockGate";
import { setSupabaseAccessTokenProvider } from "@/lib/supabase";
import { AppLockProvider } from "@/providers/AppLockProvider";
import { AppDialogProvider } from "@/providers/AppDialogProvider";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppDialogProvider>
        <AppStack />
      </AppDialogProvider>
    </ClerkProvider>
  );
}

function AppStack() {
  const { getToken, isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded || !userId) {
      setSupabaseAccessTokenProvider(null);
      return;
    }

    setSupabaseAccessTokenProvider(() => getToken());

    return () => setSupabaseAccessTokenProvider(null);
  }, [getToken, isLoaded, userId]);

  return (
    <AppLockProvider>
      <AppLockGate>
        <RootNavigator />
        {isLoaded && userId ? <AchievementWatcher userId={userId} /> : null}
      </AppLockGate>
    </AppLockProvider>
  );
}

function RootNavigator() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="achievements/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="insights/report/[periodType]"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="journal" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
