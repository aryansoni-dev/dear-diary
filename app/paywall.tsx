import { Stack, useLocalSearchParams } from "expo-router";

import { PaywallScreen } from "@/components/paywall/PaywallScreen";
import { getSingleRouteParam } from "@/lib/navigation/routeValidators";

export default function PaywallRoute() {
  const params = useLocalSearchParams<{ feature?: string }>();
  const feature = getSingleRouteParam(params.feature);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PaywallScreen feature={feature} />
    </>
  );
}
