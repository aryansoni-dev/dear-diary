import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchEntryReflection,
  generateEntryReflection,
} from "@/lib/ai/entryReflectionService";
import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { useEntryReflectionStore } from "@/store/useEntryReflectionStore";
import type { EntryAIReflection } from "@/types/entryReflection";

type UseEntryReflectionParams = {
  enabled?: boolean;
  entryId: string | null;
  entryUpdatedAt: string | null;
  userId: string | null;
};

type UseEntryReflectionResult = {
  error: string | null;
  generate: () => Promise<void>;
  isGenerating: boolean;
  isLoading: boolean;
  isStale: boolean;
  reflection: EntryAIReflection | null;
  refresh: () => Promise<void>;
  regenerate: () => Promise<void>;
};

export function useEntryReflection({
  enabled = true,
  entryId,
  entryUpdatedAt,
  userId,
}: UseEntryReflectionParams): UseEntryReflectionResult {
  const cachedReflection = useEntryReflectionStore((state) =>
    userId && entryId
      ? state.getReflectionByEntryId(userId, entryId)
      : undefined,
  );
  const cacheHasHydrated = useEntryReflectionStore(
    (state) => state.hasHydrated,
  );
  const upsertReflection = useEntryReflectionStore(
    (state) => state.upsertReflection,
  );
  const [remoteReflection, setRemoteReflection] =
    useState<EntryAIReflection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reflection = remoteReflection ?? cachedReflection ?? null;
  const isStale = isReflectionStale(reflection, entryUpdatedAt);

  const canUseReflection = Boolean(enabled && entryId && userId);

  useEffect(() => {
    setRemoteReflection(null);
    setError(null);
  }, [entryId, userId]);

  const refresh = useCallback(async () => {
    if (!cacheHasHydrated || !canUseReflection || !entryId || !userId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const latestReflection = await fetchEntryReflection(entryId);

      if (latestReflection?.userId === userId) {
        upsertReflection(latestReflection);
        setRemoteReflection(latestReflection);
      }
    } catch (refreshError) {
      setError(getReflectionErrorMessage(refreshError));
    } finally {
      setIsLoading(false);
    }
  }, [cacheHasHydrated, canUseReflection, entryId, upsertReflection, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runGeneration = useCallback(
    async (regenerate: boolean) => {
      if (!canUseReflection || !entryId || !userId || isGenerating) {
        return;
      }

      if (!cacheHasHydrated) {
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const generatedReflection = await generateEntryReflection({
          entryId,
          regenerate,
        });

        if (generatedReflection.userId === userId) {
          upsertReflection(generatedReflection);
          setRemoteReflection(generatedReflection);
        }
      } catch (generationError) {
        setError(getReflectionErrorMessage(generationError));
      } finally {
        setIsGenerating(false);
      }
    },
    [
      cacheHasHydrated,
      canUseReflection,
      entryId,
      isGenerating,
      upsertReflection,
      userId,
    ],
  );

  const generate = useCallback(
    () => runGeneration(false),
    [runGeneration],
  );
  const regenerate = useCallback(
    () => runGeneration(true),
    [runGeneration],
  );

  return useMemo(
    () => ({
      error,
      generate,
      isGenerating,
      isLoading: isLoading || (canUseReflection && !cacheHasHydrated),
      isStale,
      reflection,
      refresh,
      regenerate,
    }),
    [
      error,
      generate,
      cacheHasHydrated,
      canUseReflection,
      isGenerating,
      isLoading,
      isStale,
      reflection,
      refresh,
      regenerate,
    ],
  );
}

function getReflectionErrorMessage(error: unknown) {
  return normalizeAppError(error, {
    operation: "entry_ai_reflection",
  }).userMessage;
}

function isReflectionStale(
  reflection: EntryAIReflection | null,
  entryUpdatedAt: string | null,
) {
  if (!reflection || !entryUpdatedAt) {
    return false;
  }

  const reflectionSourceTime = Date.parse(reflection.sourceEntryUpdatedAt);
  const entryUpdatedTime = Date.parse(entryUpdatedAt);

  if (
    Number.isFinite(reflectionSourceTime) &&
    Number.isFinite(entryUpdatedTime)
  ) {
    return Math.abs(reflectionSourceTime - entryUpdatedTime) > 1000;
  }

  return reflection.sourceEntryUpdatedAt !== entryUpdatedAt;
}
