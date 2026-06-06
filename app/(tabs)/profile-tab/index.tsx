import { Stack } from "expo-router";

import { ProfileScreen } from "@/components/profile/profile-screen";

export default function ProfileTabScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ProfileScreen />
    </>
  );
}
