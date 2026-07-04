import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { appLockPrivacyCover } from "@/constants/app-lock-theme";

export function AppPrivacyCover({
  className = "absolute inset-0",
  title = "Your journal is private.",
}: {
  className?: string;
  title?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`${className} items-center justify-center`}
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
          <Feather
            name="lock"
            size={appLockPrivacyCover.iconGlyphSize}
            color={appLockPrivacyCover.iconColor}
          />
        </View>
        <Text
          className="text-center font-bold"
          style={{
            color: appLockPrivacyCover.titleColor,
            fontSize: appLockPrivacyCover.titleFontSize,
            lineHeight: appLockPrivacyCover.titleLineHeight,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}
