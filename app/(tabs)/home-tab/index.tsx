import { useUser } from "@clerk/expo";
import { Stack } from "expo-router";

import { HomeScreen } from "@/components/home/home-screen";

export default function HomeTabScreen() {
  const { user } = useUser();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <HomeScreen avatarUrl={user?.imageUrl} firstName={user?.firstName} />
    </>
  );
}
