import { Redirect, Stack, useLocalSearchParams } from "expo-router";

export default function JournalEditorTabScreen() {
  const { source } = useLocalSearchParams();
  const sourceParam = Array.isArray(source) ? source[0] : source;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Redirect
        href={{
          pathname: "/journal/new",
          params: { source: sourceParam ?? "home" },
        }}
      />
    </>
  );
}
