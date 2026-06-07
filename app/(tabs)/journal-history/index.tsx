import { Stack } from "expo-router";

import { JournalHistoryScreen } from "@/components/journal-history/journal-history-screen";

export default function JournalHistoryTabScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <JournalHistoryScreen />
    </>
  );
}
