import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appLockPrivacyCover } from "@/constants/app-lock-theme";

export function AppPrivacyCover() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-0 items-center justify-center"
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
          Your journal is private.
        </Text>
      </View>
    </View>
  );
}
