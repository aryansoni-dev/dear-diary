import { useAuth, useSignIn } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

const loginHref = "/login" as Href;

export function ResetPasswordScreen() {
  const { height, width } = useWindowDimensions();
  const isCompact = height < 720;
  const horizontalPadding = 24;
  const topPadding = isCompact ? 34 : 52;
  const bottomPadding = isCompact ? 18 : 24;
  const contentWidth = Math.min(width - horizontalPadding * 2, 384);
  const contentMinHeight = height - topPadding - bottomPadding;
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationVisible, setIsVerificationVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPasswordStep, setIsPasswordStep] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { fetchStatus, signIn } = useSignIn();
  const isClerkReady = isAuthLoaded && fetchStatus !== "fetching";
  const emailFeedback = getEmailFeedback(email);
  const passwordFeedback = getPasswordFeedback(newPassword, false);
  const confirmPasswordFeedback = getConfirmPasswordFeedback(
    confirmPassword,
    newPassword,
  );

  useEffect(() => {
    if (isSignedIn) {
      router.replace(homeHref);
    }
  }, [isSignedIn]);

  async function handlePrimaryPress() {
    if (!isClerkReady || isSubmitting) {
      return;
    }

    if (isPasswordStep) {
      await handleResetPassword();
      return;
    }

    await handleGetCode();
  }

  async function handleGetCode() {
    if (!email.trim()) {
      showAuthError("Enter your email address to receive a reset code.");
      return;
    }

    if (emailFeedback?.tone === "error") {
      showAuthError(emailFeedback.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const createResult = await signIn.create({ identifier: email.trim() });
      if (createResult.error) {
        showAuthError(getClerkErrorMessage(createResult.error));
        return;
      }

      const codeResult = await signIn.resetPasswordEmailCode.sendCode();
      if (codeResult.error) {
        showAuthError(getClerkErrorMessage(codeResult.error));
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
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });

      if (error) {
        showAuthError(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "needs_new_password") {
        setIsPasswordStep(true);
        setIsVerificationVisible(false);
        return;
      }

      showAuthError("Clerk needs a new password to finish this reset.");
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendVerificationCode() {
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();

      if (error) {
        showAuthError(getClerkErrorMessage(error));
        return;
      }

      setVerificationCode("");
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
    }
  }

  async function handleResetPassword() {
    if (!newPassword || !confirmPassword) {
      showAuthError("Enter and confirm your new password to continue.");
      return;
    }

    if (passwordFeedback?.tone === "error") {
      showAuthError(passwordFeedback.message);
      return;
    }

    if (confirmPasswordFeedback?.tone === "error") {
      showAuthError(confirmPasswordFeedback.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });

      if (error) {
        showAuthError(getClerkErrorMessage(error));
        return;
      }

      if (signIn.status === "complete") {
        await finalizeAuth(signIn);
        return;
      }

      showAuthError(
        "Password reset needs one more Clerk step before opening.",
      );
    } catch (error) {
      showAuthError(getClerkErrorMessage(error));
    } finally {
      setIsSubmitting(false);
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
              Reset password
            </Text>
            <Text className="h-10 max-w-[340px] text-center text-[14px] leading-5 text-zinc-500">
              Enter your email and we will send a reset code.
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

              {isPasswordStep ? (
                <>
                  <AuthTextField
                    iconName="lock"
                    label="New password"
                    helperText={passwordFeedback?.message}
                    helperTone={passwordFeedback?.tone}
                    onChangeText={setNewPassword}
                    placeholder="••••••••••••"
                    onRightIconPress={() =>
                      setIsNewPasswordVisible((value) => !value)
                    }
                    rightAccessibilityLabel={
                      isNewPasswordVisible
                        ? "Hide new password"
                        : "Show new password"
                    }
                    rightIconName={isNewPasswordVisible ? "eye-off" : "eye"}
                    secureTextEntry={!isNewPasswordVisible}
                    value={newPassword}
                  />
                  <AuthTextField
                    iconName="lock"
                    label="Confirm new password"
                    helperText={confirmPasswordFeedback?.message}
                    helperTone={confirmPasswordFeedback?.tone}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••••••"
                    onRightIconPress={() =>
                      setIsConfirmPasswordVisible((value) => !value)
                    }
                    rightAccessibilityLabel={
                      isConfirmPasswordVisible
                        ? "Hide confirmed password"
                        : "Show confirmed password"
                    }
                    rightIconName={
                      isConfirmPasswordVisible ? "eye-off" : "eye"
                    }
                    secureTextEntry={!isConfirmPasswordVisible}
                    value={confirmPassword}
                  />
                </>
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
              <View className="flex-row items-center justify-center gap-2">
                <Text className="text-[17px] font-bold leading-5 text-white">
                  {isPasswordStep ? "Reset Password" : "Get code"}
                </Text>
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : null}
              </View>
            </Pressable>

            <View className="mt-8 items-center">
              <Link href={loginHref} asChild>
                <Pressable className="px-3 py-1">
                  <Text
                    className="text-center text-[13px] leading-5 text-zinc-500"
                    adjustsFontSizeToFit
                    numberOfLines={1}
                  >
                    Remembered it?{"  "}
                    <Text className="font-bold text-[#ff2056]">Log In</Text>
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
                Your journal stays private and secure.
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
        description="Enter the 6-digit password reset code sent to your email."
        isLoading={isVerifying}
        onChangeCode={handleVerificationChange}
        onClose={() => setIsVerificationVisible(false)}
        onResendCode={handleResendVerificationCode}
        title="Check your email"
        visible={isVerificationVisible}
      />
    </LinearGradient>
  );
}

function getConfirmPasswordFeedback(
  confirmPassword: string,
  newPassword: string,
) {
  if (!confirmPassword) {
    return undefined;
  }

  if (confirmPassword !== newPassword) {
    return {
      message: "Passwords do not match yet.",
      tone: "error" as const,
    };
  }

  return {
    message: "Passwords match.",
    tone: "success" as const,
  };
}
