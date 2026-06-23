import { Redirect, Stack, useLocalSearchParams } from "expo-router";

import { getSingleRouteParam } from "@/lib/navigation/routeValidators";

export default function JournalEditorTabScreen() {
  const { source } = useLocalSearchParams();
  const sourceParam = getSingleRouteParam(source);

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
