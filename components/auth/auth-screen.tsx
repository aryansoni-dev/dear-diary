import {
  useAuth,
  useSignIn,
  useSignUp,
  useSSO,
} from "@clerk/expo";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { OfflineNotice } from "@/components/connectivity/OfflineNotice";
import { images } from "@/constants/images";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useOnboardingStore } from "@/store/onboarding-store";

import { AuthTextField } from "./auth-text-field";
import {
  finalizeAuth,
  getClerkErrorMessage,
  getEmailFeedback,
  getPasswordFeedback,
  homeHref,
  showAuthError,
} from "./auth-utils";
import { VerificationCodeModal } from "./verification-code-modal";

type AuthScreenProps = {
  buttonText: string;
  forgotPasswordHref?: Href;
  forgotPasswordText?: string;
  footerLinkHref: Href;
  footerLinkText: string;
  footerText: string;
  heading: string;
  mode?: "login" | "signup";
  subheading: string;
  showTemporaryOnboardingBackButton?: boolean;
};

type VerificationFlow = "signup" | "login-email-code" | null;

const ssoRedirectUrl = AuthSession.makeRedirectUri({ path: "sso" });
const onboardingHref = "/onboarding-screen-1" as Href;

export function AuthScreen({
  buttonText,
  forgotPasswordHref,
  forgotPasswordText = "Forgot password?",
  footerLinkHref,
  footerLinkText,
  footerText,
  heading,
  mode = "signup",
  showTemporaryOnboardingBackButton = false,
  subheading,
}: AuthScreenProps) {
  const { height, width } = useWindowDimensions();
  const isCompact = height < 720;
  const horizontalPadding = 24;
  const topPadding = isCompact ? 34 : 52;
  const bottomPadding = isCompact ? 18 : 24;
  const contentWidth = Math.min(width - horizontalPadding * 2, 384);
  const contentMinHeight = height - topPadding - bottomPadding;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [verificationFlow, setVerificationFlow] =
    useState<VerificationFlow>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [socialStrategy, setSocialStrategy] = useState<
    "oauth_google" | "oauth_apple" | null
  >(null);
  const isLogin = mode === "login";
  const { isLoaded: isAuthLoaded } = useAuth();
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { showDialog } = useAppDialog();
  const connectivity = useConnectivity();
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const isFetching =
    signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const isOffline = connectivity.status === "offline";
  const isClerkReady = isAuthLoaded && !isFetching;
  const isAuthActionDisabled = !isClerkReady || isOffline || isSubmitting;
  const isSocialActionDisabled =
    !isClerkReady || isOffline || socialStrategy !== null;
  const emailFeedback = getEmailFeedback(email);
  const passwordFeedback = getPasswordFeedback(password, isLogin);

  function showError(message: string) {
    showAuthError(showDialog, message);
  }

  async function handlePrimaryPress() {
    if (isOffline) {
      showError("No Internet Access. Connect to the internet to continue.");
      return;
    }

    if (!isClerkReady || isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      showError("Enter your email address and password to continue.");
      return;
    }

    if (emailFeedback?.tone === "error") {
      showError(emailFeedback.message);
      return;
    }

    if (!isLogin && getNameParts(fullName).lastName === undefined) {
      showError("Enter your first and last name to continue.");
      return;
    }

    if (!isLogin && passwordFeedback?.tone === "error") {
      showError(passwordFeedback.message);
      return;
    }

    setIsSubmitting(true);

    if (isLogin) {
      try {
        const { error } = await signIn.password({
          emailAddress: email.trim(),
          password,
        });

        if (error) {
          showError(getClerkErrorMessage(error));
          return;
        }

        if (signIn.status === "complete") {
          await finalizeAuth(signIn, showDialog);
          return;
        }

        if (
          signIn.status === "needs_client_trust" ||
          signIn.status === "needs_second_factor"
        ) {
          await sendLoginVerificationCode();
          return;
        }

        showError("This account needs another verification step.");
      } catch (error) {
        showError(getClerkErrorMessage(error));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      const { firstName, lastName } = getNameParts(fullName);
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        firstName,
        lastName,
        password,
      });

      if (error) {
        showError(getClerkErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeAuth(signUp, showDialog);
        return;
      }

      const emailCodeResult = await signUp.verifications.sendEmailCode();
      if (emailCodeResult.error) {
        showError(getClerkErrorMessage(emailCodeResult.error));
        return;
      }

      setVerificationCode("");
      setVerificationFlow("signup");
      setIsVerificationVisible(true);
    } catch (error) {
      showError(getClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleVerificationChange(value: string) {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(nextCode);

    if (nextCode.length === 6) {
      void handleVerifyCode(nextCode);
    }
  }

  async function handleVerifyCode(code: string) {
    if (isVerifying) {
      return;
    }

    if (verificationFlow === "login-email-code") {
      await handleVerifyLoginCode(code);
      return;
    }

    setIsVerifying(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        showError(getClerkErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeAuth(signUp, showDialog);
        setIsVerificationVisible(false);
        return;
      }

      showError(getMissingRequirementsMessage(signUp));
    } catch (error) {
      showError(getClerkErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendVerificationCode() {
    if (verificationFlow === "login-email-code") {
      await sendLoginVerificationCode();
      return;
    }

    try {
      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        showError(getClerkErrorMessage(error));
        return;
      }

      setVerificationCode("");
    } catch (error) {
      showError(getClerkErrorMessage(error));
    }
  }

  async function sendLoginVerificationCode() {
    const supportsEmailCode = signIn.supportedSecondFactors.some(
      (factor) => factor.strategy === "email_code",
    );

    if (!supportsEmailCode) {
      showError(
        "This account needs a verification method that is not available here yet.",
      );
      return;
    }

    try {
      const { error } = await signIn.mfa.sendEmailCode();

      if (error) {
        showError(getClerkErrorMessage(error));
        return;
      }

      setVerificationCode("");
      setVerificationFlow("login-email-code");
      setIsVerificationVisible(true);
    } catch (error) {
      showError(getClerkErrorMessage(error));
    }
  }

  async function handleVerifyLoginCode(code: string) {
    setIsVerifying(true);

    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });

      if (error) {
        showError(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await finalizeAuth(signIn, showDialog);
        setIsVerificationVisible(false);
        setVerificationFlow(null);
        return;
      }

      showError("This account needs another verification step.");
    } catch (error) {
      showError(getClerkErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSocialPress(strategy: "oauth_google" | "oauth_apple") {
    if (isOffline) {
      showError("No Internet Access. Connect to the internet to continue.");
      return;
    }

    if (!isClerkReady || socialStrategy) {
      return;
    }

    setSocialStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        redirectUrl: ssoRedirectUrl,
        strategy,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace(homeHref);
        return;
      }

      showError(
        `${getSocialProviderLabel(strategy)} ${mode} needs one more step before continuing.`,
      );
    } catch (error) {
      showError(getClerkErrorMessage(error));
    } finally {
      setSocialStrategy(null);
    }
  }

  function handleTemporaryOnboardingBackPress() {
    resetOnboarding();
    router.replace(onboardingHref);
  }

  return (
    <LinearGradient
      colors={["#FFF4FA", "#FAF7F2"]}
      locations={[0, 1]}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: bottomPadding,
          paddingHorizontal: horizontalPadding,
          paddingTop: topPadding,
        }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StatusBar hidden />

        <View
          className="mx-auto w-full"
          style={{ minHeight: contentMinHeight, width: contentWidth }}
        >
          <View className="items-center gap-1">
            <Image
              source={images.appLogo}
              contentFit="contain"
              accessibilityLabel="DearDiary app logo"
              style={{ height: 56, width: 76 }}
            />

            <Text className="mt-1 text-center text-[29px] font-bold leading-[33px] text-zinc-950">
              {heading}
            </Text>
            <Text className="h-10 max-w-[340px] text-center text-[14px] leading-5 text-zinc-500">
              {subheading}
            </Text>
          </View>

          <View className="absolute left-2 top-[91px] size-2.5 rounded-full bg-[#ffb6c7]" />
          <View className="absolute right-3 top-[121px] size-1.5 rounded-full bg-[#ff8aae]" />

          <View
            className="mt-6 rounded-[28px] border border-white/80 bg-white/90 px-5 pb-5 pt-6"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 18px 55px -22px rgba(255, 32, 86, 0.35)",
            }}
          >
            <View className="gap-4">
              {isOffline ? (
                <OfflineNotice
                  message={
                    isLogin
                      ? "No Internet Access. Connect to the internet to sign in."
                      : "No Internet Access. Connect to the internet to create your account."
                  }
                />
              ) : null}

              {!isLogin ? (
                <AuthTextField
                  iconName="user"
                  label="Full name"
                  onChangeText={setFullName}
                  placeholder="Your full name"
                  value={fullName}
                />
              ) : null}
              <AuthTextField
                iconName="mail"
                keyboardType="email-address"
                label="Email address"
                helperText={emailFeedback?.message}
                helperTone={emailFeedback?.tone}
                onChangeText={setEmail}
                placeholder="name@example.com"
                value={email}
              />
              <AuthTextField
                iconName="lock"
                label="Password"
                helperText={passwordFeedback?.message}
                helperTone={passwordFeedback?.tone}
                onChangeText={setPassword}
                placeholder="••••••••••••"
                onRightIconPress={() =>
                  setIsPasswordVisible((value) => !value)
                }
                rightAccessibilityLabel={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                rightIconName={isPasswordVisible ? "eye-off" : "eye"}
                secureTextEntry={!isPasswordVisible}
                value={password}
              />
              {isLogin && forgotPasswordHref ? (
                <Link href={forgotPasswordHref} asChild>
                  <Pressable className="-mt-1 self-end px-2 py-1">
                    <Text className="text-[13px] font-bold leading-5 text-[#ff2056]">
                      {forgotPasswordText}
                    </Text>
                  </Pressable>
                </Link>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isAuthActionDisabled }}
              className={`mt-5 h-14 items-center justify-center rounded-full bg-[#ff2056] ${
                isAuthActionDisabled ? "opacity-50" : "opacity-100"
              }`}
              disabled={isAuthActionDisabled}
              onPress={handlePrimaryPress}
              style={{
                boxShadow: "0 12px 28px -9px rgba(255, 32, 86, 0.7)",
              }}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-[17px] font-bold leading-5 text-white">
                  {buttonText}
                </Text>
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : null}
              </View>
            </Pressable>

            {!isLogin ? <View nativeID="clerk-captcha" /> : null}

            <View className="mt-16">
              <SocialButtons
                disabled={isSocialActionDisabled}
                loadingStrategy={socialStrategy}
                onApplePress={() => void handleSocialPress("oauth_apple")}
                onGooglePress={() => void handleSocialPress("oauth_google")}
              />
            </View>

            <View className="mt-5 items-center">
              <Link href={footerLinkHref} asChild>
                <Pressable className="px-3 py-1">
                  <Text
                    className="text-center text-[13px] leading-5 text-zinc-500"
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    {footerText}{" "}
                    <Text className="font-bold text-[#ff2056]">
                      {footerLinkText}
                    </Text>
                  </Text>
                </Pressable>
              </Link>
              <Text className="mt-2 text-center text-[11px] leading-4 text-zinc-400">
                By continuing, you agree to the{" "}
                <Link href="/legal/terms" asChild>
                  <Text className="font-bold text-[#ff2056]">Terms</Text>
                </Link>{" "}
                and acknowledge the{" "}
                <Link href="/legal/privacy-policy" asChild>
                  <Text className="font-bold text-[#ff2056]">
                    Privacy Policy
                  </Text>
                </Link>
                .
              </Text>
            </View>
          </View>

          <View className="gap-5 pt-5 flex-1 items-center justify-end">
            <View
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/90 px-3"
              style={{ borderCurve: "continuous" }}
            >
              <Feather name="lock" size={12} color="#d4d4d8" />
              <Text
                className="shrink text-center text-[14px] leading-5 text-zinc-400"
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {isLogin
                  ? "Your journal stays private and secure."
                  : "Your entries are private by default."}
              </Text>
            </View>

            <Text
              className="text-center text-[10px] font-semibold uppercase leading-4 text-zinc-300"
              style={{ letterSpacing: 3 }}
            >
              Take a moment.  Breathe.  Begin again.
            </Text>

            {isLogin && showTemporaryOnboardingBackButton ? (
              <Pressable
                accessibilityRole="button"
                className="rounded-full px-4 py-2"
                onPress={handleTemporaryOnboardingBackPress}
              >
                <Text className="text-center text-[14px] font-semibold leading-6 text-[#ff2056]">
                  Back to onboarding
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <VerificationCodeModal
        code={verificationCode}
        description={
          verificationFlow === "login-email-code"
            ? "Enter the 6-digit sign-in verification code sent to your email."
            : undefined
        }
        isLoading={isVerifying}
        onChangeCode={handleVerificationChange}
        onClose={() => {
          setIsVerificationVisible(false);
          setVerificationFlow(null);
        }}
        onResendCode={handleResendVerificationCode}
        visible={isVerificationVisible}
      />
    </LinearGradient>
  );
}

function getSocialProviderLabel(strategy: "oauth_google" | "oauth_apple") {
  return strategy === "oauth_apple" ? "Apple" : "Google";
}

type SocialButtonsProps = {
  disabled: boolean;
  loadingStrategy: "oauth_google" | "oauth_apple" | null;
  onApplePress: () => void;
  onGooglePress: () => void;
};

function SocialButtons({
  disabled,
  loadingStrategy,
  onApplePress,
  onGooglePress,
}: SocialButtonsProps) {
  const isGoogleLoading = loadingStrategy === "oauth_google";
  const isAppleLoading = loadingStrategy === "oauth_apple";

  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isGoogleLoading, disabled }}
        className={`h-10 flex-row items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 ${
          disabled ? "opacity-50" : "opacity-100"
        }`}
        disabled={disabled}
        onPress={onGooglePress}
      >
        <View className="size-5 items-center justify-center">
          {isGoogleLoading ? (
            <ActivityIndicator color="#ff2056" size="small" />
          ) : (
            <Image
              source={images.googleLogo}
              contentFit="contain"
              accessibilityLabel="Google logo"
              style={{ height: 16, width: 16 }}
            />
          )}
        </View>
        <Text className="text-[15px] font-semibold leading-6 text-zinc-950">
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isAppleLoading, disabled }}
        className={`h-10 flex-row items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 ${
          disabled ? "opacity-50" : "opacity-100"
        }`}
        disabled={disabled}
        onPress={onApplePress}
      >
        <View className="size-5 items-center justify-center">
          {isAppleLoading ? (
            <ActivityIndicator color="#ff2056" size="small" />
          ) : (
            <Ionicons name="logo-apple" size={14} color="#18181b" />
          )}
        </View>
        <Text className="text-[15px] font-semibold leading-6 text-zinc-950">
          Continue with Apple
        </Text>
      </Pressable>
    </View>
  );
}

function getNameParts(name: string) {
  const [firstName, ...lastNameParts] = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName,
    lastName: lastNameParts.join(" ") || undefined,
  };
}

function getMissingRequirementsMessage(signUp: {
  missingFields: string[];
}) {
  if (
    signUp.missingFields.includes("first_name") ||
    signUp.missingFields.includes("last_name")
  ) {
    return "Enter your first and last name to finish creating your account.";
  }

  return "Clerk needs one more account detail before continuing.";
}
