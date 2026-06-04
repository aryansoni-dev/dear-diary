import { Stack } from "expo-router";
import type { Href } from "expo-router";

import { AuthScreen } from "@/components/auth/auth-screen";

const loginHref = "/login" as Href;

export default function SignupScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreen
        buttonText="Create Account"
        footerLinkHref={loginHref}
        footerLinkText="Login"
        footerText="Already have an account?"
        heading="Create your safe space"
        subheading="Start reflecting, understanding, and growing with DearDiary."
      />
    </>
  );
}
