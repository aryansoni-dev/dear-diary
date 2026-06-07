import { Stack } from "expo-router";

import { JournalEditorScreen } from "@/components/journal-editor/journal-editor-screen";

export default function NewJournalEntryScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <JournalEditorScreen />
    </>
  );
}
