import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  ChatMessage,
  ChatMessageRole,
  ChatMessageSource,
} from "@/types/chat";

const chatStorageVersion = 1;
const chatMessageRoles: ChatMessageRole[] = ["user", "assistant"];
const chatMessageSources: ChatMessageSource[] = [
  "local",
  "remote_ai",
  "local_fallback",
];

type ChatState = {
  addMessage: (message: ChatMessage) => void;
  clearMessagesForUser: (userId: string) => void;
  getMessagesByUserId: (userId: string) => ChatMessage[];
  messages: ChatMessage[];
};

function migrateChatState(persistedState: unknown) {
  if (!isRecord(persistedState)) {
    return { messages: [] };
  }

  const messages = Array.isArray(persistedState.messages)
    ? persistedState.messages
    : [];

  return {
    messages: messages.filter(isChatMessage),
  };
}

function isChatMessage(message: unknown): message is ChatMessage {
  if (!isRecord(message)) {
    return false;
  }

  return (
    typeof message.id === "string" &&
    typeof message.userId === "string" &&
    typeof message.role === "string" &&
    chatMessageRoles.includes(message.role as ChatMessageRole) &&
    typeof message.content === "string" &&
    typeof message.createdAt === "string" &&
    (message.relatedEntryIds === undefined ||
      (Array.isArray(message.relatedEntryIds) &&
        message.relatedEntryIds.every(
          (entryId) => typeof entryId === "string",
        ))) &&
    (message.source === undefined ||
      (typeof message.source === "string" &&
        chatMessageSources.includes(message.source as ChatMessageSource)))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sortMessagesByDate(messages: ChatMessage[]) {
  return [...messages].sort(
    (messageA, messageB) =>
      new Date(messageA.createdAt).getTime() -
      new Date(messageB.createdAt).getTime(),
  );
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      clearMessagesForUser: (userId) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.userId !== userId),
        })),
      getMessagesByUserId: (userId) =>
        sortMessagesByDate(
          get().messages.filter((message) => message.userId === userId),
        ),
      messages: [],
    }),
    {
      name: "deardiary-chat-store-v1",
      migrate: migrateChatState,
      storage: createJSONStorage(() => AsyncStorage),
      version: chatStorageVersion,
    },
  ),
);
