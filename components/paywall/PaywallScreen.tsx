import { Link, router, type Href } from "expo-router";
import { Crown, RefreshCw, Sparkles, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { PurchasesPackage } from "react-native-purchases";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlanCard } from "@/components/paywall/PlanCard";
import { PremiumFeatureList } from "@/components/paywall/PremiumFeatureList";
import { AnimatedIconButton } from "@/components/ui/animated-icon-button";
import { useAppDialog } from "@/hooks/useAppDialog";
import { useSubscription } from "@/hooks/useSubscription";
import { revenueCatOfferingId } from "@/lib/subscription/constants";
import { hasProEntitlement } from "@/lib/subscription/revenueCat";

type PaywallScreenProps = {
  feature?: string | null;
};

export function PaywallScreen({ feature }: PaywallScreenProps) {
  const insets = useSafeAreaInsets();
  const { showDialog } = useAppDialog();
  const {
    error,
    isConfigured,
    isLoading,
    offerings,
    purchasePackage,
    restorePurchases,
  } = useSubscription();
  const offering = offerings?.all[revenueCatOfferingId] ?? offerings?.current;
  const monthlyPackage = offering?.monthly ?? findPackage(offering?.availablePackages, "monthly");
  const yearlyPackage = offering?.annual ?? findPackage(offering?.availablePackages, "yearly");
  const availablePackages = useMemo(
    () => [monthlyPackage, yearlyPackage].filter(isPurchasesPackage),
    [monthlyPackage, yearlyPackage],
  );
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(yearlyPackage ?? monthlyPackage ?? null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const selectedPackageIsAvailable =
    selectedPackage &&
    availablePackages.some(
      (availablePackage) =>
        availablePackage.identifier === selectedPackage.identifier &&
        availablePackage.product.identifier === selectedPackage.product.identifier,
    );
  const continueDisabled =
    !isConfigured || !selectedPackageIsAvailable || isPurchasing || isRestoring;

  useEffect(() => {
    const defaultPackage = yearlyPackage ?? monthlyPackage ?? null;

    setSelectedPackage((currentPackage) => {
      if (!defaultPackage) {
        return null;
      }

      if (
        currentPackage &&
        availablePackages.some(
          (availablePackage) =>
            availablePackage.identifier === currentPackage.identifier &&
            availablePackage.product.identifier ===
              currentPackage.product.identifier,
        )
      ) {
        return currentPackage;
      }

      return defaultPackage;
    });
  }, [availablePackages, monthlyPackage, yearlyPackage]);

  async function handleContinue() {
    if (!selectedPackage || continueDisabled) {
      return;
    }

    setIsPurchasing(true);
    setStatusMessage(null);

    try {
      const customerInfo = await purchasePackage(selectedPackage);

      if (hasProEntitlement(customerInfo)) {
        showDialog({
          confirmText: "Done",
          message:
            "DearDiary Pro is active. Return to the feature and try again when you are ready.",
          title: "Pro unlocked",
          variant: "success",
        });
        closePaywall();
        return;
      }

      setStatusMessage("Purchase completed, but Pro is not active yet.");
    } catch (purchaseError) {
      setStatusMessage(getErrorMessage(purchaseError));
    } finally {
      setIsPurchasing(false);
    }
  }

  async function handleRestore() {
    if (!isConfigured || isPurchasing || isRestoring) {
      return;
    }

    setIsRestoring(true);
    setStatusMessage(null);

    try {
      const customerInfo = await restorePurchases();

      if (hasProEntitlement(customerInfo)) {
        showDialog({
          confirmText: "Done",
          message: "Subscription restored successfully.",
          title: "DearDiary Pro active",
          variant: "success",
        });
        closePaywall();
        return;
      }

      setStatusMessage("No active subscription was found.");
    } catch (restoreError) {
      setStatusMessage(getErrorMessage(restoreError));
    } finally {
      setIsRestoring(false);
    }
  }

  function closePaywall() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile-tab");
  }

  return (
    <View className="flex-1 bg-[#FFF7FB]">
      <ScrollView
        testID="paywall-screen"
        className="flex-1"
        contentContainerStyle={{
          gap: 20,
          paddingBottom: Math.max(36, insets.bottom + 24),
          paddingHorizontal: 24,
          paddingTop: Math.max(58, insets.top + 24),
        }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <AnimatedIconButton
            testID="paywall-close-button"
            accessibilityLabel="Close DearDiary Pro"
            onPress={closePaywall}
            size={46}
          >
            <X color="#51515B" size={22} strokeWidth={2.5} />
          </AnimatedIconButton>
          <View className="rounded-full bg-[#FFE1EE] px-4 py-2">
            <Text className="text-[12px] font-bold leading-6 text-[#FF2056]">
              DearDiary Pro
            </Text>
          </View>
        </View>

        <View
          className="rounded-[30px] bg-white px-6 py-6"
          style={{ boxShadow: "0 12px 34px rgba(255, 32, 86, 0.14)" }}
        >
          <View className="size-14 items-center justify-center rounded-[20px] bg-[#FFE1EE]">
            <Crown color="#FF2056" size={28} strokeWidth={2.4} />
          </View>
          <Text className="mt-5 text-[32px] font-bold leading-6 text-[#18181B]">
            DearDiary Pro
          </Text>
          <Text className="mt-3 text-[16px] leading-6 text-[#51515B]">
            Go deeper with AI-powered reflections, emotional patterns, weekly
            reports, monthly summaries, and smarter insights.
          </Text>
          {feature ? (
            <View className="mt-5 rounded-[20px] bg-[#FFF1F5] px-4 py-3">
              <Text className="text-[14px] font-semibold leading-6 text-[#9F1239]">
                {getFeaturePrompt(feature)}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          className="rounded-[28px] bg-white px-5 py-5"
          style={{ boxShadow: "0 8px 24px rgba(39, 39, 42, 0.1)" }}
        >
          <View className="mb-4 flex-row items-center gap-3">
            <Sparkles color="#FF2056" size={22} strokeWidth={2.4} />
            <Text className="text-[18px] font-bold leading-6 text-[#18181B]">
              Included with Pro
            </Text>
          </View>
          <PremiumFeatureList />
        </View>

        <View className="gap-3">
          {monthlyPackage ? (
            <PlanCard
              testID="paywall-monthly-plan-card"
              accessibilityLabel="Monthly subscription plan"
              billingLabel="Billed monthly"
              isSelected={
                selectedPackage?.product.identifier ===
                monthlyPackage.product.identifier
              }
              onPress={() => setSelectedPackage(monthlyPackage)}
              planPackage={monthlyPackage}
              title="Monthly"
            />
          ) : null}
          {yearlyPackage ? (
            <PlanCard
              testID="paywall-yearly-plan-card"
              accessibilityLabel="Yearly subscription plan"
              billingLabel="Billed yearly"
              isRecommended
              isSelected={
                selectedPackage?.product.identifier ===
                yearlyPackage.product.identifier
              }
              onPress={() => setSelectedPackage(yearlyPackage)}
              planPackage={yearlyPackage}
              title="Yearly"
            />
          ) : null}
        </View>

        {!isConfigured ? (
          <UnavailableMessage
            testID="paywall-error-message"
            message="Subscriptions are not configured for this build."
          />
        ) : !offering || availablePackages.length === 0 ? (
          <UnavailableMessage
            testID="paywall-error-message"
            message="Subscription plans are not available right now."
          />
        ) : error ? (
          <UnavailableMessage testID="paywall-error-message" message={error} />
        ) : null}

        {statusMessage ? (
          <UnavailableMessage
            testID="paywall-status-message"
            message={statusMessage}
          />
        ) : null}

        <Pressable
          testID="paywall-continue-button"
          accessibilityLabel="Continue with selected plan"
          accessibilityRole="button"
          accessibilityState={{ disabled: continueDisabled }}
          className="min-h-[54px] flex-row items-center justify-center gap-2 rounded-full px-5"
          disabled={continueDisabled}
          onPress={handleContinue}
          style={{
            backgroundColor: continueDisabled ? "#F4F4F5" : "#FF2056",
            boxShadow: continueDisabled
              ? "0 0 0 rgba(0, 0, 0, 0)"
              : "0 10px 22px rgba(255, 32, 86, 0.25)",
          }}
        >
          {isPurchasing ? (
            <ActivityIndicator
              testID="paywall-loading-indicator"
              color="white"
            />
          ) : null}
          <Text
            className="text-center text-[16px] font-bold leading-6"
            style={{ color: continueDisabled ? "#A1A1AA" : "white" }}
          >
            Continue
          </Text>
        </Pressable>

        <View className="flex-row flex-wrap items-center justify-center gap-3">
          <Pressable
            testID="paywall-restore-button"
            accessibilityLabel="Restore purchases"
            accessibilityRole="button"
            className="min-h-10 flex-row items-center justify-center gap-2 px-3"
            disabled={!isConfigured || isPurchasing || isRestoring}
            onPress={handleRestore}
          >
            {isRestoring ? (
              <ActivityIndicator color="#FF2056" size="small" />
            ) : (
              <RefreshCw color="#FF2056" size={16} strokeWidth={2.4} />
            )}
            <Text className="text-[14px] font-bold leading-6 text-[#FF2056]">
              Restore purchases
            </Text>
          </Pressable>
          <Pressable
            testID="paywall-maybe-later-button"
            accessibilityLabel="Maybe later"
            accessibilityRole="button"
            className="min-h-10 justify-center px-3"
            onPress={closePaywall}
          >
            <Text className="text-[14px] font-semibold leading-6 text-[#71717B]">
              Maybe later
            </Text>
          </Pressable>
        </View>

        <View className="items-center gap-3">
          <Text className="text-center text-[12px] leading-6 text-[#71717B]">
            Subscription renews automatically unless cancelled through the App
            Store or Google Play.
          </Text>
          <View className="flex-row items-center justify-center gap-5">
            <Link href={"/legal/terms" as Href} asChild>
              <Pressable
                testID="paywall-terms-link"
                accessibilityLabel="Terms"
                accessibilityRole="link"
              >
                <Text className="text-[12px] font-bold leading-6 text-[#51515B]">
                  Terms
                </Text>
              </Pressable>
            </Link>
            <Link href={"/legal/privacy-policy" as Href} asChild>
              <Pressable
                testID="paywall-privacy-link"
                accessibilityLabel="Privacy Policy"
                accessibilityRole="link"
              >
                <Text className="text-[12px] font-bold leading-6 text-[#51515B]">
                  Privacy Policy
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {isLoading && !isPurchasing && !isRestoring ? (
          <View className="items-center py-2">
            <ActivityIndicator
              testID="paywall-loading-indicator"
              color="#FF2056"
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function UnavailableMessage({
  message,
  testID,
}: {
  message: string;
  testID?: string;
}) {
  return (
    <View testID={testID} className="rounded-[20px] bg-[#FFF1F5] px-4 py-3">
      <Text className="text-[14px] font-semibold leading-6 text-[#9F1239]">
        {message}
      </Text>
    </View>
  );
}

function findPackage(
  packages: PurchasesPackage[] | undefined,
  interval: "monthly" | "yearly",
) {
  return packages?.find((candidate) => {
    const identifier = candidate.identifier.toLowerCase();
    const productIdentifier = candidate.product.identifier.toLowerCase();
    const period = candidate.product.subscriptionPeriod;

    if (interval === "monthly") {
      return (
        identifier.includes("monthly") ||
        productIdentifier.includes("monthly") ||
        period === "P1M"
      );
    }

    return (
      identifier.includes("yearly") ||
      identifier.includes("annual") ||
      productIdentifier.includes("yearly") ||
      productIdentifier.includes("annual") ||
      period === "P1Y"
    );
  }) ?? null;
}

function isPurchasesPackage(
  value: PurchasesPackage | null | undefined,
): value is PurchasesPackage {
  return Boolean(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "We could not complete the request. Please try again.";
}

function getFeaturePrompt(feature: string) {
  if (feature === "entry_reflection") {
    return "You've used your free AI reflections for this month. Upgrade to DearDiary Pro for more reflections, reports, and insights.";
  }

  if (feature === "ai_chat") {
    return "You've used your free AI Chat messages for this month. Upgrade to DearDiary Pro for more AI reflection support.";
  }

  if (feature === "monthly_report") {
    return "Monthly AI reports are included with DearDiary Pro.";
  }

  if (feature === "advanced_insights") {
    return "Unlock deeper patterns with DearDiary Pro.";
  }

  return "Upgrade to DearDiary Pro for more AI reflections, reports, and insights.";
}
