import { Stack } from "expo-router";

import { InsightsScreen } from "@/components/insights/insights-screen";

export default function InsightsTabScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <InsightsScreen />
    </>
  );
}
