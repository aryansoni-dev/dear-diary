import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import {
  isFaultEnabled,
  throwIfFaultEnabled,
} from "@/lib/dev/faultInjection";
import { getEntryReflectionTextLength } from "@/lib/ai/get-ai-text-length";
import { logAITextIntegrity } from "@/lib/ai/log-ai-text-integrity";
import {
  getAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase";
import type {
  EntryAIReflection,
  GenerateEntryReflectionResponse,
} from "@/types/entryReflection";

type EntryAIReflectionRow = {
  created_at: string;
  emotions: string[];
  entry_id: string;
  follow_up_question: string | null;
  id: string;
  model: string | null;
  observation: string | null;
  source_entry_updated_at: string;
  suggestion: string | null;
  summary: string;
  themes: string[];
  updated_at: string;
  user_id: string;
};

export class EntryReflectionServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "EntryReflectionServiceError";
  }
}

export const generateEntryReflection = async (params: {
  entryId: string;
  regenerate?: boolean;
}): Promise<EntryAIReflection> => {
  throwIfFaultEnabled("ai_timeout");

  if (isFaultEnabled("ai_empty_response")) {
    throw new EntryReflectionServiceError(
      "DearDiary AI returned an empty reflection.",
      "empty_response",
    );
  }

  if (isFaultEnabled("ai_invalid_response")) {
    throw new EntryReflectionServiceError(
      "DearDiary AI returned an invalid reflection.",
      "invalid_response",
    );
  }

  const client = getEntryReflectionClient();
  const { data, error } =
    await client.functions.invoke<GenerateEntryReflectionResponse>(
      "reflect-on-entry",
      {
        body: {
          entryId: params.entryId,
          regenerate: params.regenerate,
        },
      },
    );

  if (error) {
    if (__DEV__) {
      console.warn(
        "Entry AI reflection function failed",
        await getFunctionErrorDetails(error),
      );
    }

    throw await getUserFacingFunctionError(error);
  }

  if (!isGenerateEntryReflectionResponse(data)) {
    throw new EntryReflectionServiceError(
      "DearDiary AI returned an invalid reflection.",
      "invalid_response",
    );
  }

  logAITextIntegrity({
    length: getEntryReflectionTextLength(data.reflection),
    stage: "validated",
    surface: "entry_reflection",
  });

  return data.reflection;
};

export const fetchEntryReflection = async (
  entryId: string,
): Promise<EntryAIReflection | null> => {
  const client = getEntryReflectionClient();
  const { data, error } = await client
    .from("entry_ai_reflections")
    .select(
      "id,user_id,entry_id,summary,emotions,themes,observation,follow_up_question,suggestion,model,source_entry_updated_at,created_at,updated_at",
    )
    .eq("entry_id", entryId)
    .maybeSingle();

  if (error) {
    if (isMissingReflectionTableError(error)) {
      return null;
    }

    if (__DEV__) {
      console.warn("Entry AI reflection query failed", error);
    }

    throw new EntryReflectionServiceError(
      "AI reflection could not be loaded.",
      "remote_load_failed",
    );
  }

  if (!data) {
    return null;
  }

  if (!isEntryAIReflectionRow(data)) {
    throw new EntryReflectionServiceError(
      "AI reflection data is invalid.",
      "invalid_remote_data",
    );
  }

  return mapEntryAIReflectionRow(data);
};

function mapEntryAIReflectionRow(
  row: EntryAIReflectionRow,
): EntryAIReflection {
  return {
    createdAt: row.created_at,
    emotions: row.emotions,
    entryId: row.entry_id,
    followUpQuestion: row.follow_up_question,
    id: row.id,
    model: row.model,
    observation: row.observation,
    sourceEntryUpdatedAt: row.source_entry_updated_at,
    suggestion: row.suggestion,
    summary: row.summary,
    themes: row.themes,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

function isGenerateEntryReflectionResponse(
  value: unknown,
): value is GenerateEntryReflectionResponse {
  return (
    isRecord(value) &&
    isRecord(value.reflection) &&
    isEntryAIReflection(value.reflection)
  );
}

function isEntryAIReflection(value: unknown): value is EntryAIReflection {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.userId === "string" &&
    typeof value.entryId === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.emotions) &&
    value.emotions.every((emotion) => typeof emotion === "string") &&
    Array.isArray(value.themes) &&
    value.themes.every((theme) => typeof theme === "string") &&
    (value.observation === null || typeof value.observation === "string") &&
    (value.followUpQuestion === null ||
      typeof value.followUpQuestion === "string") &&
    (value.suggestion === null || typeof value.suggestion === "string") &&
    (value.model === null || typeof value.model === "string") &&
    typeof value.sourceEntryUpdatedAt === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isEntryAIReflectionRow(
  value: unknown,
): value is EntryAIReflectionRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.user_id === "string" &&
    typeof value.entry_id === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.emotions) &&
    value.emotions.every((emotion) => typeof emotion === "string") &&
    Array.isArray(value.themes) &&
    value.themes.every((theme) => typeof theme === "string") &&
    (value.observation === null || typeof value.observation === "string") &&
    (value.follow_up_question === null ||
      typeof value.follow_up_question === "string") &&
    (value.suggestion === null || typeof value.suggestion === "string") &&
    (value.model === null || typeof value.model === "string") &&
    typeof value.source_entry_updated_at === "string" &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMissingReflectionTableError(error: { code?: string }) {
  return error.code === "PGRST205" || error.code === "42P01";
}

function getEntryReflectionClient() {
  try {
    return getAuthenticatedSupabaseClient();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      const isMissingProjectConfig = error.message.includes(
        "Supabase is not configured",
      );

      throw new EntryReflectionServiceError(
        isMissingProjectConfig
          ? "DearDiary AI is not configured yet."
          : "Please sign in again before using DearDiary AI.",
        isMissingProjectConfig ? "supabase_not_configured" : "auth_required",
      );
    }

    throw error;
  }
}

async function getUserFacingFunctionError(error: unknown) {
  if (error instanceof FunctionsFetchError) {
    return new EntryReflectionServiceError(
      "AI reflection needs an internet connection. Your journal entry is still saved safely.",
      "network_unavailable",
    );
  }

  if (error instanceof FunctionsHttpError) {
    const body = await readFunctionErrorBody(error.context);

    return new EntryReflectionServiceError(
      getHttpErrorMessage(error.context, body),
      "function_http_error",
    );
  }

  if (error instanceof FunctionsRelayError) {
    return new EntryReflectionServiceError(
      "DearDiary AI is unavailable right now.",
      "function_relay_error",
    );
  }

  return new EntryReflectionServiceError(
    "DearDiary AI is unavailable right now.",
    "unknown_function_error",
  );
}

function getHttpErrorMessage(
  response: unknown,
  body?: FunctionErrorBody | null,
) {
  if (!(response instanceof Response)) {
    return "DearDiary AI is unavailable right now.";
  }

  if (response.status === 401) {
    return "Please sign in again before using DearDiary AI.";
  }

  if (response.status === 404) {
    return "This journal entry could not be found.";
  }

  if (body?.code === "QUOTA_EXHAUSTED") {
    return "You've used your free AI reflections for this month. Upgrade to DearDiary Pro for more reflections, reports, and insights.";
  }

  if (body?.code === "PRO_FAIR_USE_EXHAUSTED") {
    return "You've reached this month's DearDiary Pro fair-use limit for AI reflections. Please try again next month.";
  }

  if (response.status === 503) {
    return "AI reflections are still being set up. Please try again after subscription usage tracking is configured.";
  }

  if (response.status === 502) {
    return "DearDiary AI could not create a reflection right now.";
  }

  return "DearDiary AI is unavailable right now.";
}

type FunctionErrorBody = {
  code?: string;
  requestId?: string;
};

async function getFunctionErrorDetails(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    const response = error.context;
    const body = await readFunctionErrorBody(response);

    return {
      body,
      name: error.name,
      status: response instanceof Response ? response.status : undefined,
    };
  }

  if (error instanceof FunctionsRelayError) {
    const response = error.context;

    return {
      name: error.name,
      status: response instanceof Response ? response.status : undefined,
    };
  }

  if (error instanceof FunctionsFetchError) {
    return {
      message: error.message,
      name: error.name,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unknown error",
    name: error instanceof Error ? error.name : "UnknownError",
  };
}

async function readFunctionErrorBody(response: unknown) {
  if (!(response instanceof Response)) {
    return null;
  }

  try {
    const body: unknown = await response.clone().json();

    if (!isRecord(body)) {
      return null;
    }

    return {
      code: typeof body.code === "string" ? body.code : undefined,
      requestId:
        typeof body.requestId === "string" ? body.requestId : undefined,
    };
  } catch {
    return null;
  }
}
