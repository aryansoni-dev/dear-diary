import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import type { LegalSection } from "@/content/legal/privacyPolicy";

type LegalDocumentScreenProps = {
  accountDeletionUrl?: string | null;
  effectiveDate: string;
  sections: LegalSection[];
  title: string;
  version: string;
};

export function LegalDocumentScreen({
  accountDeletionUrl,
  effectiveDate,
  sections,
  title,
  version,
}: LegalDocumentScreenProps) {
  const insets = useSafeAreaInsets();

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/login");
  }

  return (
    <View className="flex-1 bg-[#FFF7FB]">
      <LinearGradient
        colors={["#FFF4FA", "#FFFFFF"]}
        style={{
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 36, 56),
          paddingHorizontal: 24,
          paddingTop: Math.max(insets.top + 28, 52),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            accessibilityLabel="Go back"
            onPress={handleBackPress}
            shadow="0 2px 6px rgba(39, 39, 42, 0.16)"
          >
            <Feather name="chevron-left" size={24} color="#51515B" />
          </AnimatedIconButton>

          <Text className="text-[20px] font-semibold leading-6 text-[#27272A]">
            {title}
          </Text>

          <View className="size-[50px]" />
        </View>

        <View className="pt-8">
          <View
            className="gap-3 rounded-[26px] bg-white px-5 py-5"
            style={{ boxShadow: "0 2px 8px rgba(39, 39, 42, 0.12)" }}
          >
            <Text className="text-[15px] font-semibold leading-5 text-[#71717B]">
              Version {version}
            </Text>
            <Text className="text-[15px] leading-6 text-[#71717B]">
              Effective date: {effectiveDate}
            </Text>
          </View>
        </View>

        <View className="gap-6 pt-7">
          {sections.map((section) => (
            <View className="gap-3" key={section.title}>
              <Text className="text-[19px] font-bold leading-6 text-[#27272A]">
                {section.title}
              </Text>
              {section.body.map((paragraph) => (
                <Text
                  className="text-[15px] leading-6 text-[#51515B]"
                  key={paragraph}
                  selectable
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {accountDeletionUrl ? (
          <View className="mt-5 rounded-[22px] bg-white px-5 py-4">
            <Text className="text-[15px] font-semibold leading-5 text-[#27272A]">
              External account-deletion page
            </Text>
            <Text className="mt-2 text-[14px] leading-5 text-[#71717B]" selectable>
              {accountDeletionUrl}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
