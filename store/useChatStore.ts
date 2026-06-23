import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { normalizePersistedChatMessages } from "@/lib/validation/persistedDataValidators";
import type {
  ChatMessage,
} from "@/types/chat";

const chatStorageVersion = 1;

type ChatState = {
  addMessage: (message: ChatMessage) => void;
  clearMessagesForUser: (userId: string) => void;
  getMessagesByUserId: (userId: string) => ChatMessage[];
  hasHydrated: boolean;
  messages: ChatMessage[];
  setHasHydrated: (hasHydrated: boolean) => void;
};

function migrateChatState(persistedState: unknown) {
  if (!isRecord(persistedState)) {
    return { messages: [] };
  }

  const messages = Array.isArray(persistedState.messages)
    ? persistedState.messages
    : [];

  return {
    messages: normalizePersistedChatMessages(messages),
  };
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
      hasHydrated: false,
      messages: [],
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "deardiary-chat-store-v1",
      migrate: migrateChatState,
      onRehydrateStorage: (state) => () => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ messages: state.messages }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: chatStorageVersion,
    },
  ),
);
