import "../global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";

import { AchievementWatcher } from "@/components/achievements/AchievementWatcher";
import { AppLockGate } from "@/components/app-lock/AppLockGate";
import { ConfigurationErrorScreen } from "@/components/errors/configuration-error-screen";
import { RootErrorFallback } from "@/components/errors/RootErrorFallback";
import { AppLaunchGate } from "@/components/onboarding/app-launch-gate";
import { publicEnvironmentResult } from "@/lib/environment";
import { setSupabaseAccessTokenProvider } from "@/lib/supabase";
import { AppLockProvider } from "@/providers/AppLockProvider";
import { AppDialogProvider } from "@/providers/AppDialogProvider";
import { ConnectivityProvider } from "@/providers/ConnectivityProvider";

export default function RootLayout() {
  if (!publicEnvironmentResult.isValid) {
    return (
      <ConfigurationErrorScreen
        developerMessage={
          __DEV__ ? publicEnvironmentResult.developerMessage : undefined
        }
      />
    );
  }

  return (
    <ClerkProvider
      publishableKey={publicEnvironmentResult.environment.clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <ConnectivityProvider>
        <AppDialogProvider>
          <AppStack />
        </AppDialogProvider>
      </ConnectivityProvider>
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RootErrorFallback error={error} retry={retry} />;
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
      <AppLaunchGate>
        <AppLockGate>
          <RootNavigator />
          {isLoaded && userId ? <AchievementWatcher userId={userId} /> : null}
        </AppLockGate>
      </AppLaunchGate>
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
      <Stack.Screen name="legal/privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
