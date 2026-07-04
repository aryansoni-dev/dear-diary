import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { colors } from "@/constants/theme";
import type { LegalSection } from "@/content/legal/privacyPolicy";

type LegalDocumentScreenProps = {
  accountDeletionUrl?: string | null;
  effectiveDate: string;
  sections: LegalSection[];
  title: string;
  version: string;
};

const legalDocumentBottomInsetOffset = 36;
const legalDocumentBottomMinimum = 56;
const legalDocumentCardShadow = "0 2px 8px rgba(39, 39, 42, 0.12)";
const legalDocumentIconShadow = "0 2px 6px rgba(39, 39, 42, 0.16)";
const legalDocumentGradientColors = [
  colors.legalGradientStart,
  colors.legalGradientEnd,
] as const;
const legalDocumentIconSize = 24;
const legalDocumentTopInsetOffset = 28;
const legalDocumentTopMinimum = 52;
const isAndroid = process.env.EXPO_OS === "android";

export function LegalDocumentScreen({
  accountDeletionUrl,
  effectiveDate,
  sections,
  title,
  version,
}: LegalDocumentScreenProps) {
  const insets = useSafeAreaInsets();
  const visibleSections =
    sections.length > 0
      ? sections
      : [
          {
            body: [
              "This legal document is unavailable in this development build.",
            ],
            title: "Content unavailable",
          },
        ];

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/login");
  }

  return (
    <View className="flex-1 bg-legal-background">
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
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-legal-screen"
          style={{
            paddingBottom: Math.max(
              insets.bottom + legalDocumentBottomInsetOffset,
              legalDocumentBottomMinimum,
            ),
            paddingTop: Math.max(
              insets.top + legalDocumentTopInsetOffset,
              legalDocumentTopMinimum,
            ),
          }}
        >
          <View className="flex-row items-center justify-between">
            <AnimatedIconButton
              accessibilityLabel="Go back"
              onPress={handleBackPress}
              shadow={legalDocumentIconShadow}
            >
              <Feather
                name="chevron-left"
                size={legalDocumentIconSize}
                color={colors.textSecondary}
              />
            </AnimatedIconButton>

            <Text className="text-[20px] font-semibold leading-6 text-text-primary">
              {title}
            </Text>

            <View className="size-legal-header-spacer" />
          </View>

          <View className="pt-8">
            <View
              className="gap-3 rounded-[26px] bg-legal-card px-5 py-5"
              style={{
                boxShadow: legalDocumentCardShadow,
              }}
            >
              <Text className="text-[15px] font-semibold leading-5 text-text-muted">
                Version {version}
              </Text>
              <Text className="text-[15px] leading-6 text-text-muted">
                Effective date: {effectiveDate}
              </Text>
            </View>
          </View>

          <View className="gap-6 pt-7">
            {visibleSections.map((section, sectionIndex) => (
              <View className="gap-3" key={`legal-section-${sectionIndex}`}>
                <Text className="text-[19px] font-bold leading-6 text-text-primary">
                  {section.title}
                </Text>
                {section.body.map((paragraph, paragraphIndex) => (
                  <LegalParagraphText
                    key={`legal-section-${sectionIndex}-paragraph-${paragraphIndex}`}
                    paragraph={paragraph}
                  />
                ))}
              </View>
            ))}
          </View>

          {accountDeletionUrl ? (
            <View className="mt-5 rounded-[22px] bg-legal-card px-5 py-4">
              <Text className="text-[15px] font-semibold leading-5 text-text-primary">
                External account-deletion page
              </Text>
              <Text
                className="mt-2 text-[14px] leading-5 text-text-muted"
                selectable
              >
                {accountDeletionUrl}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function LegalParagraphText({ paragraph }: { paragraph: string }) {
  // Explicit weight keeps Android's layout metrics aligned with system Bold text.
  return (
    <Text
      className={`text-[15px] leading-6 text-text-secondary ${
        isAndroid ? "font-semibold" : ""
      }`}
      selectable
    >
      {paragraph}
    </Text>
  );
}
