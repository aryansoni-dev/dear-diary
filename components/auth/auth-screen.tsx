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
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { images } from "@/constants/images";

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
};

const ssoRedirectUrl = AuthSession.makeRedirectUri({ path: "sso" });

export function AuthScreen({
  buttonText,
  forgotPasswordHref,
  forgotPasswordText = "Forgot passwd?",
  footerLinkHref,
  footerLinkText,
  footerText,
  heading,
  mode = "signup",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [socialStrategy, setSocialStrategy] = useState<
    "oauth_google" | "oauth_apple" | null
  >(null);
  const isLogin = mode === "login";
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { fetchStatus: signInFetchStatus, signIn } = useSignIn();
  const { fetchStatus: signUpFetchStatus, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const isFetching =
    signInFetchStatus === "fetching" || signUpFetchStatus === "fetching";
  const isClerkReady = isAuthLoaded && !isFetching;
  const emailFeedback = getEmailFeedback(email);
  const passwordFeedback = getPasswordFeedback(password, isLogin);

  useEffect(() => {
    if (isSignedIn) {
      router.replace(homeHref);
    }
  }, [isSignedIn]);

  async function handlePrimaryPress() {
    if (!isClerkReady || isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      showAuthError("Enter your email address and password to continue.");
      return;
    }

    if (emailFeedback?.tone === "error") {
      showAuthError(emailFeedback.message);
      return;
    }

    if (!isLogin && getNameParts(fullName).lastName === undefined) {
      showAuthError("Enter your first and last name to continue.");
      return;
    }

    if (!isLogin && passwordFeedback?.tone === "error") {
      showAuthError(passwordFeedback.message);
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
          showAuthError(getClerkErrorMessage(error));
          return;
        }

        if (signIn.status === "complete") {
          await finalizeAuth(signIn);
          return;
        }

        showAuthError("This account needs another verification step.");
      } catch (error) {
        showAuthError(getClerkErrorMessage(error));
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
        showAuthError(getClerkErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeAuth(signUp);
        return;
      }

      const emailCodeResult = await signUp.verifications.sendEmailCode();
      if (emailCodeResult.error) {
        showAuthError(getClerkErrorMessage(emailCodeResult.error));
        return;
      }

      setVerificationCode("");
      setIsVerificationVisible(true);
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
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

    setIsVerifying(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });

      if (error) {
        showAuthError(getClerkErrorMessage(error));
        return;
      }

      if (signUp.status === "complete") {
        await finalizeAuth(signUp);
        setIsVerificationVisible(false);
        return;
      }

      showAuthError(getMissingRequirementsMessage(signUp));
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendVerificationCode() {
    try {
      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        showAuthError(getClerkErrorMessage(error));
        return;
      }

      setVerificationCode("");
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
    }
  }

  async function handleSocialPress(strategy: "oauth_google" | "oauth_apple") {
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

      showAuthError("Google signup needs one more step before continuing.");
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
    } finally {
      setSocialStrategy(null);
    }
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
                    <Text className="text-[12px] font-bold leading-5 text-[#ff2056]">
                      {forgotPasswordText}
                    </Text>
                  </Pressable>
                </Link>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-5 h-14 items-center justify-center rounded-full bg-[#ff2056]"
              disabled={!isClerkReady || isSubmitting}
              onPress={handlePrimaryPress}
              style={{
                boxShadow: "0 12px 28px -9px rgba(255, 32, 86, 0.7)",
              }}
            >
              <Text className="text-[14px] font-bold leading-5 text-white">
                {buttonText}
              </Text>
            </Pressable>

            {!isLogin ? <View nativeID="clerk-captcha" /> : null}

            <View className="mt-16">
              <SocialButtons
                disabled={!isClerkReady || socialStrategy !== null}
                onApplePress={() => void handleSocialPress("oauth_apple")}
                onGooglePress={() => void handleSocialPress("oauth_google")}
              />
            </View>

            <View className="mt-5 items-center">
              <Link href={footerLinkHref} asChild>
                <Pressable className="px-3 py-1">
                  <Text
                    className="text-center text-[12px] leading-5 text-zinc-500"
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
            </View>
          </View>

          <View className="gap-5 pt-5 flex-1 items-center justify-end">
            <View
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/90 px-3"
              style={{ borderCurve: "continuous" }}
            >
              <Feather name="lock" size={12} color="#d4d4d8" />
              <Text
                className="shrink text-center text-base leading-5 text-zinc-400"
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
          </View>
        </View>
      </ScrollView>

      <VerificationCodeModal
        code={verificationCode}
        onChangeCode={handleVerificationChange}
        onClose={() => setIsVerificationVisible(false)}
        onResendCode={handleResendVerificationCode}
        visible={isVerificationVisible}
      />
    </LinearGradient>
  );
}

type SocialButtonsProps = {
  disabled: boolean;
  onApplePress: () => void;
  onGooglePress: () => void;
};

function SocialButtons({
  disabled,
  onApplePress,
  onGooglePress,
}: SocialButtonsProps) {
  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        className="h-10 flex-row items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50"
        disabled={disabled}
        onPress={onGooglePress}
      >
        <Image
          source={images.googleLogo}
          contentFit="contain"
          accessibilityLabel="Google logo"
          style={{ height: 16, width: 16 }}
        />
        <Text className="text-[13px] font-semibold leading-5 text-zinc-950">
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        className="h-10 flex-row items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50"
        disabled={disabled}
        onPress={onApplePress}
      >
        <Ionicons name="logo-apple" size={14} color="#18181b" />
        <Text className="text-[13px] font-semibold leading-5 text-zinc-950">
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
