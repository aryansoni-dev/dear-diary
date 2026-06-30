export type ChatMessageRole = "user" | "assistant";
export type ChatMessageSource = "local" | "remote_ai" | "local_fallback";

export type ChatMessage = {
  id: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  isPartial?: boolean;
  relatedEntryIds?: string[];
  source?: ChatMessageSource;
};
