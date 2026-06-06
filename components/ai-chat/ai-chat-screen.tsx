import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  aiChatMessages,
  aiChatSuggestions,
  type AiChatMessage,
} from "@/data/ai-chat";

type AiChatScreenProps = {
  avatarUrl?: string;
  firstName?: string | null;
};

export function AiChatScreen({ avatarUrl, firstName }: AiChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [message, setMessage] = useState("");
  const bubbleMaxWidth = Math.floor((width - 48) * 0.8);
  const displayName = firstName?.trim() || "Aryan";

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/reflect-tab");
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <StatusBar hidden />
      <LinearGradient
        colors={["#FBEFF5", "#FAF4F7", "#FAF7F2"]}
        className="absolute inset-0"
        locations={[0, 0.48, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View
        className="flex-row items-center gap-4 px-6 pb-4"
        style={{ paddingTop: Math.max(56, insets.top + 20) }}
      >
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="size-10 items-center justify-center rounded-full bg-white"
          onPress={handleBackPress}
          style={{ boxShadow: "0 3px 10px rgba(39, 39, 42, 0.18)" }}
        >
          <Feather name="chevron-left" size={22} color="#3F3F46" />
        </Pressable>

        <View className="flex-1 flex-row items-center gap-4">
          <AiAvatar size={44} iconSize={21} />
          <View className="flex-1">
            <Text className="text-[18px] font-bold leading-7 text-[#18181B]">
              DearDiary AI ✨
            </Text>
            <Text className="text-[12px] leading-4 text-[#A1A1AA]">
              Your reflection companion
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 rounded-full bg-[#CFF8E6] px-2 py-1">
          <View className="size-2 rounded-full bg-[#10B981]" />
          <Text className="text-[11px] font-bold leading-4 text-[#047857]">
            Online
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 16,
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Text className="rounded-full bg-zinc-100 px-4 py-2 text-[11px] font-semibold leading-4 text-[#A1A1AA]">
            Today · 8:42 PM
          </Text>
        </View>

        <View className="mt-6 gap-6">
          {aiChatMessages.map((chatMessage, index) => (
            <ChatBubble
              avatarUrl={avatarUrl}
              bubbleMaxWidth={bubbleMaxWidth}
              displayName={displayName}
              isFirstAssistant={index === 0}
              key={chatMessage.id}
              message={chatMessage}
            />
          ))}
        </View>

        <View className="mt-8 gap-4">
          <Text className="text-[11px] font-semibold uppercase tracking-normal text-[#A1A1AA]">
            Suggested replies
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {aiChatSuggestions.map((suggestion) => (
              <Pressable
                accessibilityRole="button"
                className="rounded-full border border-zinc-200 bg-white px-4 py-2"
                key={suggestion}
                style={{ boxShadow: "0 1px 3px rgba(39, 39, 42, 0.1)" }}
              >
                <Text className="text-[14px] font-medium leading-5 text-zinc-700">
                  {suggestion}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <LinearGradient
        colors={["rgba(250, 247, 242, 0)", "#FAF7F2"]}
        className="px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-14 flex-1 flex-row items-center gap-2 rounded-full border border-zinc-200 bg-white pl-4 pr-2"
            style={{ boxShadow: "0 3px 10px rgba(39, 39, 42, 0.16)" }}
          >
            <Feather name="smile" size={22} color="#A1A1AA" />
            <TextInput
              className="flex-1 text-[15px] leading-5 text-zinc-700"
              onChangeText={setMessage}
              placeholder="Share your thoughts..."
              placeholderTextColor="#A1A1AA"
              returnKeyType="send"
              value={message}
            />
            <Pressable
              accessibilityLabel="Record voice message"
              accessibilityRole="button"
              className="size-10 items-center justify-center rounded-full bg-zinc-100"
            >
              <Feather name="mic" size={22} color="#71717B" />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Send message"
            accessibilityRole="button"
            className="size-12 items-center justify-center rounded-full bg-[#FF3F75]"
            style={{ boxShadow: "0 8px 16px rgba(255, 32, 86, 0.28)" }}
          >
            <Feather name="send" size={22} color="#FFF1F5" />
          </Pressable>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function ChatBubble({
  avatarUrl,
  bubbleMaxWidth,
  displayName,
  isFirstAssistant,
  message,
}: {
  avatarUrl?: string;
  bubbleMaxWidth: number;
  displayName: string;
  isFirstAssistant: boolean;
  message: AiChatMessage;
}) {
  const isUser = message.role === "user";
  const messageText =
    isFirstAssistant && message.role === "assistant"
      ? `Hi ${displayName} 🌸 ${message.text}`
      : message.text;

  if (isUser) {
    return (
      <View className="items-end">
        <View className="mb-2 flex-row items-center justify-end gap-2">
          <Text className="text-[11px] font-bold leading-5 text-[#A1A1AA]">
            {displayName}
          </Text>
          <UserAvatar
            avatarUrl={avatarUrl}
            fallbackInitial={displayName.charAt(0)}
            size={28}
          />
        </View>
        <View
          className="overflow-hidden rounded-bl-[24px] rounded-br-[24px] rounded-tl-[24px] rounded-tr-lg px-4 pb-5 pt-[18px]"
          style={{
            boxShadow: "0 8px 16px rgba(255, 32, 86, 0.2)",
            width: bubbleMaxWidth,
          }}
        >
          <LinearGradient
            colors={["#FF5C87", "#FF2056"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text
            allowFontScaling={false}
            className="w-full shrink pb-0.5 text-[15px] leading-[25px] text-rose-50"
          >
            {messageText}
          </Text>
        </View>
        {message.time ? (
          <Text className="mt-2 pr-1 text-[11px] font-medium leading-5 text-[#A1A1AA]">
            {message.time}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="items-start">
      <View className="mb-2 flex-row items-center gap-2">
        <AiAvatar size={28} iconSize={16} />
        <Text className="text-[11px] font-bold leading-5 text-[#A1A1AA]">
          DearDiary AI
        </Text>
      </View>
      <View
        className="rounded-bl-[24px] rounded-br-[24px] rounded-tl-lg rounded-tr-[24px] px-4 pb-5 pt-[18px]"
        style={{
          backgroundColor: message.backgroundColor,
          boxShadow: "0 3px 8px rgba(39, 39, 42, 0.12)",
          width: bubbleMaxWidth,
        }}
      >
        <Text
          allowFontScaling={false}
          className="w-full shrink pb-0.5 text-[15px] leading-[25px] text-[#51515B]"
        >
          {messageText}
        </Text>
      </View>
    </View>
  );
}

function UserAvatar({
  avatarUrl,
  fallbackInitial,
  size,
}: {
  avatarUrl?: string;
  fallbackInitial: string;
  size: number;
}) {
  return (
    <View
      className="shrink-0 items-center justify-center overflow-hidden bg-[#FFDDE8]"
      style={{
        borderRadius: size / 2,
        height: size,
        width: size,
      }}
    >
      {avatarUrl ? (
        <Image
          accessibilityLabel="Your profile photo"
          className="size-full"
          contentFit="cover"
          source={{ uri: avatarUrl }}
        />
      ) : (
        <Text className="text-[12px] font-bold leading-5 text-[#FF2056]">
          {fallbackInitial.toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function AiAvatar({ iconSize, size }: { iconSize: number; size: number }) {
  return (
    <LinearGradient
      colors={["#FF5C87", "#FF2056"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="shrink-0 items-center justify-center rounded-full"
      style={{
        height: size,
        width: size,
        boxShadow: "0 7px 14px rgba(255, 32, 86, 0.24)",
        borderRadius: size / 2,
      }}
    >
      <Sparkles size={iconSize} color="#FFF1F5" strokeWidth={2.2} />
    </LinearGradient>
  );
}
