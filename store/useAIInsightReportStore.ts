import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { isAIInsightReport } from "@/lib/insights/aiInsightReportMapper";
import type { AIInsightReport } from "@/types/aiInsightReport";

const reportStorageVersion = 1;

type UserReportCache = Record<string, AIInsightReport>;

type AIInsightReportState = {
  reportsByUser: Record<string, UserReportCache>;
  getCachedReport: (userId: string | null, cacheKey: string) => AIInsightReport | null;
  removeCachedReport: (userId: string, cacheKey: string) => void;
  setCachedReport: (userId: string, cacheKey: string, report: AIInsightReport) => void;
};

export const useAIInsightReportStore = create<AIInsightReportState>()(
  persist(
    (set, get) => ({
      getCachedReport: (userId, cacheKey) => {
        if (!userId) {
          return null;
        }

        return get().reportsByUser[userId]?.[cacheKey] ?? null;
      },
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
      setCachedReport: (userId, cacheKey, report) =>
        set((state) => ({
          reportsByUser: {
            ...state.reportsByUser,
            [userId]: {
              ...(state.reportsByUser[userId] ?? {}),
              [cacheKey]: report,
            },
          },
        })),
    }),
    {
      name: "dear-diary-ai-insight-reports",
      migrate: migrateReportState,
      partialize: (state) => ({ reportsByUser: state.reportsByUser }),
      storage: createJSONStorage(() => AsyncStorage),
      version: reportStorageVersion,
    },
  ),
);

function migrateReportState(persistedState: unknown) {
  if (!isRecord(persistedState) || !isRecord(persistedState.reportsByUser)) {
    return { reportsByUser: {} };
  }

  const reportsByUser: Record<string, UserReportCache> = {};

  Object.entries(persistedState.reportsByUser).forEach(
    ([userId, userReports]) => {
      if (!isRecord(userReports)) {
        return;
      }

      const validReports = Object.entries(userReports).reduce<UserReportCache>(
        (reports, [cacheKey, report]) => {
          if (isAIInsightReport(report)) {
            reports[cacheKey] = report;
          }

          return reports;
        },
        {},
      );

      reportsByUser[userId] = validReports;
    },
  );

  return { reportsByUser };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
