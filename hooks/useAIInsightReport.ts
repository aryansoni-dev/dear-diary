import { useAuth } from "@clerk/expo";
import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AIInsightReportServiceError,
  fetchAIInsightReport,
  generateAIInsightReport,
} from "@/lib/insights/aiInsightReportService";
import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import {
  getReportCacheKey,
  type ReportPeriod,
} from "@/lib/insights/reportPeriods";
import { isAIInsightReport } from "@/lib/insights/aiInsightReportMapper";
import { buildReportSourceSnapshotInput } from "@/lib/insights/reportSourceSnapshot";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useAIInsightReportStore } from "@/store/useAIInsightReportStore";
import {
  useJournalHydrationStore,
  useJournalStore,
} from "@/store/journal-store";
import { useMoodLogStore } from "@/store/useMoodLogStore";
import type { AIInsightReport } from "@/types/aiInsightReport";
import type { JournalEntry } from "@/types/journal";
import type { MoodLog } from "@/types/moodLog";

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
  retry: () => Promise<void>;
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
  const connectivity = useConnectivity();
  const entries = useJournalStore((state) => state.entries);
  const hasHydrated = useJournalHydrationStore(
    (state) => state.hasHydrated,
  );
  const moodLogs = useMoodLogStore((state) => state.allMoodLogs);
  const moodLogsHaveHydrated = useMoodLogStore((state) => state.hasHydrated);
  const moodLogsHydrationError = useMoodLogStore(
    (state) => state.hydrationError,
  );
  const cacheKey = useMemo(() => getReportCacheKey(period), [period]);
  const cachedReport = useAIInsightReportStore((state) => {
    const candidate = userId
      ? state.reportsByUser[userId]?.[cacheKey] ?? null
      : null;

    return candidate && isAIInsightReport(candidate) ? candidate : null;
  });
  const cacheHasHydrated = useAIInsightReportStore(
    (state) => state.hasHydrated,
  );
  const cacheHydrationError = useAIInsightReportStore(
    (state) => state.hydrationError,
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
  const [localSnapshot, setLocalSnapshot] = useState<{
    hash: string;
    input: string;
  } | null>(null);
  const requestContextVersionRef = useRef(0);
  const requestInFlightRef = useRef(false);
  const lastFailedOperationRef = useRef<
    "generate" | "refresh" | "regenerate" | null
  >(null);
  const reportRef = useRef<AIInsightReport | null>(report);

  const periodEntries = useMemo(
    () => getEntriesInPeriod(entries, period),
    [entries, period],
  );
  const periodMoodLogs = useMemo(
    () => getMoodLogsInPeriod(moodLogs, period, userId ?? null),
    [moodLogs, period, userId],
  );
  const localSource = useMemo(
    () => getLocalSource(periodEntries, periodMoodLogs),
    [periodEntries, periodMoodLogs],
  );
  const localSnapshotHash =
    localSnapshot?.input === localSource.snapshotInput
      ? localSnapshot.hash
      : null;
  const isStale = Boolean(
    report &&
      isReportStale(report, {
        ...localSource,
        snapshotHash: localSnapshotHash,
      }),
  );

  useEffect(() => {
    let isActive = true;
    const snapshotInput = localSource.snapshotInput;

    void Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      snapshotInput,
      { encoding: Crypto.CryptoEncoding.HEX },
    )
      .then((hash) => {
        if (isActive) {
          setLocalSnapshot({ hash, input: snapshotInput });
        }
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [localSource.snapshotInput]);

  useEffect(() => {
    reportRef.current = report;
  }, [report]);

  useEffect(
    () => () => {
      requestContextVersionRef.current += 1;
      requestInFlightRef.current = false;
    },
    [],
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
    lastFailedOperationRef.current = "refresh";

    if (!enabled) {
      return;
    }

    if (cacheHydrationError) {
      setError(cacheHydrationError.userMessage);
      return;
    }

    if (moodLogsHydrationError) {
      setError(moodLogsHydrationError.userMessage);
      return;
    }

    if (!cacheHasHydrated || !hasHydrated || !moodLogsHaveHydrated) {
      return;
    }

    if (!userId) {
      setError("Please sign in again before viewing reflection reports.");
      return;
    }

    if (connectivity.status === "offline") {
      setError("Connect to the internet to refresh this reflection report.");
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

      if (result.report && result.report.userId !== userId) {
        if (!reportRef.current) {
          setReport(null);
          removeCachedReport(userId, cacheKey);
        }
        return;
      }

      setLegacyReportAvailable(result.legacyReportAvailable);

      if (result.report) {
        setReport(result.report);
        setCachedReport(userId, cacheKey, result.report);
      } else if (!reportRef.current) {
        setReport(null);
        removeCachedReport(userId, cacheKey);
      }

      lastFailedOperationRef.current = null;
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
    cacheHasHydrated,
    cacheHydrationError,
    enabled,
    isCurrentRequestContext,
    hasHydrated,
    moodLogsHaveHydrated,
    moodLogsHydrationError,
    period,
    removeCachedReport,
    setCachedReport,
    connectivity.status,
    userId,
  ]);

  useEffect(() => {
    if (
      enabled &&
      hasHydrated &&
      moodLogsHaveHydrated &&
      cacheHasHydrated
    ) {
      void refresh();
    }
  }, [
    cacheHasHydrated,
    enabled,
    hasHydrated,
    moodLogsHaveHydrated,
    moodLogsHydrationError,
    refresh,
  ]);

  const requestGeneration = useCallback(
    async (regenerate: boolean) => {
      lastFailedOperationRef.current = regenerate ? "regenerate" : "generate";

      if (!enabled) {
        return;
      }

      if (cacheHydrationError) {
        setError(cacheHydrationError.userMessage);
        return;
      }

      if (moodLogsHydrationError) {
        setError(moodLogsHydrationError.userMessage);
        return;
      }

      if (
        !cacheHasHydrated ||
        !hasHydrated ||
        !moodLogsHaveHydrated ||
        requestInFlightRef.current
      ) {
        return;
      }

      if (!userId) {
        setError("Please sign in again before generating a reflection report.");
        return;
      }

      if (connectivity.status === "offline") {
        setError("Connect to the internet to generate a reflection report.");
        return;
      }

      const requestVersion = requestContextVersionRef.current;
      requestInFlightRef.current = true;
      setIsGenerating(true);
      setError(null);

      try {
        const sourcesAreSynced = await syncPeriodSourcesBeforeGeneration({
          period,
          runAutoSync,
          userId,
        });

        if (!isCurrentRequestContext(requestVersion)) {
          return;
        }

        if (!sourcesAreSynced) {
          setError(
            "Please try again after your latest entries and mood check-ins finish syncing.",
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

        if (generatedReport.userId !== userId) {
          setError("Reflection report could not be loaded for this account.");
          return;
        }

        setReport(generatedReport);
        setLegacyReportAvailable(false);
        setCachedReport(userId, cacheKey, generatedReport);
        lastFailedOperationRef.current = null;
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
      cacheHasHydrated,
      cacheHydrationError,
      connectivity.status,
      enabled,
      hasHydrated,
      isCurrentRequestContext,
      moodLogsHaveHydrated,
      moodLogsHydrationError,
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
    isLoading:
      isLoading ||
      (enabled && (!cacheHasHydrated || !hasHydrated || !moodLogsHaveHydrated)),
    isStale,
    legacyReportAvailable,
    refresh,
    regenerate: () => requestGeneration(true),
    report,
    retry: () => {
      if (lastFailedOperationRef.current === "regenerate") {
        return requestGeneration(true);
      }

      if (lastFailedOperationRef.current === "generate") {
        return requestGeneration(false);
      }

      return refresh();
    },
  };
}

async function syncPeriodSourcesBeforeGeneration({
  period,
  runAutoSync,
  userId,
}: {
  period: ReportPeriod;
  runAutoSync: (reason?: "journal_change") => Promise<void>;
  userId: string;
}) {
  const periodEntries = getEntriesInPeriod(
    useJournalStore
      .getState()
      .allEntries.filter((entry) => entry.userId === userId),
    period,
    true,
  );
  const periodMoodLogs = getMoodLogsInPeriod(
    useMoodLogStore.getState().allMoodLogs,
    period,
    userId,
    true,
  );
  const entryIds = periodEntries.map((entry) => entry.id);
  const moodLogIds = periodMoodLogs.map((moodLog) => moodLog.id);

  if (entryIds.length > 0) {
    useJournalStore.getState().markEntriesPendingSync(userId, entryIds);
  }

  if (moodLogIds.length > 0) {
    useMoodLogStore.getState().markMoodLogsPendingSync(userId, moodLogIds);
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    await runAutoSync("journal_change");

    if (!hasUnsyncedPeriodSources({ period, userId })) {
      return true;
    }
  }

  return false;
}

function hasUnsyncedPeriodSources({
  period,
  userId,
}: {
  period: ReportPeriod;
  userId: string;
}) {
  const hasUnsyncedEntries = getEntriesInPeriod(
    useJournalStore
      .getState()
      .allEntries.filter((entry) => entry.userId === userId),
    period,
    true,
  ).some((entry) => entry.syncStatus !== "synced");
  const hasUnsyncedMoodLogs = getMoodLogsInPeriod(
    useMoodLogStore.getState().allMoodLogs,
    period,
    userId,
    true,
  ).some((moodLog) => moodLog.syncStatus !== "synced");

  return hasUnsyncedEntries || hasUnsyncedMoodLogs;
}

function getEntriesInPeriod(
  entries: JournalEntry[],
  period: ReportPeriod,
  includeDeleted = false,
) {
  const periodStart = period.start.getTime();
  const periodEnd = period.end.getTime();

  return entries.filter((entry) => {
    const createdAt = Date.parse(entry.createdAt);

    return (
      (includeDeleted || !entry.deletedAt) &&
      Number.isFinite(createdAt) &&
      createdAt >= periodStart &&
      createdAt <= periodEnd
    );
  });
}

function getMoodLogsInPeriod(
  moodLogs: MoodLog[],
  period: ReportPeriod,
  userId: string | null,
  includeDeleted = false,
) {
  if (!userId) {
    return [];
  }

  const periodStart = period.start.getTime();
  const periodEnd = period.end.getTime();

  return moodLogs.filter((moodLog) => {
    const createdAt = Date.parse(moodLog.createdAt);

    return (
      moodLog.userId === userId &&
      (includeDeleted || !moodLog.deletedAt) &&
      Number.isFinite(createdAt) &&
      createdAt >= periodStart &&
      createdAt <= periodEnd
    );
  });
}

function getLocalSource(entries: JournalEntry[], moodLogs: MoodLog[]) {
  const entryIds = entries.map((entry) => entry.id).sort();
  const moodLogIds = moodLogs.map((moodLog) => moodLog.id).sort();
  const snapshotInput = buildReportSourceSnapshotInput(entries, moodLogs);
  const latestUpdatedAt =
    [...entries, ...moodLogs]
      .map((source) => source.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

  return {
    count: entries.length,
    entryIds,
    latestUpdatedAt,
    moodLogCount: moodLogIds.length,
    moodLogIds,
    snapshotInput,
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
    moodLogCount: number;
    moodLogIds: string[];
    snapshotHash: string | null;
    snapshotInput: string;
  },
) {
  if (!areSameStringSet(report.relatedEntryIds, localSource.entryIds)) {
    return true;
  }

  if (getReportSourceEntryCount(report) !== localSource.count) {
    return true;
  }

  if (
    report.sourceSnapshotHash.trim() &&
    localSource.snapshotHash &&
    report.sourceSnapshotHash !== localSource.snapshotHash
  ) {
    return true;
  }

  if (!report.sourceLatestUpdatedAt) {
    return isTimestampAfter(localSource.latestUpdatedAt, report.updatedAt);
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
  const secondSortedValues = [...secondValues].sort();

  return firstSortedValues.every(
    (value, index) => value === secondSortedValues[index],
  );
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
  if (error instanceof AIInsightReportServiceError) {
    return error.message;
  }

  return normalizeAppError(error, {
    operation: "ai_insight_report",
  }).userMessage;
}
