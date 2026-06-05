import { Stack } from "expo-router";

import { ResetPasswordScreen } from "@/components/auth/reset-password-screen";

export default function ResetPasswdRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ResetPasswordScreen />
    </>
  );
}
