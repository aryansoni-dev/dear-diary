import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { logAITextIntegrity } from "@/lib/ai/log-ai-text-integrity";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { normalizePersistedChatMessages } from "@/lib/validation/persistedDataValidators";
import type { AppError } from "@/types/appError";
import type {
  ChatMessage,
} from "@/types/chat";

const chatStorageVersion = 1;

type ChatState = {
  addMessage: (message: ChatMessage) => void;
  clearMessagesForUser: (userId: string) => void;
  getMessagesByUserId: (userId: string) => ChatMessage[];
  hasHydrated: boolean;
  hydrationError: AppError | null;
  messages: ChatMessage[];
  setHasHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
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
      addMessage: (message) => {
        logAITextIntegrity({
          length: message.content.length,
          stage: "stored",
          surface:
            message.role === "assistant"
              ? "ai_chat_message"
              : `ai_chat_${message.role}`,
        });

        set((state) => ({
          messages: [...state.messages, message],
        }));
      },
      clearMessagesForUser: (userId) =>
        set((state) => ({
          hydrationError: null,
          messages: state.messages.filter((message) => message.userId !== userId),
        })),
      getMessagesByUserId: (userId) =>
        sortMessagesByDate(
          get().messages.filter((message) => message.userId === userId),
        ),
      hasHydrated: false,
      hydrationError: null,
      messages: [],
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (error) => set({ hydrationError: error }),
    }),
    {
      name: "deardiary-chat-store-v1",
      migrate: migrateChatState,
      onRehydrateStorage: (state) => (_persistedState, error) => {
        if (error) {
          state?.setHydrationError(
            normalizeAppError(error, {
              operation: "local_hydration_chat",
            }),
          );
        } else {
          state?.setHydrationError(null);
        }

        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ messages: state.messages }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: chatStorageVersion,
    },
  ),
);
