import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchEntryReflection,
  generateEntryReflection,
} from "@/lib/ai/entryReflectionService";
import {
  areEntryTagsEqual,
  mergeEntryTagsWithAiThemes,
} from "@/lib/entryReflectionThemeTags";
import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import { useJournalStore } from "@/store/journal-store";
import {
  useEntryReflectionHydrationStore,
  useEntryReflectionStore,
} from "@/store/useEntryReflectionStore";
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
  const cacheHasHydrated = useEntryReflectionHydrationStore(
    (state) => state.hasHydrated,
  );
  const cacheHydrationError = useEntryReflectionHydrationStore(
    (state) => state.hydrationError,
  );
  const upsertReflection = useEntryReflectionStore(
    (state) => state.upsertReflection,
  );
  const [remoteReflection, setRemoteReflection] =
    useState<EntryAIReflection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const requestGenerationRef = useRef(0);
  const reflection = remoteReflection ?? cachedReflection ?? null;
  const isStale = isReflectionStale(reflection, entryUpdatedAt);

  const canUseReflection = Boolean(enabled && entryId && userId);

  useEffect(() => {
    requestGenerationRef.current += 1;
    setRemoteReflection(null);
    setError(null);
  }, [entryId, userId]);

  useEffect(() => {
    return () => {
      requestGenerationRef.current += 1;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (cacheHydrationError) {
      const recovered = await rehydrateReflectionCache();

      if (!recovered) {
        const currentError =
          useEntryReflectionHydrationStore.getState().hydrationError ??
          cacheHydrationError;

        setError(currentError.userMessage);
        return;
      }
    }

    if (!cacheHasHydrated || !canUseReflection || !entryId || !userId) {
      return;
    }

    const requestGeneration = requestGenerationRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const latestReflection = await fetchEntryReflection(entryId);

      if (requestGenerationRef.current !== requestGeneration) {
        return;
      }

      if (latestReflection?.userId === userId) {
        const reflectionForLocalCache =
          preserveLocalSourceEntryUpdatedAt(latestReflection, userId, entryId);

        upsertReflection(reflectionForLocalCache);
        setRemoteReflection(reflectionForLocalCache);
      }
    } catch (refreshError) {
      if (requestGenerationRef.current !== requestGeneration) {
        return;
      }

      setError(getReflectionErrorMessage(refreshError));
    } finally {
      if (requestGenerationRef.current === requestGeneration) {
        setIsLoading(false);
      }
    }
  }, [
    cacheHasHydrated,
    cacheHydrationError,
    canUseReflection,
    entryId,
    upsertReflection,
    userId,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runGeneration = useCallback(
    async (regenerate: boolean) => {
      if (!canUseReflection || !entryId || !userId || isGenerating) {
        return;
      }

      if (cacheHydrationError) {
        const recovered = await rehydrateReflectionCache();

        if (!recovered) {
          const currentError =
            useEntryReflectionHydrationStore.getState().hydrationError ??
            cacheHydrationError;

          setError(currentError.userMessage);
          return;
        }
      }

      if (!cacheHasHydrated) {
        return;
      }

      const requestGeneration = requestGenerationRef.current;
      setIsGenerating(true);
      setError(null);

      try {
        const generatedReflection = await generateEntryReflection({
          entryId,
          regenerate,
        });

        if (requestGenerationRef.current !== requestGeneration) {
          return;
        }

        if (generatedReflection.userId === userId) {
          const reflectionForLocalCache = applyReflectionThemesToEntryTags({
            entryId,
            reflection: generatedReflection,
            userId,
          });

          upsertReflection(reflectionForLocalCache);
          setRemoteReflection(reflectionForLocalCache);
        }
      } catch (generationError) {
        if (requestGenerationRef.current !== requestGeneration) {
          return;
        }

        setError(getReflectionErrorMessage(generationError));
      } finally {
        if (requestGenerationRef.current === requestGeneration) {
          setIsGenerating(false);
        }
      }
    },
    [
      cacheHasHydrated,
      cacheHydrationError,
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

async function rehydrateReflectionCache() {
  useEntryReflectionHydrationStore.setState({ hasHydrated: false });
  await useEntryReflectionStore.persist.rehydrate();

  return !useEntryReflectionHydrationStore.getState().hydrationError;
}

function applyReflectionThemesToEntryTags({
  entryId,
  reflection,
  userId,
}: {
  entryId: string;
  reflection: EntryAIReflection;
  userId: string;
}): EntryAIReflection {
  try {
    if (reflection.entryId !== entryId || reflection.userId !== userId) {
      return reflection;
    }

    const journalStore = useJournalStore.getState();

    if (journalStore.activeUserId !== userId) {
      return reflection;
    }

    const latestEntry = journalStore.getEntryById(entryId);

    if (
      !latestEntry ||
      latestEntry.deletedAt ||
      latestEntry.userId !== userId
    ) {
      return reflection;
    }

    const mergedTags = mergeEntryTagsWithAiThemes(
      latestEntry.tags ?? [],
      reflection.themes,
    );

    if (areEntryTagsEqual(latestEntry.tags ?? [], mergedTags)) {
      return reflection;
    }

    journalStore.updateEntry(entryId, { tags: mergedTags });

    const updatedEntry = useJournalStore.getState().getEntryById(entryId);

    if (
      !updatedEntry ||
      updatedEntry.deletedAt ||
      updatedEntry.userId !== userId ||
      !areEntryTagsEqual(updatedEntry.tags ?? [], mergedTags)
    ) {
      return reflection;
    }

    return {
      ...reflection,
      sourceEntryUpdatedAt: updatedEntry.updatedAt,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn("Entry AI reflection themes could not be applied as tags", {
        entryIdPresent: Boolean(entryId),
        error,
        themeCount: reflection.themes.length,
      });
    }
  }

  return reflection;
}

function preserveLocalSourceEntryUpdatedAt(
  remoteReflection: EntryAIReflection,
  userId: string,
  entryId: string,
) {
  const cachedReflection = useEntryReflectionStore
    .getState()
    .getReflectionByEntryId(userId, entryId);

  if (
    !cachedReflection ||
    cachedReflection.id !== remoteReflection.id ||
    cachedReflection.userId !== remoteReflection.userId ||
    cachedReflection.entryId !== remoteReflection.entryId
  ) {
    return remoteReflection;
  }

  const cachedUpdatedTime = Date.parse(cachedReflection.updatedAt);
  const remoteUpdatedTime = Date.parse(remoteReflection.updatedAt);
  const cachedSourceTime = Date.parse(cachedReflection.sourceEntryUpdatedAt);
  const remoteSourceTime = Date.parse(remoteReflection.sourceEntryUpdatedAt);

  if (
    Number.isFinite(cachedUpdatedTime) &&
    Number.isFinite(remoteUpdatedTime) &&
    cachedUpdatedTime > remoteUpdatedTime
  ) {
    return cachedReflection;
  }

  if (
    Number.isFinite(cachedUpdatedTime) &&
    Number.isFinite(remoteUpdatedTime) &&
    Number.isFinite(cachedSourceTime) &&
    Number.isFinite(remoteSourceTime) &&
    cachedUpdatedTime >= remoteUpdatedTime &&
    cachedSourceTime > remoteSourceTime
  ) {
    return {
      ...remoteReflection,
      sourceEntryUpdatedAt: cachedReflection.sourceEntryUpdatedAt,
    };
  }

  return remoteReflection;
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
