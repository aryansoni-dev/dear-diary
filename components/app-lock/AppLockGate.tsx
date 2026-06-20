import type { ReactNode } from "react";
import { View } from "react-native";

import { AppLockScreen } from "@/components/app-lock/AppLockScreen";
import { AppPrivacyCover } from "@/components/app-lock/AppPrivacyCover";
import { useAppLock } from "@/hooks/useAppLock";

export function AppLockGate({ children }: { children: ReactNode }) {
  const { hasOpenedPrivateContent, isPrivacyCoverVisible, status } =
    useAppLock();

  if (status === "checking") {
    return (
      <AppPrivacyCover className="flex-1" title="Securing your journal..." />
    );
  }

  if (status === "locked") {
    if (hasOpenedPrivateContent) {
      return (
        <View className="flex-1">
          {children}
          <View className="absolute inset-0">
            <AppLockScreen />
          </View>
        </View>
      );
    }

    return <AppLockScreen />;
  }

  return (
    <View className="flex-1">
      {children}
      {isPrivacyCoverVisible ? <AppPrivacyCover /> : null}
    </View>
  );
}
