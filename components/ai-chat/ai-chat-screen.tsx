import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputContentSizeChangeEvent,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { aiChatSuggestions } from "@/data/ai-chat";
import { generateLocalJournalResponse } from "@/lib/ai/localJournalAssistant";
import { useJournalStore } from "@/store/journal-store";
import { useChatStore } from "@/store/useChatStore";
import type { ChatMessage } from "@/types/chat";

type AiChatScreenProps = {
  avatarUrl?: string;
  firstName?: string | null;
  userId?: string;
};

const createChatMessageId = () =>
  `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const minComposerTextHeight = 24;
const maxComposerTextHeight = 104;

export function AiChatScreen({
  avatarUrl,
  firstName,
  userId,
}: AiChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [composerTextHeight, setComposerTextHeight] = useState(
    minComposerTextHeight,
  );
  const [isThinking, setIsThinking] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const journalEntries = useJournalStore((state) => state.entries);
  const chatMessages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearMessagesForUser = useChatStore(
    (state) => state.clearMessagesForUser,
  );
  const bubbleMaxWidth = Math.floor((width - 48) * 0.8);
  const displayName = firstName?.trim() || "there";
  const currentUserEntries = useMemo(() => {
    if (!userId) {
      return [];
    }

    return journalEntries.filter((entry) => entry.userId === userId);
  }, [journalEntries, userId]);
  const currentUserMessages = useMemo(() => {
    if (!userId) {
      return [];
    }

    return chatMessages
      .filter((chatMessage) => chatMessage.userId === userId)
      .sort(
        (messageA, messageB) =>
          new Date(messageA.createdAt).getTime() -
          new Date(messageB.createdAt).getTime(),
      );
  }, [chatMessages, userId]);
  const visibleMessages =
    currentUserMessages.length > 0
      ? currentUserMessages
      : [
          {
            content: "I'm here to sit with you for a moment. No rush, no judgment.",
            createdAt: new Date().toISOString(),
            id: "welcome",
            role: "assistant",
            userId: userId ?? "guest",
          } satisfies ChatMessage,
        ];
  const canSendMessage = message.trim().length > 0 && !!userId && !isThinking;
  const shouldUseKeyboardOffset = process.env.EXPO_OS === "android";
  const footerKeyboardOffset = shouldUseKeyboardOffset ? keyboardOffset : 0;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldUseKeyboardOffset) {
      return;
    }

    const keyboardDidShowSubscription = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardOffset(
          Math.max(0, event.endCoordinates.height - insets.bottom),
        );
      },
    );
    const keyboardDidHideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardOffset(0),
    );

    return () => {
      keyboardDidShowSubscription.remove();
      keyboardDidHideSubscription.remove();
    };
  }, [insets.bottom, shouldUseKeyboardOffset]);

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/reflect-tab");
  }

  function handleClearChat() {
    if (!userId) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsThinking(false);
    clearMessagesForUser(userId);
  }

  function handleMessageChange(nextMessage: string) {
    setMessage(nextMessage);

    if (!nextMessage) {
      setComposerTextHeight(minComposerTextHeight);
    }
  }

  function handleComposerContentSizeChange(
    event: TextInputContentSizeChangeEvent,
  ) {
    const nextHeight = Math.ceil(event.nativeEvent.contentSize.height);

    setComposerTextHeight(
      Math.min(maxComposerTextHeight, Math.max(minComposerTextHeight, nextHeight)),
    );
  }

  function handleSendMessage(nextMessage = message) {
    const trimmedMessage = nextMessage.trim();

    if (!trimmedMessage || !userId || isThinking) {
      return;
    }

    const userMessage: ChatMessage = {
      content: trimmedMessage,
      createdAt: new Date().toISOString(),
      id: createChatMessageId(),
      role: "user",
      userId,
    };

    addMessage(userMessage);
    setMessage("");
    setComposerTextHeight(minComposerTextHeight);
    setIsThinking(true);

    timeoutRef.current = setTimeout(() => {
      const localResponse = generateLocalJournalResponse({
        entries: currentUserEntries,
        message: trimmedMessage,
      });

      addMessage({
        content: localResponse.response,
        createdAt: new Date().toISOString(),
        id: createChatMessageId(),
        relatedEntryIds: localResponse.relatedEntryIds,
        role: "assistant",
        userId,
      });
      setIsThinking(false);
      timeoutRef.current = null;
    }, 400);
  }

  return (
    <KeyboardAvoidingView
      behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={0}
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
          paddingBottom: 16 + footerKeyboardOffset,
          paddingHorizontal: 24,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center gap-3">
          <Text className="rounded-full bg-zinc-100 px-4 py-2 text-[11px] font-semibold leading-4 text-[#A1A1AA]">
            Today
          </Text>
          {currentUserMessages.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear chat"
              accessibilityRole="button"
              className="rounded-full bg-white px-4 py-2"
              onPress={handleClearChat}
              style={{ boxShadow: "0 1px 3px rgba(39, 39, 42, 0.1)" }}
            >
              <Text className="text-[11px] font-bold leading-4 text-[#FF2056]">
                Clear chat
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View className="mt-6 gap-6">
          {visibleMessages.map((chatMessage, index) => (
            <ChatBubble
              avatarUrl={avatarUrl}
              bubbleMaxWidth={bubbleMaxWidth}
              displayName={displayName}
              isFirstAssistant={index === 0}
              key={chatMessage.id}
              message={chatMessage}
            />
          ))}
          {isThinking ? (
            <View className="items-start">
              <View className="mb-2 flex-row items-center gap-2">
                <AiAvatar size={28} iconSize={16} />
                <Text className="text-[11px] font-bold leading-5 text-[#A1A1AA]">
                  DearDiary AI
                </Text>
              </View>
              <View
                className="rounded-bl-[24px] rounded-br-[24px] rounded-tl-lg rounded-tr-[24px] bg-white px-4 pb-5 pt-[18px]"
                style={{
                  boxShadow: "0 3px 8px rgba(39, 39, 42, 0.12)",
                  maxWidth: bubbleMaxWidth,
                }}
              >
                <Text className="text-[15px] leading-[25px] text-[#71717B]">
                  Thinking...
                </Text>
              </View>
            </View>
          ) : null}
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
                onPress={() => handleSendMessage(suggestion)}
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
        style={{
          paddingBottom: Math.max(insets.bottom, 24),
          transform: [{ translateY: -footerKeyboardOffset }],
        }}
      >
        <View className="flex-row items-end gap-3">
          <View
            className="flex-1 flex-row items-end gap-2 rounded-[28px] border border-zinc-200 bg-white py-2 pl-4 pr-2"
            style={{
              boxShadow: "0 3px 10px rgba(39, 39, 42, 0.16)",
              minHeight: 56,
            }}
          >
            <View className="h-10 justify-center">
              <Feather name="smile" size={22} color="#A1A1AA" />
            </View>
            <TextInput
              className="flex-1 text-[15px] leading-5 text-zinc-700"
              multiline
              onChangeText={handleMessageChange}
              onContentSizeChange={handleComposerContentSizeChange}
              placeholder="Share your thoughts..."
              placeholderTextColor="#A1A1AA"
              returnKeyType="send"
              scrollEnabled={composerTextHeight >= maxComposerTextHeight}
              style={{
                height: composerTextHeight,
                paddingBottom: 0,
                paddingTop: 0,
                textAlignVertical: "top",
              }}
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
            disabled={!canSendMessage}
            onPress={() => handleSendMessage()}
            style={{
              boxShadow: "0 8px 16px rgba(255, 32, 86, 0.28)",
              opacity: canSendMessage ? 1 : 0.55,
            }}
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
  message: ChatMessage;
}) {
  const isUser = message.role === "user";
  const messageText =
    isFirstAssistant && message.role === "assistant"
      ? `Hi ${displayName} 🌸 ${message.content}`
      : message.content;
  const bubbleWidth = getBubbleWidth(messageText, bubbleMaxWidth);
  const textWidth = bubbleWidth - 32;
  const messageTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

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
            alignSelf: "flex-end",
            boxShadow: "0 8px 16px rgba(255, 32, 86, 0.2)",
            width: bubbleWidth,
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
            className="pb-0.5 text-[15px] leading-[25px] text-rose-50"
            style={{ flexWrap: "wrap", width: textWidth }}
          >
            {messageText}
          </Text>
        </View>
        <Text className="mt-2 pr-1 text-[11px] font-medium leading-5 text-[#A1A1AA]">
          {messageTime}
        </Text>
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
          alignSelf: "flex-start",
          backgroundColor: getAssistantBubbleColor(message.id),
          boxShadow: "0 3px 8px rgba(39, 39, 42, 0.12)",
          width: bubbleWidth,
        }}
      >
        <Text
          allowFontScaling={false}
          className="pb-0.5 text-[15px] leading-[25px] text-[#51515B]"
          style={{ flexWrap: "wrap", width: textWidth }}
        >
          {messageText}
        </Text>
      </View>
    </View>
  );
}

function getBubbleWidth(message: string, maxWidth: number) {
  const estimatedTextWidth = message.length * 8.5 + 36;

  return Math.min(maxWidth, Math.max(80, estimatedTextWidth));
}

function getAssistantBubbleColor(messageId: string) {
  if (messageId === "welcome") {
    return "#F1EBFA";
  }

  return "#FCE7EF";
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
  const [didImageFail, setDidImageFail] = useState(false);
  const safeAvatarUrl = avatarUrl?.trim();
  const shouldShowImage = !!safeAvatarUrl && !didImageFail;

  return (
    <View
      className="shrink-0 items-center justify-center overflow-hidden bg-[#FFDDE8]"
      style={{
        borderRadius: size / 2,
        height: size,
        width: size,
      }}
    >
      {shouldShowImage ? (
        <Image
          accessibilityLabel="Your profile photo"
          contentFit="cover"
          onError={() => setDidImageFail(true)}
          source={{ uri: safeAvatarUrl }}
          style={{ height: size, width: size }}
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
