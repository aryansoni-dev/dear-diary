import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchAIInsightReport,
  generateAIInsightReport,
} from "@/lib/insights/aiInsightReportService";
import {
  getReportCacheKey,
  type ReportPeriod,
} from "@/lib/insights/reportPeriods";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useAIInsightReportStore } from "@/store/useAIInsightReportStore";
import { useJournalStore } from "@/store/journal-store";
import type { AIInsightReport } from "@/types/aiInsightReport";
import type { JournalEntry } from "@/types/journal";

export type UseAIInsightReportResult = {
  report: AIInsightReport | null;
  isLoading: boolean;
  isGenerating: boolean;
  isStale: boolean;
  legacyReportAvailable: boolean;
  availableEntryCount: number;
  error: string | null;
  generate: () => Promise<void>;
  regenerate: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useAIInsightReport(period: ReportPeriod): UseAIInsightReportResult {
  const { userId } = useAuth();
  const { runAutoSync } = useAutoSync();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const cacheKey = useMemo(() => getReportCacheKey(period), [period]);
  const getCachedReport = useAIInsightReportStore(
    (state) => state.getCachedReport,
  );
  const setCachedReport = useAIInsightReportStore(
    (state) => state.setCachedReport,
  );
  const [report, setReport] = useState<AIInsightReport | null>(() =>
    getCachedReport(userId ?? null, cacheKey),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [legacyReportAvailable, setLegacyReportAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestInFlightRef = useRef(false);

  const periodEntries = useMemo(
    () => getEntriesInPeriod(entries, period),
    [entries, period],
  );
  const localSource = useMemo(
    () => getLocalSource(periodEntries),
    [periodEntries],
  );
  const isStale = Boolean(
    report &&
      (report.sourceEntryCount !== localSource.count ||
        !areSameTimestamp(
          report.sourceLatestUpdatedAt,
          localSource.latestUpdatedAt,
        )),
  );

  useEffect(() => {
    const cachedReport = getCachedReport(userId ?? null, cacheKey);
    setReport(cachedReport);
    setLegacyReportAvailable(false);
    setError(null);
  }, [cacheKey, getCachedReport, userId]);

  const refresh = useCallback(async () => {
    if (!userId) {
      setError("Please sign in again before viewing reflection reports.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAIInsightReport({ period });
      setLegacyReportAvailable(result.legacyReportAvailable);

      if (result.report) {
        setReport(result.report);
        setCachedReport(userId, cacheKey, result.report);
      }
    } catch (refreshError) {
      setError(getErrorMessage(refreshError));
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, period, setCachedReport, userId]);

  useEffect(() => {
    if (hasHydrated) {
      void refresh();
    }
  }, [hasHydrated, refresh]);

  const requestGeneration = useCallback(
    async (regenerate: boolean) => {
      if (requestInFlightRef.current) {
        return;
      }

      if (!userId) {
        setError("Please sign in again before generating a reflection report.");
        return;
      }

      requestInFlightRef.current = true;
      setIsGenerating(true);
      setError(null);

      try {
        const entriesAreSynced = await syncPeriodEntriesBeforeGeneration({
          period,
          runAutoSync,
          userId,
        });

        if (!entriesAreSynced) {
          setError(
            "Please try again after your latest journal entries finish syncing.",
          );
          return;
        }

        const generatedReport = await generateAIInsightReport({
          period,
          regenerate,
        });

        setReport(generatedReport);
        setLegacyReportAvailable(false);
        setCachedReport(userId, cacheKey, generatedReport);
      } catch (generationError) {
        setError(getErrorMessage(generationError));
      } finally {
        requestInFlightRef.current = false;
        setIsGenerating(false);
      }
    },
    [cacheKey, period, runAutoSync, setCachedReport, userId],
  );

  return {
    availableEntryCount: localSource.count,
    error,
    generate: () => requestGeneration(false),
    isGenerating,
    isLoading,
    isStale,
    legacyReportAvailable,
    refresh,
    regenerate: () => requestGeneration(true),
    report,
  };
}

async function syncPeriodEntriesBeforeGeneration({
  period,
  runAutoSync,
  userId,
}: {
  period: ReportPeriod;
  runAutoSync: (reason?: "journal_change") => Promise<void>;
  userId: string;
}) {
  if (!hasUnsyncedPeriodEntries({ period, userId })) {
    return true;
  }

  await runAutoSync("journal_change");

  return !hasUnsyncedPeriodEntries({ period, userId });
}

function hasUnsyncedPeriodEntries({
  period,
  userId,
}: {
  period: ReportPeriod;
  userId: string;
}) {
  return getEntriesInPeriod(
    useJournalStore
      .getState()
      .allEntries.filter((entry) => entry.userId === userId),
    period,
  ).some((entry) => entry.syncStatus !== "synced");
}

function getEntriesInPeriod(entries: JournalEntry[], period: ReportPeriod) {
  const periodStart = period.start.getTime();
  const periodEnd = period.end.getTime();

  return entries.filter((entry) => {
    const createdAt = Date.parse(entry.createdAt);

    return (
      !entry.deletedAt &&
      Number.isFinite(createdAt) &&
      createdAt >= periodStart &&
      createdAt <= periodEnd
    );
  });
}

function getLocalSource(entries: JournalEntry[]) {
  const latestUpdatedAt =
    entries
      .map((entry) => entry.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    count: entries.length,
    latestUpdatedAt,
  };
}

function areSameTimestamp(firstTimestamp: string | null, secondTimestamp: string | null) {
  if (firstTimestamp === secondTimestamp) {
    return true;
  }

  if (!firstTimestamp || !secondTimestamp) {
    return false;
  }

  const firstTime = Date.parse(firstTimestamp);
  const secondTime = Date.parse(secondTimestamp);

  return (
    Number.isFinite(firstTime) &&
    Number.isFinite(secondTime) &&
    firstTime === secondTime
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Reflection report could not be loaded.";
}
