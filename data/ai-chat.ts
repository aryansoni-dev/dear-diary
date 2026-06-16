export type AiChatMessage = {
  backgroundColor?: string;
  id: string;
  role: "assistant" | "user";
  text: string;
  time?: string;
};

export const aiChatMessages: AiChatMessage[] = [
  {
    backgroundColor: "#F1EBFA",
    id: "welcome",
    role: "assistant",
    text: "I'm here to sit with you for a moment. No rush, no judgment.",
  },
  {
    backgroundColor: "#FCE7EF",
    id: "meaningful",
    role: "assistant",
    text: "What part of today felt most meaningful to you?",
  },
  {
    id: "coffee",
    role: "user",
    text: "A long talk with an old friend over coffee. I didn't realize how much I missed that.",
    time: "8:43 PM",
  },
  {
    backgroundColor: "#E7F2EB",
    id: "nourishing",
    role: "assistant",
    text: "That sounds nourishing 🌿 Connection has a quiet way of reminding us who we are. What about that conversation stayed with you?",
  },
];
