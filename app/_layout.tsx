import "../global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { resourceCache } from "@clerk/expo/resource-cache";
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
import { rootRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";
import { AppLockProvider } from "@/providers/AppLockProvider";
import { AppDialogProvider } from "@/providers/AppDialogProvider";
import { ConnectivityProvider } from "@/providers/ConnectivityProvider";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";

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
      // Clerk's offline resource cache is experimental; keep this aligned with
      // the SDK pattern and expect changes before the API is production-stable.
      __experimental_resourceCache={resourceCache}
      tokenCache={tokenCache}
    >
      <ConnectivityProvider>
        <AppDialogProvider>
          <SubscriptionProvider>
            <AppStack />
          </SubscriptionProvider>
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
  const authBoundaryOptions = useNativeTransitionOptions(
    rootRouteTransitions.index,
  );
  const standardDetailOptions = useNativeTransitionOptions(
    rootRouteTransitions.settings,
  );
  const writingFlowOptions = useNativeTransitionOptions(
    rootRouteTransitions.journal,
  );
  const sensitiveOptions = useNativeTransitionOptions(rootRouteTransitions.sso);

  return (
    <Stack
      initialRouteName="index"
      screenOptions={authBoundaryOptions}
    >
      <Stack.Screen name="index" options={authBoundaryOptions} />
      <Stack.Screen name="(onboarding)" options={authBoundaryOptions} />
      <Stack.Screen name="(auth)" options={authBoundaryOptions} />
      <Stack.Screen name="(tabs)" options={authBoundaryOptions} />
      <Stack.Screen
        name="achievements/index"
        options={standardDetailOptions}
      />
      <Stack.Screen
        name="insights/report/[periodType]"
        options={standardDetailOptions}
      />
      <Stack.Screen name="journal" options={writingFlowOptions} />
      <Stack.Screen
        name="legal/privacy-policy"
        options={standardDetailOptions}
      />
      <Stack.Screen name="paywall" options={standardDetailOptions} />
      <Stack.Screen name="legal/terms" options={standardDetailOptions} />
      <Stack.Screen name="settings" options={standardDetailOptions} />
      <Stack.Screen name="sso" options={sensitiveOptions} />
      <Stack.Screen name="sso-callback" options={sensitiveOptions} />
    </Stack>
  );
}
