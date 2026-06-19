import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLockScreen } from "@/components/app-lock/AppLockScreen";
import { AppPrivacyCover } from "@/components/app-lock/AppPrivacyCover";
import { useAppLock } from "@/hooks/useAppLock";

export function AppLockGate({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { hasOpenedPrivateContent, isPrivacyCoverVisible, status } =
    useAppLock();

  if (status === "checking") {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#FFF7FB] px-8"
        style={{
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: Math.max(insets.top, 24),
        }}
      >
        <View className="items-center gap-4">
          <View className="size-16 items-center justify-center rounded-[22px] bg-[#FFDDE8]">
            <Text className="text-[30px] font-bold leading-9 text-[#FF2056]">
              D
            </Text>
          </View>
          <Text className="text-center text-[22px] font-bold leading-7 text-[#27272A]">
            Securing your journal...
          </Text>
        </View>
      </View>
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
