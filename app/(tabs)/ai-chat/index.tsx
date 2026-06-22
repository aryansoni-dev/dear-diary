import { useUser } from "@clerk/expo";
import { Stack } from "expo-router";

import { AiChatScreen } from "@/components/ai-chat/ai-chat-screen";
import { FeatureErrorBoundary } from "@/components/errors/FeatureErrorBoundary";

export default function AiChatTabScreen() {
  const { user } = useUser();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FeatureErrorBoundary
        fallbackMessage="Your journal entries are still available from the other tabs."
        featureName="AI Chat"
      >
        <AiChatScreen
          avatarUrl={user?.imageUrl}
          firstName={user?.firstName}
          userId={user?.id}
        />
      </FeatureErrorBoundary>
    </>
  );
}
