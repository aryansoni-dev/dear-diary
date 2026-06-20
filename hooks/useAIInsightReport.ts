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

type UseAIInsightReportOptions = {
  enabled?: boolean;
};

export function useAIInsightReport(
  period: ReportPeriod,
  options: UseAIInsightReportOptions = {},
): UseAIInsightReportResult {
  const enabled = options.enabled ?? true;
  const { userId } = useAuth();
  const { runAutoSync } = useAutoSync();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalStore((state) => state.hasHydrated);
  const cacheKey = useMemo(() => getReportCacheKey(period), [period]);
  const cachedReport = useAIInsightReportStore((state) =>
    userId ? state.reportsByUser[userId]?.[cacheKey] ?? null : null,
  );
  const removeCachedReport = useAIInsightReportStore(
    (state) => state.removeCachedReport,
  );
  const setCachedReport = useAIInsightReportStore(
    (state) => state.setCachedReport,
  );
  const [report, setReport] = useState<AIInsightReport | null>(cachedReport);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [legacyReportAvailable, setLegacyReportAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestContextVersionRef = useRef(0);
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
    report && isReportStale(report, localSource),
  );

  useEffect(() => {
    requestContextVersionRef.current += 1;
    requestInFlightRef.current = false;

    if (!enabled) {
      setReport(null);
      setIsLoading(false);
      setIsGenerating(false);
      setLegacyReportAvailable(false);
      setError(null);
      return;
    }

    setReport(cachedReport);
    setIsLoading(false);
    setIsGenerating(false);
    setLegacyReportAvailable(false);
    setError(null);
  }, [cacheKey, cachedReport, enabled, userId]);

  const isCurrentRequestContext = useCallback((requestVersion: number) => {
    return requestContextVersionRef.current === requestVersion;
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (!userId) {
      setError("Please sign in again before viewing reflection reports.");
      return;
    }

    const requestVersion = requestContextVersionRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchAIInsightReport({ period });

      if (!isCurrentRequestContext(requestVersion)) {
        return;
      }

      setLegacyReportAvailable(result.legacyReportAvailable);

      if (result.report) {
        setReport(result.report);
        setCachedReport(userId, cacheKey, result.report);
      } else {
        setReport(null);
        removeCachedReport(userId, cacheKey);
      }
    } catch (refreshError) {
      if (!isCurrentRequestContext(requestVersion)) {
        return;
      }

      setError(getErrorMessage(refreshError));
    } finally {
      if (isCurrentRequestContext(requestVersion)) {
        setIsLoading(false);
      }
    }
  }, [
    cacheKey,
    enabled,
    isCurrentRequestContext,
    period,
    removeCachedReport,
    setCachedReport,
    userId,
  ]);

  useEffect(() => {
    if (enabled && hasHydrated) {
      void refresh();
    }
  }, [enabled, hasHydrated, refresh]);

  const requestGeneration = useCallback(
    async (regenerate: boolean) => {
      if (!enabled) {
        return;
      }

      if (requestInFlightRef.current) {
        return;
      }

      if (!userId) {
        setError("Please sign in again before generating a reflection report.");
        return;
      }

      const requestVersion = requestContextVersionRef.current;
      requestInFlightRef.current = true;
      setIsGenerating(true);
      setError(null);

      try {
        const entriesAreSynced = await syncPeriodEntriesBeforeGeneration({
          period,
          runAutoSync,
          userId,
        });

        if (!isCurrentRequestContext(requestVersion)) {
          return;
        }

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

        if (!isCurrentRequestContext(requestVersion)) {
          return;
        }

        setReport(generatedReport);
        setLegacyReportAvailable(false);
        setCachedReport(userId, cacheKey, generatedReport);
      } catch (generationError) {
        if (!isCurrentRequestContext(requestVersion)) {
          return;
        }

        setError(getErrorMessage(generationError));
      } finally {
        if (isCurrentRequestContext(requestVersion)) {
          requestInFlightRef.current = false;
          setIsGenerating(false);
        }
      }
    },
    [
      cacheKey,
      enabled,
      isCurrentRequestContext,
      period,
      runAutoSync,
      setCachedReport,
      userId,
    ],
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
  const entryIds = entries.map((entry) => entry.id).sort();
  const latestUpdatedAt =
    entries
      .map((entry) => entry.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    count: entries.length,
    entryIds,
    latestUpdatedAt,
  };
}

function getReportSourceEntryCount(report: AIInsightReport) {
  const hasSourceMetadata =
    report.sourceLatestUpdatedAt !== null ||
    report.sourceSnapshotHash.trim().length > 0;

  return hasSourceMetadata
    ? report.sourceEntryCount
    : report.analytics.totalEntries;
}

function isReportStale(
  report: AIInsightReport,
  localSource: {
    count: number;
    entryIds: string[];
    latestUpdatedAt: string | null;
  },
) {
  if (areSameStringSet(report.relatedEntryIds, localSource.entryIds)) {
    return isTimestampAfter(localSource.latestUpdatedAt, report.updatedAt);
  }

  if (getReportSourceEntryCount(report) !== localSource.count) {
    return true;
  }

  if (!report.sourceLatestUpdatedAt) {
    return false;
  }

  return isTimestampAfter(
    localSource.latestUpdatedAt,
    report.sourceLatestUpdatedAt,
  );
}

function areSameStringSet(firstValues: string[], secondValues: string[]) {
  if (firstValues.length !== secondValues.length) {
    return false;
  }

  const firstSortedValues = [...firstValues].sort();

  return secondValues.every((value, index) => value === firstSortedValues[index]);
}

function isTimestampAfter(
  firstTimestamp: string | null,
  secondTimestamp: string,
) {
  if (!firstTimestamp) {
    return false;
  }

  const firstTime = Date.parse(firstTimestamp);
  const secondTime = Date.parse(secondTimestamp);

  return (
    Number.isFinite(firstTime) &&
    Number.isFinite(secondTime) &&
    firstTime > secondTime
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Reflection report could not be loaded.";
}
