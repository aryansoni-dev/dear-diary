import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { isAIInsightReport } from "@/lib/insights/aiInsightReportMapper";
import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import type { AppError } from "@/types/appError";
import type { AIInsightReport } from "@/types/aiInsightReport";

const reportStorageVersion = 1;

type UserReportCache = Record<string, AIInsightReport>;

type AIInsightReportState = {
  reportsByUser: Record<string, UserReportCache>;
  clearReportsForUser: (userId: string) => void;
  getCachedReport: (userId: string | null, cacheKey: string) => AIInsightReport | null;
  hasHydrated: boolean;
  hydrationError: AppError | null;
  removeCachedReport: (userId: string, cacheKey: string) => void;
  setCachedReport: (userId: string, cacheKey: string, report: AIInsightReport) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHydrationError: (error: AppError | null) => void;
};

export const useAIInsightReportStore = create<AIInsightReportState>()(
  persist(
    (set, get) => ({
      clearReportsForUser: (userId) =>
        set((state) => {
          if (!state.reportsByUser[userId]) {
            return { hydrationError: null };
          }

          const reportsByUser = { ...state.reportsByUser };
          delete reportsByUser[userId];

          return { hydrationError: null, reportsByUser };
        }),
      getCachedReport: (userId, cacheKey) => {
        if (!userId) {
          return null;
        }

        return get().reportsByUser[userId]?.[cacheKey] ?? null;
      },
      hasHydrated: false,
      hydrationError: null,
      removeCachedReport: (userId, cacheKey) =>
        set((state) => {
          const userReports = state.reportsByUser[userId];

          if (!userReports) {
            return state;
          }

          const nextUserReports = { ...userReports };
          delete nextUserReports[cacheKey];

          return {
            reportsByUser: {
              ...state.reportsByUser,
              [userId]: nextUserReports,
            },
          };
        }),
      reportsByUser: {},
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setHydrationError: (error) => set({ hydrationError: error }),
      setCachedReport: (userId, cacheKey, report) =>
        set((state) => {
          if (report.userId !== userId) {
            return state;
          }

          return {
            reportsByUser: {
              ...state.reportsByUser,
              [userId]: {
                ...(state.reportsByUser[userId] ?? {}),
                [cacheKey]: report,
              },
            },
          };
        }),
    }),
    {
      name: "dear-diary-ai-insight-reports",
      merge: (persistedState, currentState) => ({
        ...currentState,
        reportsByUser: getSanitizedReportsByUser(persistedState),
      }),
      migrate: migrateReportState,
      onRehydrateStorage: (state) => (_persistedState, error) => {
        if (error) {
          state?.setHydrationError(
            normalizeAppError(error, {
              operation: "local_hydration_ai_reports",
            }),
          );
        } else {
          state?.setHydrationError(null);
        }

        state?.setHasHydrated(true);
      },
      partialize: (state) => ({ reportsByUser: state.reportsByUser }),
      storage: createJSONStorage(() => createPersistStorage()),
      version: reportStorageVersion,
    },
  ),
);

function migrateReportState(persistedState: unknown) {
  return {
    reportsByUser: getSanitizedReportsByUser(persistedState),
  };
}

function getSanitizedReportsByUser(
  persistedState: unknown,
): Record<string, UserReportCache> {
  if (!isRecord(persistedState) || !isRecord(persistedState.reportsByUser)) {
    return {};
  }

  const reportsByUser: Record<string, UserReportCache> = {};

  Object.entries(persistedState.reportsByUser).forEach(
    ([userId, userReports]) => {
      if (!isRecord(userReports)) {
        return;
      }

      const validReports = Object.entries(userReports).reduce<UserReportCache>(
        (reports, [cacheKey, report]) => {
          if (isAIInsightReport(report) && report.userId === userId) {
            reports[cacheKey] = report;
          }

          return reports;
        },
        {},
      );

      reportsByUser[userId] = validReports;
    },
  );

  return reportsByUser;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
