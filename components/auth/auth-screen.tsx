import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import type { Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { images } from "@/constants/images";

import { AuthTextField } from "./auth-text-field";
import { VerificationCodeModal } from "./verification-code-modal";

type AuthScreenProps = {
  buttonText: string;
  footerLinkHref: Href;
  footerLinkText: string;
  footerText: string;
  heading: string;
  mode?: "login" | "signup";
  subheading: string;
};

export function AuthScreen({
  buttonText,
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
  const isLogin = mode === "login";

  function handlePrimaryPress() {
    if (isLogin) {
      router.replace("/");
      return;
    }

    setVerificationCode("");
    setIsVerificationVisible(true);
  }

  function handleVerificationChange(value: string) {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(nextCode);

    if (nextCode.length === 6) {
      setIsVerificationVisible(false);
      router.replace("/");
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
                onChangeText={setEmail}
                placeholder="name@example.com"
                value={email}
              />
              <AuthTextField
                iconName="lock"
                label="Password"
                onChangeText={setPassword}
                placeholder="••••••••••••"
                rightIconName="eye"
                secureTextEntry
                value={password}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              className="mt-5 h-14 items-center justify-center rounded-full bg-[#ff2056]"
              onPress={handlePrimaryPress}
              style={{
                boxShadow: "0 12px 28px -9px rgba(255, 32, 86, 0.7)",
              }}
            >
              <Text className="text-[14px] font-bold leading-5 text-white">
                {buttonText}
              </Text>
            </Pressable>

            <View className="mt-16">
              <SocialButtons />
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
                    <Text className="font-bold text-zinc-950">
                      {footerLinkText}
                    </Text>
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>

          <View className="gap-5 pt-5">
            <View
              className="h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white/90 px-3"
              style={{ borderCurve: "continuous" }}
            >
              <Feather name="lock" size={12} color="#d4d4d8" />
              <Text
                className="shrink text-center text-[12px] leading-5 text-zinc-400"
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
        visible={isVerificationVisible}
      />
    </LinearGradient>
  );
}

function SocialButtons() {
  return (
    <View className="gap-3">
      <Pressable
        accessibilityRole="button"
        className="h-10 flex-row items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50"
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
      >
        <Ionicons name="logo-apple" size={14} color="#18181b" />
        <Text className="text-[13px] font-semibold leading-5 text-zinc-950">
          Continue with Apple
        </Text>
      </Pressable>
    </View>
  );
}
