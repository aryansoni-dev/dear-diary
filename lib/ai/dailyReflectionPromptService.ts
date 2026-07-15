import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import {
  getAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase";
import { isValidDailyReflectionPrompts } from "@/lib/reflection-prompts/dailyReflectionPrompts";
import type {
  DailyReflectionPromptBundle,
  GenerateDailyReflectionPromptsResponse,
} from "@/types/dailyReflectionPrompt";

const inFlightRequests = new Map<
  string,
  Promise<DailyReflectionPromptBundle>
>();

export class DailyReflectionPromptServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "DailyReflectionPromptServiceError";
  }
}

export function generateDailyReflectionPromptBundle(params: {
  dateKey: string;
  recentPrompts: readonly string[];
  timezone: string;
  userId: string;
}): Promise<DailyReflectionPromptBundle> {
  const requestKey = `${params.userId}:${params.dateKey}`;
  const existingRequest = inFlightRequests.get(requestKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = requestDailyReflectionPromptBundle(params).finally(() => {
    if (inFlightRequests.get(requestKey) === request) {
      inFlightRequests.delete(requestKey);
    }
  });

  inFlightRequests.set(requestKey, request);

  return request;
}

async function requestDailyReflectionPromptBundle(params: {
  dateKey: string;
  recentPrompts: readonly string[];
  timezone: string;
  userId: string;
}): Promise<DailyReflectionPromptBundle> {
  // Root auth wiring is installed in a parent effect during the same commit.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  const client = getDailyPromptClient();
  const { data, error } =
    await client.functions.invoke<GenerateDailyReflectionPromptsResponse>(
      "generate-daily-reflection-prompts",
      {
        body: {
          dateKey: params.dateKey,
          timezone: params.timezone,
        },
      },
    );

  if (error) {
    if (__DEV__) {
      console.warn(
        "Daily reflection prompt generation failed",
        await getFunctionErrorDetails(error),
      );
    }

    throw getUserFacingFunctionError(error);
  }

  if (!isGenerateDailyReflectionPromptsResponse(data, params.recentPrompts)) {
    throw new DailyReflectionPromptServiceError(
      "DearDiary AI returned invalid daily prompts.",
      "invalid_response",
    );
  }

  return {
    dateKey: params.dateKey,
    generatedAt: new Date().toISOString(),
    prompts: data.prompts,
    source: "ai",
    timezone: params.timezone,
  };
}

function isGenerateDailyReflectionPromptsResponse(
  value: unknown,
  recentPrompts: readonly string[],
): value is GenerateDailyReflectionPromptsResponse {
  return (
    isRecord(value) &&
    typeof value.requestId === "string" &&
    isValidDailyReflectionPrompts(value.prompts, recentPrompts)
  );
}

function getDailyPromptClient() {
  try {
    return getAuthenticatedSupabaseClient();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      throw new DailyReflectionPromptServiceError(
        "Daily reflections are not available right now.",
        "configuration_unavailable",
      );
    }

    throw error;
  }
}

function getUserFacingFunctionError(error: unknown) {
  if (error instanceof FunctionsFetchError) {
    return new DailyReflectionPromptServiceError(
      "Daily reflections need an internet connection.",
      "network_unavailable",
    );
  }

  if (error instanceof FunctionsHttpError) {
    return new DailyReflectionPromptServiceError(
      "DearDiary could not create today's reflection prompts.",
      "function_http_error",
    );
  }

  if (error instanceof FunctionsRelayError) {
    return new DailyReflectionPromptServiceError(
      "DearDiary AI is unavailable right now.",
      "function_relay_error",
    );
  }

  return new DailyReflectionPromptServiceError(
    "DearDiary AI is unavailable right now.",
    "unknown_function_error",
  );
}

async function getFunctionErrorDetails(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    const response = error.context;
    const body = await readFunctionErrorBody(response);

    return {
      body,
      name: error.name,
      requestFailed: true,
      status: response instanceof Response ? response.status : undefined,
    };
  }

  if (error instanceof FunctionsRelayError) {
    const response = error.context;

    return {
      name: error.name,
      requestFailed: true,
      status: response instanceof Response ? response.status : undefined,
    };
  }

  if (error instanceof FunctionsFetchError) {
    return {
      message: error.message,
      name: error.name,
      requestFailed: true,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unknown error",
    name: error instanceof Error ? error.name : "UnknownError",
    requestFailed: true,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
