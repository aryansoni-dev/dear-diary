import { Stack } from "expo-router";

import { ReflectScreen } from "@/components/reflect/reflect-screen";

export default function ReflectTabScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ReflectScreen />
    </>
  );
}
