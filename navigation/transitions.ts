import { Stack } from "expo-router";
import { useMemo, type ComponentProps } from "react";

import { useReducedMotionPreference } from "@/hooks/useReducedMotionPreference";
import {
  routeTransitionCategories,
  type RouteTransitionCategory,
} from "@/navigation/route-transition-map";

export type NativeTransitionOptions = NonNullable<
  ComponentProps<typeof Stack.Screen>["options"]
>;

const screenBackgroundColor = "#FAF7F2";

const baseNativeTransition = {
  animationTypeForReplace: "pop",
  contentStyle: { backgroundColor: screenBackgroundColor },
  headerShown: false,
} as const satisfies NativeTransitionOptions;

export const nativePremiumPushTransition = {
  ...baseNativeTransition,
  animation: "ios_from_right",
  fullScreenGestureEnabled: false,
  gestureDirection: "horizontal",
  gestureEnabled: true,
} as const satisfies NativeTransitionOptions;

export const nativePremiumWritingTransition = {
  ...baseNativeTransition,
  animation: "ios_from_right",
  fullScreenGestureEnabled: false,
  gestureEnabled: false,
} as const satisfies NativeTransitionOptions;

export const nativePremiumOnboardingTransition = {
  ...baseNativeTransition,
  animation: "ios_from_right",
  fullScreenGestureEnabled: false,
  gestureDirection: "horizontal",
  gestureEnabled: true,
} as const satisfies NativeTransitionOptions;

export const nativePremiumFadeTransition = {
  ...baseNativeTransition,
  animation: "fade",
  animationDuration: 120,
  gestureEnabled: false,
} as const satisfies NativeTransitionOptions;

export const nativePremiumTabTransition = {
  ...baseNativeTransition,
  animation: "ios_from_right",
  gestureEnabled: false,
} as const satisfies NativeTransitionOptions;

export const nativePremiumReducedMotionTransition = {
  ...baseNativeTransition,
  animation: "fade",
  animationDuration: 80,
  gestureEnabled: false,
} as const satisfies NativeTransitionOptions;

const categoryTransitionOptions = {
  [routeTransitionCategories.authBoundary]: nativePremiumFadeTransition,
  [routeTransitionCategories.bottomTab]: nativePremiumTabTransition,
  [routeTransitionCategories.onboarding]: nativePremiumOnboardingTransition,
  [routeTransitionCategories.sensitive]: nativePremiumFadeTransition,
  [routeTransitionCategories.standardDetail]: nativePremiumPushTransition,
  [routeTransitionCategories.writingFlow]: nativePremiumWritingTransition,
} as const satisfies Record<RouteTransitionCategory, NativeTransitionOptions>;

export function getNativeTransitionOptions(
  category: RouteTransitionCategory,
  isReducedMotionEnabled: boolean,
): NativeTransitionOptions {
  if (isReducedMotionEnabled) {
    return nativePremiumReducedMotionTransition;
  }

  return categoryTransitionOptions[category];
}

export function useNativeTransitionOptions(
  category: RouteTransitionCategory,
): NativeTransitionOptions {
  const isReducedMotionEnabled = useReducedMotionPreference();

  return useMemo(
    () => getNativeTransitionOptions(category, isReducedMotionEnabled),
    [category, isReducedMotionEnabled],
  );
}
