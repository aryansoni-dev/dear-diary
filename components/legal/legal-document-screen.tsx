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

const legalDocumentColors = {
  background: "#FFF7FB",
  bodyText: "#51515B",
  cardBackground: "#FFFFFF",
  gradientEnd: "#FFFFFF",
  gradientStart: "#FFF4FA",
  heading: "#27272A",
  iconMuted: "#51515B",
  mutedText: "#71717B",
} as const;

const legalDocumentSpacing = {
  bottomInsetOffset: 36,
  bottomMinimum: 56,
  horizontal: 24,
  topInsetOffset: 28,
  topMinimum: 52,
} as const;

const legalDocumentLayout = {
  headerSpacerSize: 50,
  iconSize: 24,
} as const;

const legalDocumentCardShadow = "0 2px 8px rgba(39, 39, 42, 0.12)";
const legalDocumentIconShadow = "0 2px 6px rgba(39, 39, 42, 0.16)";
const legalDocumentGradientColors = [
  legalDocumentColors.gradientStart,
  legalDocumentColors.gradientEnd,
] as const;

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
    <View
      className="flex-1"
      style={{ backgroundColor: legalDocumentColors.background }}
    >
      <LinearGradient
        colors={legalDocumentGradientColors}
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
          paddingBottom: Math.max(
            insets.bottom + legalDocumentSpacing.bottomInsetOffset,
            legalDocumentSpacing.bottomMinimum,
          ),
          paddingHorizontal: legalDocumentSpacing.horizontal,
          paddingTop: Math.max(
            insets.top + legalDocumentSpacing.topInsetOffset,
            legalDocumentSpacing.topMinimum,
          ),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            accessibilityLabel="Go back"
            onPress={handleBackPress}
            shadow={legalDocumentIconShadow}
          >
            <Feather
              name="chevron-left"
              size={legalDocumentLayout.iconSize}
              color={legalDocumentColors.iconMuted}
            />
          </AnimatedIconButton>

          <Text
            className="text-[20px] font-semibold leading-6"
            style={{ color: legalDocumentColors.heading }}
          >
            {title}
          </Text>

          <View
            style={{
              height: legalDocumentLayout.headerSpacerSize,
              width: legalDocumentLayout.headerSpacerSize,
            }}
          />
        </View>

        <View className="pt-8">
          <View
            className="gap-3 rounded-[26px] px-5 py-5"
            style={{
              backgroundColor: legalDocumentColors.cardBackground,
              boxShadow: legalDocumentCardShadow,
            }}
          >
            <Text
              className="text-[15px] font-semibold leading-5"
              style={{ color: legalDocumentColors.mutedText }}
            >
              Version {version}
            </Text>
            <Text
              className="text-[15px] leading-6"
              style={{ color: legalDocumentColors.mutedText }}
            >
              Effective date: {effectiveDate}
            </Text>
          </View>
        </View>

        <View className="gap-6 pt-7">
          {sections.map((section, sectionIndex) => (
            <View className="gap-3" key={`legal-section-${sectionIndex}`}>
              <Text
                className="text-[19px] font-bold leading-6"
                style={{ color: legalDocumentColors.heading }}
              >
                {section.title}
              </Text>
              {section.body.map((paragraph, paragraphIndex) => (
                <Text
                  className="text-[15px] leading-6"
                  key={`legal-section-${sectionIndex}-paragraph-${paragraphIndex}`}
                  selectable
                  style={{ color: legalDocumentColors.bodyText }}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {accountDeletionUrl ? (
          <View
            className="mt-5 rounded-[22px] px-5 py-4"
            style={{ backgroundColor: legalDocumentColors.cardBackground }}
          >
            <Text
              className="text-[15px] font-semibold leading-5"
              style={{ color: legalDocumentColors.heading }}
            >
              External account-deletion page
            </Text>
            <Text
              className="mt-2 text-[14px] leading-5"
              selectable
              style={{ color: legalDocumentColors.mutedText }}
            >
              {accountDeletionUrl}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
