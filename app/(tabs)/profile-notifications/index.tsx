import { Stack } from "expo-router";

import { NotificationSettingsScreen } from "@/components/profile/notification-settings-screen";

export default function ProfileNotificationsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NotificationSettingsScreen />
    </>
  );
}
