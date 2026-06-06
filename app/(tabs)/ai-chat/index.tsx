import { useUser } from "@clerk/expo";
import { Stack } from "expo-router";

import { AiChatScreen } from "@/components/ai-chat/ai-chat-screen";

export default function AiChatTabScreen() {
  const { user } = useUser();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AiChatScreen avatarUrl={user?.imageUrl} firstName={user?.firstName} />
    </>
  );
}
