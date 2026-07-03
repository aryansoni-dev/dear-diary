import type { Href } from "expo-router";
import { Stack } from "expo-router";

import { AuthScreen } from "@/components/auth/auth-screen";

const signupHref = "/signup" as Href;
const resetPasswordHref = "/reset-passwd" as Href;

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AuthScreen
        buttonText="Log In"
        forgotPasswordHref={resetPasswordHref}
        footerLinkHref={signupHref}
        footerLinkText="SignUp"
        footerText="Don't have an account?"
        heading="Welcome back"
        mode="login"
        // showTemporaryOnboardingBackButton
        subheading="Your thoughts are waiting for you."
      />
    </>
  );
}
