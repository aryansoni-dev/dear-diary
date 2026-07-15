import { Pressable, Text, View } from "react-native";
import type { PurchasesPackage } from "react-native-purchases";

type PlanCardProps = {
  accessibilityLabel?: string;
  billingLabel: string;
  isRecommended?: boolean;
  isSelected: boolean;
  onPress: () => void;
  planPackage: PurchasesPackage;
  testID?: string;
  title: string;
};

export function PlanCard({
  accessibilityLabel,
  billingLabel,
  isRecommended = false,
  isSelected,
  onPress,
  planPackage,
  testID,
  title,
}: PlanCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel ?? `${title} subscription plan`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className="min-h-[112px] rounded-[24px] border px-5 py-4"
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? "#FFF1F5" : "#FFFFFF",
        borderColor: isSelected ? "#FF2056" : "#F4DCE7",
        borderWidth: isSelected ? 2 : 1,
        boxShadow: isSelected
          ? "0 8px 20px rgba(255, 32, 86, 0.18)"
          : "0 4px 14px rgba(39, 39, 42, 0.08)",
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-[17px] font-bold leading-6 text-[#18181B]">
            {title}
          </Text>
          <Text className="mt-1 text-[13px] leading-6 text-[#71717B]">
            {billingLabel}
          </Text>
        </View>
        {isRecommended ? (
          <View className="rounded-full bg-[#FF2056] px-3 py-1">
            <Text className="text-[11px] font-bold leading-6 text-white">
              Best value
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="mt-4 text-[24px] font-bold leading-6 text-[#FF2056]">
        {planPackage.product.priceString}
      </Text>
    </Pressable>
  );
}
