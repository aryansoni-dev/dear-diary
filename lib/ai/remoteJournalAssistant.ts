import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import {
  isFaultEnabled,
  throwIfFaultEnabled,
} from "@/lib/dev/faultInjection";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import type { ClientContext } from "@/lib/ai/chatIntent";

export type RemoteJournalMessage = {
  content: string;
  relatedEntryIds?: string[];
  role: "user" | "assistant";
};

export type RemoteJournalResponse = {
  message: string;
  relatedEntryIds: string[];
  source: "remote_ai";
};

export const generateRemoteJournalResponse = async (params: {
  clientContext?: ClientContext;
  message: string;
  recentMessages: RemoteJournalMessage[];
}): Promise<RemoteJournalResponse> => {
  throwIfFaultEnabled("ai_timeout");

  if (isFaultEnabled("ai_empty_response")) {
    throw new Error("DearDiary AI returned an empty response.");
  }

  if (isFaultEnabled("ai_invalid_response")) {
    throw new Error("DearDiary AI returned an invalid response.");
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

    throw new Error("DearDiary AI is unavailable.");
  }

  if (!isRemoteJournalResponse(data)) {
    throw new Error("DearDiary AI returned an invalid response.");
  }

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
    Array.isArray(value.relatedEntryIds) &&
    value.relatedEntryIds.every((entryId) => typeof entryId === "string") &&
    value.source === "remote_ai"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
