import { Stack } from "expo-router";

import { settingsRouteTransitions } from "@/navigation/route-transition-map";
import { useNativeTransitionOptions } from "@/navigation/transitions";

export default function SettingsLayout() {
  const privacyOptions = useNativeTransitionOptions(
    settingsRouteTransitions.privacy,
  );
  const sensitiveOptions = useNativeTransitionOptions(
    settingsRouteTransitions["app-lock/setup"],
  );

  return (
    <Stack screenOptions={privacyOptions}>
      <Stack.Screen name="privacy" options={privacyOptions} />
      <Stack.Screen name="app-lock/setup" options={sensitiveOptions} />
      <Stack.Screen name="app-lock/change-pin" options={sensitiveOptions} />
    </Stack>
  );
}
