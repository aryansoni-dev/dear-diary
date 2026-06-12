export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  userId: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  relatedEntryIds?: string[];
};
