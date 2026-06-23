import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { reportAppError } from "@/lib/errors/reportAppError";

type RootErrorFallbackProps = {
  error: Error;
  retry?: () => void;
};

export function RootErrorFallback({ error, retry }: RootErrorFallbackProps) {
  const insets = useSafeAreaInsets();
  const hasReportedRef = useRef(false);

  useEffect(() => {
    if (hasReportedRef.current) {
      return;
    }

    hasReportedRef.current = true;
    reportAppError(error, {
      feature: "navigation",
      operation: "render",
      screen: "root",
    });
  }, [error]);

  return (
    <View
      className="flex-1 justify-center bg-white px-8"
      style={{
        paddingBottom: Math.max(32, insets.bottom + 24),
        paddingTop: Math.max(32, insets.top + 24),
      }}
    >
      <Text className="text-center text-[28px] font-bold leading-9 text-zinc-950">
        Something went wrong
      </Text>
      <Text className="mt-4 text-center text-[16px] leading-7 text-zinc-500">
        DearDiary ran into an unexpected problem. Your previously saved journal
        data should still be available.
      </Text>

      <View className="mt-8 gap-3">
        {retry ? (
          <Pressable
            accessibilityRole="button"
            className="min-h-[52px] items-center justify-center rounded-full bg-brand-primary px-6"
            onPress={retry}
          >
            <Text className="text-[16px] font-bold leading-6 text-white">
              Try again
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          className="min-h-[52px] items-center justify-center rounded-full bg-zinc-100 px-6"
          onPress={() => router.replace("/home-tab")}
        >
          <Text className="text-[16px] font-bold leading-6 text-zinc-700">
            Return to Home
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
