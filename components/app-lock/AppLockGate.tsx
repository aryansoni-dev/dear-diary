import { useAuth, useUser } from "@clerk/expo";
import { Redirect, usePathname } from "expo-router";
import type { ReactNode } from "react";
import { View } from "react-native";

import { AppLockScreen } from "@/components/app-lock/AppLockScreen";
import { AppPrivacyCover } from "@/components/app-lock/AppPrivacyCover";
import { RouteSecurityBoundary } from "@/components/navigation/route-security-boundary";
import { useAppLock } from "@/hooks/useAppLock";
import { useUserScopedStorageHydration } from "@/hooks/useUserScopedStorageHydration";
import { resolveProtectedRouteAccess } from "@/lib/navigation/route-security";
import { useJournalStore } from "@/store/journal-store";

export function AppLockGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    isLoaded: authLoaded,
    isSignedIn,
    userId: authUserId,
  } = useAuth();
  const { isLoaded: clerkUserLoaded, user } = useUser();
  const { isPrivacyCoverVisible, status } = useAppLock();
  const activeUserId = useJournalStore((state) => state.activeUserId);
  const journalEntries = useJournalStore((state) => state.allEntries);
  const userScopedStorageHydrated = useUserScopedStorageHydration();
  const decision = resolveProtectedRouteAccess({
    activeUserId,
    appLockStatus: status,
    authLoaded,
    authUserId: authUserId ?? null,
    clerkUserId: user?.id ?? null,
    clerkUserLoaded,
    isSignedIn: isSignedIn === true,
    journalEntries,
    pathname,
    userScopedStorageHydrated,
  });
  const redirectFallback =
    decision.type === "redirect" ? <Redirect href={decision.href} /> : null;

  return (
    <RouteSecurityBoundary
      authenticationFallback={<Redirect href="/login" />}
      decision={decision}
      loadingFallback={
        <AppPrivacyCover
          className="flex-1"
          title="Securing your journal..."
        />
      }
      lockedFallback={<AppLockScreen />}
      redirectFallback={redirectFallback}
    >
      <View className="flex-1">
        {children}
        {isPrivacyCoverVisible ? <AppPrivacyCover /> : null}
      </View>
    </RouteSecurityBoundary>
  );
}
