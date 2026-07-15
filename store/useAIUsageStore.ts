import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  getCurrentUTCMonthKey,
  type PremiumFeature,
} from "@/lib/subscription/constants";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { reportAppError } from "@/lib/errors/reportAppError";

type UserUsageByFeature = Partial<Record<PremiumFeature, number>>;
type UsageByPeriod = Record<string, UserUsageByFeature>;
type UsageByUser = Record<string, UsageByPeriod>;

type AIUsageState = {
  getMonthlyUsage: (
    userId: string | null | undefined,
    feature: PremiumFeature,
    periodKey?: string,
  ) => number;
  hasHydrated: boolean;
  hydrationError: string | null;
  incrementMonthlyUsage: (
    userId: string,
    feature: PremiumFeature,
    amount?: number,
    periodKey?: string,
  ) => void;
  usageByUser: UsageByUser;
};

const storageVersion = 1;

export const useAIUsageStore = create<AIUsageState>()(
  persist(
    (set, get) => ({
      getMonthlyUsage: (userId, feature, periodKey = getCurrentUTCMonthKey()) => {
        if (!userId) {
          return 0;
        }

        return get().usageByUser[userId]?.[periodKey]?.[feature] ?? 0;
      },
      hasHydrated: false,
      hydrationError: null,
      incrementMonthlyUsage: (
        userId,
        feature,
        amount = 1,
        periodKey = getCurrentUTCMonthKey(),
      ) => {
        if (!userId || amount <= 0) {
          return;
        }

        set((state) => {
          const userUsage = state.usageByUser[userId] ?? {};
          const periodUsage = userUsage[periodKey] ?? {};
          const currentCount = periodUsage[feature] ?? 0;

          return {
            usageByUser: {
              ...state.usageByUser,
              [userId]: {
                ...userUsage,
                [periodKey]: {
                  ...periodUsage,
                  [feature]: currentCount + amount,
                },
              },
            },
          };
        });
      },
      usageByUser: {},
    }),
    {
      name: "dear-diary-ai-usage-v1",
      onRehydrateStorage: () => (state, error) => {
        if (!state) {
          return;
        }

        if (error) {
          reportAppError(error, {
            feature: "subscription",
            operation: "local_hydration_ai_usage",
          });
        }

        useAIUsageStore.setState({
          hasHydrated: true,
          hydrationError: error
            ? "AI usage counters could not be loaded on this device."
            : null,
        });
      },
      partialize: (state) => ({ usageByUser: state.usageByUser }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: storageVersion,
    },
  ),
);
