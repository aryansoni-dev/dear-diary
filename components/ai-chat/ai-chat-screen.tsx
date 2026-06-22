import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputContentSizeChangeEvent,
  type TextStyle,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { CONNECTION_STATE_COLORS } from "@/constants/theme";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useDelayedVisibility } from "@/hooks/useDelayedVisibility";
import { generateLocalJournalResponse } from "@/lib/ai/localJournalAssistant";
import { generateRemoteJournalResponse } from "@/lib/ai/remoteJournalAssistant";
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
const chatHorizontalPadding = 24;
const minComposerTextHeight = 24;
const maxComposerTextHeight = 104;
const quickEmojis = ["😊", "🥹", "❤️", "✨", "🌸", "🙏", "😌", "😂", "🔥", "🫶"];
const chatMessageTextStyle = {
  flexShrink: 1,
  flexWrap: "wrap",
  includeFontPadding: true,
  overflow: "visible",
  paddingBottom: 8,
  paddingTop: 3,
} as const;
const assistantMessageTextStyle = {
  flexShrink: 1,
  flexWrap: "wrap",
  includeFontPadding: true,
  overflow: "visible",
  paddingBottom: 8,
  paddingRight: 3,
  paddingTop: 3,
} as const;

export function AiChatScreen({
  avatarUrl,
  firstName,
  userId,
}: AiChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { showDialog } = useAppDialog();
  const connectivity = useConnectivity();
  const requestIdRef = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [message, setMessage] = useState("");
  const [composerTextHeight, setComposerTextHeight] = useState(
    minComposerTextHeight,
  );
  const [isThinking, setIsThinking] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const journalEntries = useJournalStore((state) => state.entries);
  const chatMessages = useChatStore((state) => state.messages);
  const chatHasHydrated = useChatStore((state) => state.hasHydrated);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearMessagesForUser = useChatStore(
    (state) => state.clearMessagesForUser,
  );
  const chatContentWidth = Math.max(0, width - chatHorizontalPadding * 2);
  const assistantBubbleMaxWidth = Math.floor(chatContentWidth);
  const userBubbleMaxWidth = Math.floor(chatContentWidth * 0.75);
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
  const showChatHydrationState = useDelayedVisibility(!chatHasHydrated);
  const visibleMessages =
    chatHasHydrated && currentUserMessages.length > 0
      ? currentUserMessages
      : chatHasHydrated
        ? [
          {
            content: "I'm here to sit with you for a moment. No rush, no judgment.",
            createdAt: new Date().toISOString(),
            id: "welcome",
            role: "assistant",
            userId: userId ?? "guest",
          } satisfies ChatMessage,
        ]
        : [];
  const isOffline = connectivity.status === "offline";
  const connectionStateColors = isOffline
    ? CONNECTION_STATE_COLORS.offline
    : CONNECTION_STATE_COLORS.online;
  const canSendMessage =
    message.trim().length > 0 &&
    !!userId &&
    chatHasHydrated &&
    !isThinking &&
    !isOffline;
  const shouldUseKeyboardOffset = process.env.EXPO_OS === "android";
  const footerKeyboardOffset = shouldUseKeyboardOffset ? keyboardOffset : 0;

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
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

  function clearChat() {
    if (!userId) {
      return;
    }

    requestIdRef.current += 1;
    setIsThinking(false);
    clearMessagesForUser(userId);
  }

  function handleClearChatPress() {
    showDialog({
      cancelText: "Keep chat",
      confirmText: "Clear chat",
      message: "This will remove the current conversation from this device.",
      onConfirm: clearChat,
      showCancel: true,
      title: "Clear this chat?",
      variant: "destructive",
    });
  }

  function handleMessageChange(nextMessage: string) {
    setMessage(nextMessage);

    if (!nextMessage) {
      setComposerTextHeight(minComposerTextHeight);
    }
  }

  function handleEmojiPress(emoji: string) {
    setMessage((currentMessage) => `${currentMessage}${emoji}`);
  }

  function handleComposerContentSizeChange(
    event: TextInputContentSizeChangeEvent,
  ) {
    const nextHeight = Math.ceil(event.nativeEvent.contentSize.height);

    setComposerTextHeight(
      Math.min(maxComposerTextHeight, Math.max(minComposerTextHeight, nextHeight)),
    );
  }

  async function handleSendMessage(nextMessage = message) {
    const trimmedMessage = nextMessage.trim();

    if (!trimmedMessage || !userId || isThinking) {
      return;
    }

    if (isOffline) {
      showDialog({
        confirmText: "OK",
        message:
          "Internet is required for AI Chat. Your journal entries are still available offline.",
        title: "Internet required",
      });
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
    setIsEmojiPickerVisible(false);
    setIsThinking(true);
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const resolvedDateTimeOptions = Intl.DateTimeFormat().resolvedOptions();
    const clientContext = {
      currentDateTimeISO: new Date().toISOString(),
      locale: resolvedDateTimeOptions.locale || "en-IN",
      timezone: resolvedDateTimeOptions.timeZone,
    };
    const recentMessages = currentUserMessages.slice(-10).map((chatMessage) => ({
      content: chatMessage.content,
      relatedEntryIds: chatMessage.relatedEntryIds,
      role: chatMessage.role,
    }));

    try {
      const remoteResponse = await generateRemoteJournalResponse({
        clientContext,
        message: trimmedMessage,
        recentMessages,
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      if (__DEV__) {
        console.info("AI response source:", remoteResponse.source);
      }

      addMessage({
        content: remoteResponse.message,
        createdAt: new Date().toISOString(),
        id: createChatMessageId(),
        relatedEntryIds: remoteResponse.relatedEntryIds,
        role: "assistant",
        source: remoteResponse.source,
        userId,
      });
    } catch {
      const localResponse = generateLocalJournalResponse({
        clientContext,
        entries: currentUserEntries,
        message: trimmedMessage,
        recentMessages,
      });

      if (requestIdRef.current !== requestId) {
        return;
      }

      if (__DEV__) {
        console.info("AI response source: local_fallback");
      }

      addMessage({
        content: localResponse.response,
        createdAt: new Date().toISOString(),
        id: createChatMessageId(),
        relatedEntryIds: localResponse.relatedEntryIds,
        role: "assistant",
        source: "local_fallback",
        userId,
      });
    } finally {
      if (requestIdRef.current === requestId) {
        setIsThinking(false);
      }
    }
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
        <AnimatedIconButton
          accessibilityLabel="Go back"
          onPress={handleBackPress}
          shadow="0 3px 10px rgba(39, 39, 42, 0.18)"
        >
          <Feather name="chevron-left" size={22} color="#3F3F46" />
        </AnimatedIconButton>

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

        <View className="flex-row items-center gap-2">
          <View
            className="flex-row items-center gap-2 rounded-full px-2 py-1"
            style={{ backgroundColor: connectionStateColors.background }}
          >
            <View
              className="size-2 rounded-full"
              style={{ backgroundColor: connectionStateColors.dot }}
            />
            <Text
              className="text-[11px] font-bold leading-4"
              style={{ color: connectionStateColors.text }}
            >
              {isOffline ? "Offline" : "Online"}
            </Text>
          </View>

          {currentUserMessages.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear chat"
              accessibilityRole="button"
              className="size-8 items-center justify-center rounded-full bg-white"
              onPress={handleClearChatPress}
              style={{ boxShadow: "0 1px 3px rgba(39, 39, 42, 0.1)" }}
            >
              <Feather name="trash-2" size={15} color="#FF2056" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 32 + footerKeyboardOffset,
          paddingHorizontal: chatHorizontalPadding,
          paddingTop: 16,
        }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <Text className="rounded-full bg-zinc-100 px-4 py-2 text-[11px] font-semibold leading-4 text-[#A1A1AA]">
            Today
          </Text>
        </View>

        <View className="mt-6 gap-6">
          {isOffline ? (
            <View className="rounded-[20px] bg-offline-surface px-4 py-3">
              <Text className="text-[14px] font-semibold leading-6 text-offline-text">
                Internet is required for AI Chat. Your journal entries are still
                available offline.
              </Text>
            </View>
          ) : null}
          {!chatHasHydrated && showChatHydrationState ? (
            <View className="rounded-[20px] bg-white px-4 py-4">
              <Text className="text-[14px] font-semibold leading-6 text-[#71717B]">
                Preparing your conversation...
              </Text>
            </View>
          ) : null}
          {visibleMessages.map((chatMessage, index) => (
            <ChatBubble
              assistantBubbleMaxWidth={assistantBubbleMaxWidth}
              avatarUrl={avatarUrl}
              displayName={displayName}
              isFirstAssistant={index === 0}
              key={chatMessage.id}
              message={chatMessage}
              userBubbleMaxWidth={userBubbleMaxWidth}
            />
          ))}
          {isThinking ? (
            <View className="items-start">
              <View className="mb-1 flex-row items-center gap-2">
                <AiAvatar size={28} iconSize={16} />
                <Text className="text-[11px] font-bold leading-5 text-[#A1A1AA]">
                  DearDiary AI
                </Text>
              </View>
              <ThinkingText />
            </View>
          ) : null}
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
        {isEmojiPickerVisible ? (
          <ScrollView
            className="mb-3"
            contentContainerStyle={{ gap: 8, paddingRight: 4 }}
            horizontal
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
          >
            {quickEmojis.map((emoji) => (
              <Pressable
                accessibilityLabel={`Insert ${emoji}`}
                accessibilityRole="button"
                className="size-10 items-center justify-center rounded-full bg-white"
                key={emoji}
                onPress={() => handleEmojiPress(emoji)}
                style={{ boxShadow: "0 2px 7px rgba(39, 39, 42, 0.12)" }}
              >
                <Text className="text-[21px] leading-7">{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View className="flex-row items-end gap-3">
          <View
            className="flex-1 flex-row items-end gap-2 rounded-[28px] border border-zinc-200 bg-white py-2 pl-4 pr-2"
            style={{
              boxShadow: "0 3px 10px rgba(39, 39, 42, 0.16)",
              minHeight: 56,
            }}
          >
            <Pressable
              accessibilityLabel="Toggle emojis"
              accessibilityRole="button"
              className="h-10 justify-center"
              hitSlop={8}
              onPress={() =>
                setIsEmojiPickerVisible((isVisible) => !isVisible)
              }
            >
              <Feather name="smile" size={22} color="#A1A1AA" />
            </Pressable>
            <TextInput
              className="flex-1 text-[15px] leading-5 text-zinc-700 mb-1"
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

function ThinkingText() {
  const opacity = useRef(new Animated.Value(0.42)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacity, {
            duration: 620,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            duration: 620,
            toValue: -1.5,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            duration: 620,
            toValue: 0.42,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            duration: 620,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity, translateY]);

  return (
    <Animated.Text
      className="pl-10 text-[15px] font-semibold leading-5 text-[#71717B]"
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      Thinking...
    </Animated.Text>
  );
}

function ChatBubble({
  assistantBubbleMaxWidth,
  avatarUrl,
  displayName,
  isFirstAssistant,
  message,
  userBubbleMaxWidth,
}: {
  assistantBubbleMaxWidth: number;
  avatarUrl?: string;
  displayName: string;
  isFirstAssistant: boolean;
  message: ChatMessage;
  userBubbleMaxWidth: number;
}) {
  const isUser = message.role === "user";
  const messageText =
    isFirstAssistant && message.role === "assistant"
      ? `Hi ${displayName} 🌸 ${message.content}`
      : message.content;
  const messageTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(message.createdAt));
  const assistantBubbleColor = getAssistantBubbleColor(message.id);

  if (isUser) {
    return (
      <View className="w-full items-end">
        <View className="mb-2 flex-row items-center justify-end gap-2">
          <Text className="text-[12px] font-bold leading-5 text-[#A1A1AA]">
            {displayName}
          </Text>
          <UserAvatar
            avatarUrl={avatarUrl}
            fallbackInitial={displayName.charAt(0)}
            size={28}
          />
        </View>
        <LinearGradient
          colors={["#FF5C87", "#FF2056"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          className="px-5 py-3"
          style={{
            alignSelf: "flex-end",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            borderCurve: "continuous",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            boxShadow: "0 8px 16px rgba(255, 32, 86, 0.2)",
            flexShrink: 1,
            maxWidth: userBubbleMaxWidth,
          }}
        >
          <BubbleMessageText
            className="text-[16px] font-semibold text-rose-50"
            text={messageText}
          />
        </LinearGradient>
        <Text className="mt-2 pr-1 text-[11px] font-medium leading-4 text-[#A1A1AA]">
          {messageTime}
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full items-start">
      <View className="mb-2 flex-row items-center gap-2">
        <AiAvatar size={28} iconSize={16} />
        <Text className="text-[12px] font-bold leading-5 text-[#A1A1AA]">
          DearDiary AI
        </Text>
      </View>
      <LinearGradient
        colors={[assistantBubbleColor, assistantBubbleColor]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        className="px-5 py-4"
        style={{
          alignSelf: "flex-start",
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          borderCurve: "continuous",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "0 3px 8px rgba(39, 39, 42, 0.12)",
          flexShrink: 1,
          maxWidth: assistantBubbleMaxWidth,
          overflow: "visible",
        }}
      >
        <BubbleMessageText
          className="text-[16px] text-[#51515B]"
          style={assistantMessageTextStyle}
          text={messageText}
          selectable={false}
        />
      </LinearGradient>
      <Text className="mt-2 pl-1 text-[11px] font-medium leading-4 text-[#A1A1AA]">
        {messageTime}
      </Text>
    </View>
  );
}

function BubbleMessageText({
  className,
  selectable = true,
  style = chatMessageTextStyle,
  text,
}: {
  className: string;
  selectable?: boolean;
  style?: TextStyle;
  text: string;
}) {
  return (
    <Text
      android_hyphenationFrequency="none"
      className={className}
      selectable={selectable}
      style={style}
    >
      {text}
    </Text>
  );
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
