import { Check } from "lucide-react-native";
import { Text, View } from "react-native";

import { premiumBenefits } from "@/data/paywall";

export function PremiumFeatureList() {
  return (
    <View className="gap-3">
      {premiumBenefits.map((benefit) => (
        <View className="flex-row items-start gap-3" key={benefit}>
          <View className="mt-0.5 size-6 items-center justify-center rounded-full bg-[#FFE1EE]">
            <Check color="#FF2056" size={15} strokeWidth={3} />
          </View>
          <Text className="flex-1 text-[15px] font-semibold leading-6 text-[#3F3F46]">
            {benefit}
          </Text>
        </View>
      ))}
    </View>
  );
}
