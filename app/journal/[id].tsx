import { Redirect, Stack, useLocalSearchParams } from "expo-router";

import { JournalEditorScreen } from "@/components/journal-editor/journal-editor-screen";

export default function ExistingJournalEntryScreen() {
  const { id } = useLocalSearchParams();
  const entryId = Array.isArray(id) ? id[0] : id;

  if (!entryId) {
    return <Redirect href="/journal-history" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <JournalEditorScreen entryId={entryId} />
    </>
  );
}
