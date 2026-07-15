import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import {
  isFaultEnabled,
  throwIfFaultEnabled,
} from "@/lib/dev/faultInjection";
import { logAITextIntegrity } from "@/lib/ai/log-ai-text-integrity";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import type { ClientContext } from "@/lib/ai/chatIntent";

export type RemoteJournalMessage = {
  content: string;
  relatedEntryIds?: string[];
  role: "user" | "assistant";
};

export type RemoteJournalResponse = {
  isPartial?: boolean;
  message: string;
  relatedEntryIds: string[];
  source: "remote_ai";
};

export class RemoteJournalAssistantError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "RemoteJournalAssistantError";
  }
}

export const generateRemoteJournalResponse = async (params: {
  clientContext?: ClientContext;
  message: string;
  recentMessages: RemoteJournalMessage[];
}): Promise<RemoteJournalResponse> => {
  throwIfFaultEnabled("ai_timeout");

  if (isFaultEnabled("ai_empty_response")) {
    throw new RemoteJournalAssistantError(
      "DearDiary AI returned an empty response.",
      "empty_response",
    );
  }

  if (isFaultEnabled("ai_invalid_response")) {
    throw new RemoteJournalAssistantError(
      "DearDiary AI returned an invalid response.",
      "invalid_response",
    );
  }

  const client = getAuthenticatedSupabaseClient();
  const { data, error } = await client.functions.invoke("journal-ai-chat", {
    body: {
      clientContext: params.clientContext,
      message: params.message,
      recentMessages: params.recentMessages,
    },
  });

  if (error) {
    if (__DEV__) {
      console.warn(
        "DearDiary AI function failed",
        await getFunctionErrorDetails(error),
      );
    }

    throw await getUserFacingFunctionError(error);
  }

  if (!isRemoteJournalResponse(data)) {
    throw new RemoteJournalAssistantError(
      "DearDiary AI returned an invalid response.",
      "invalid_response",
    );
  }

  logAITextIntegrity({
    length: data.message.length,
    stage: "validated",
    surface: "ai_chat_message",
  });

  return data;
};

function isRemoteJournalResponse(
  value: unknown,
): value is RemoteJournalResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.message === "string" &&
    value.message.trim().length > 0 &&
    (value.isPartial === undefined || typeof value.isPartial === "boolean") &&
    Array.isArray(value.relatedEntryIds) &&
    value.relatedEntryIds.every((entryId) => typeof entryId === "string") &&
    value.source === "remote_ai"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getUserFacingFunctionError(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    const body = await readFunctionErrorBody(error.context);

    if (body?.code === "QUOTA_EXHAUSTED") {
      return new RemoteJournalAssistantError(
        "You've used your free AI Chat messages for this month. Upgrade to DearDiary Pro for more AI reflection support.",
        "quota_exhausted",
      );
    }

    if (body?.code === "PRO_FAIR_USE_EXHAUSTED") {
      return new RemoteJournalAssistantError(
        "You've reached this month's DearDiary Pro fair-use limit for AI Chat. Please try again next month.",
        "pro_fair_use_exhausted",
      );
    }
  }

  if (error instanceof FunctionsFetchError) {
    return new RemoteJournalAssistantError(
      "AI Chat needs an internet connection.",
      "network_unavailable",
    );
  }

  return new RemoteJournalAssistantError(
    "DearDiary AI is unavailable.",
    "remote_unavailable",
  );
}

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
