import { Redirect, Stack, useLocalSearchParams } from "expo-router";

import { JournalEditorScreen } from "@/components/journal-editor/journal-editor-screen";
import { getSafeRouteId } from "@/lib/navigation/routeValidators";

export default function ExistingJournalEntryScreen() {
  const { id } = useLocalSearchParams();
  const entryId = getSafeRouteId(id);

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
