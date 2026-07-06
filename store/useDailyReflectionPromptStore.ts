import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import {
  dailyReflectionPromptHistoryDays,
  isValidDailyReflectionPromptBundle,
} from "@/lib/reflection-prompts/dailyReflectionPrompts";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import type { AppError } from "@/types/appError";
import type { DailyReflectionPromptBundle } from "@/types/dailyReflectionPrompt";

const dailyPromptStorageVersion = 1;

type UserDailyPromptBundles = Record<string, DailyReflectionPromptBundle>;

type DailyReflectionPromptState = {
  bundlesByUser: Record<string, UserDailyPromptBundles>;
  clearBundlesForUser: (userId: string) => void;
  hasHydrated: boolean;
  hydrationError: AppError | null;
  setBundle: (userId: string, bundle: DailyReflectionPromptBundle) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
};

export const useDailyReflectionPromptStore =
  create<DailyReflectionPromptState>()(
    persist(
      (set) => ({
        bundlesByUser: {},
        clearBundlesForUser: (userId) =>
          set((state) => {
            if (!state.bundlesByUser[userId]) {
              return { hydrationError: null };
            }

            const bundlesByUser = { ...state.bundlesByUser };
            delete bundlesByUser[userId];

            return { bundlesByUser, hydrationError: null };
          }),
        hasHydrated: false,
        hydrationError: null,
        setBundle: (userId, bundle) =>
          set((state) => {
            if (!userId.trim() || !isValidDailyReflectionPromptBundle(bundle)) {
              return state;
            }

            const userBundles = {
              ...(state.bundlesByUser[userId] ?? {}),
              [bundle.dateKey]: bundle,
            };

            return {
              bundlesByUser: {
                ...state.bundlesByUser,
                [userId]: keepRecentBundles(userBundles),
              },
            };
          }),
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        setHydrationError: (hydrationError) => set({ hydrationError }),
      }),
      {
        name: "dear-diary-daily-reflection-prompts-v1",
        merge: (persistedState, currentState) => ({
          ...currentState,
          bundlesByUser: getSanitizedBundlesByUser(persistedState),
        }),
        migrate: (persistedState) => ({
          bundlesByUser: getSanitizedBundlesByUser(persistedState),
        }),
        onRehydrateStorage: (state) => (_persistedState, error) => {
          state?.setHydrationError(
            error
              ? normalizeAppError(error, {
                  operation: "local_hydration_daily_reflection_prompts",
                })
              : null,
          );
          state?.setHasHydrated(true);
        },
        partialize: (state) => ({ bundlesByUser: state.bundlesByUser }),
        storage: createJSONStorage(() => createPersistStorage()),
        version: dailyPromptStorageVersion,
      },
    ),
  );

function getSanitizedBundlesByUser(
  persistedState: unknown,
): Record<string, UserDailyPromptBundles> {
  if (!isRecord(persistedState) || !isRecord(persistedState.bundlesByUser)) {
    return {};
  }

  return Object.entries(persistedState.bundlesByUser).reduce<
    Record<string, UserDailyPromptBundles>
  >((bundlesByUser, [userId, userBundles]) => {
    if (!userId.trim() || !isRecord(userBundles)) {
      return bundlesByUser;
    }

    const sanitizedUserBundles = Object.entries(userBundles).reduce<
      UserDailyPromptBundles
    >((bundles, [dateKey, bundle]) => {
      if (
        isValidDailyReflectionPromptBundle(bundle) &&
        bundle.dateKey === dateKey
      ) {
        bundles[dateKey] = bundle;
      }

      return bundles;
    }, {});

    bundlesByUser[userId] = keepRecentBundles(sanitizedUserBundles);

    return bundlesByUser;
  }, {});
}

function keepRecentBundles(bundles: UserDailyPromptBundles) {
  return Object.entries(bundles)
    .sort(([leftDateKey], [rightDateKey]) =>
      rightDateKey.localeCompare(leftDateKey),
    )
    .slice(0, dailyReflectionPromptHistoryDays + 1)
    .reduce<UserDailyPromptBundles>((recentBundles, [dateKey, bundle]) => {
      recentBundles[dateKey] = bundle;
      return recentBundles;
    }, {});
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
