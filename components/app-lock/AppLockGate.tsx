import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLockScreen } from "@/components/app-lock/AppLockScreen";
import { AppPrivacyCover } from "@/components/app-lock/AppPrivacyCover";
import { appLockPrivacyCover } from "@/constants/app-lock-theme";
import { useAppLock } from "@/hooks/useAppLock";

export function AppLockGate({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { hasOpenedPrivateContent, isPrivacyCoverVisible, status } =
    useAppLock();

  if (status === "checking") {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: appLockPrivacyCover.backgroundColor,
          paddingBottom: Math.max(
            insets.bottom,
            appLockPrivacyCover.safeAreaPadding,
          ),
          paddingHorizontal: appLockPrivacyCover.paddingHorizontal,
          paddingTop: Math.max(insets.top, appLockPrivacyCover.safeAreaPadding),
        }}
      >
        <View
          className="items-center"
          style={{ gap: appLockPrivacyCover.contentGap }}
        >
          <View
            className="items-center justify-center"
            style={{
              backgroundColor: appLockPrivacyCover.iconBackgroundColor,
              borderRadius: appLockPrivacyCover.iconRadius,
              height: appLockPrivacyCover.iconSize,
              width: appLockPrivacyCover.iconSize,
            }}
          >
            <Text
              className="font-bold"
              style={{
                color: appLockPrivacyCover.iconTextColor,
                fontSize: appLockPrivacyCover.iconFontSize,
                lineHeight: appLockPrivacyCover.iconLineHeight,
              }}
            >
              D
            </Text>
          </View>
          <Text
            className="text-center font-bold"
            style={{
              color: appLockPrivacyCover.titleColor,
              fontSize: appLockPrivacyCover.titleFontSize,
              lineHeight: appLockPrivacyCover.titleLineHeight,
            }}
          >
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
