import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";

import {
  isFaultEnabled,
  throwIfFaultEnabled,
} from "@/lib/dev/faultInjection";
import { getAIInsightReportTextLength } from "@/lib/ai/get-ai-text-length";
import { logAITextIntegrity } from "@/lib/ai/log-ai-text-integrity";
import {
  isAIInsightReport,
  mapAIInsightReportRow,
  type AIInsightReportMapResult,
} from "@/lib/insights/aiInsightReportMapper";
import type { ReportPeriod } from "@/lib/insights/reportPeriods";
import {
  getAuthenticatedSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase";
import type {
  AIInsightPeriodType,
  AIInsightReport,
  GenerateAIInsightReportResponse,
} from "@/types/aiInsightReport";

export class AIInsightReportServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "AIInsightReportServiceError";
  }
}

export type FetchAIInsightReportResult = {
  legacyReportAvailable: boolean;
  report: AIInsightReport | null;
};

export async function fetchAIInsightReport(params: {
  period: ReportPeriod;
}): Promise<FetchAIInsightReportResult> {
  const client = getReportClient();
  const { data, error } = await client
    .from("ai_insights")
    .select(
      "id,user_id,insight_type,period_start,period_end,report_data,related_entry_ids,source_entry_count,source_latest_updated_at,source_snapshot_hash,format_version,model,created_at,updated_at",
    )
    .eq("insight_type", params.period.type)
    .eq("period_start", params.period.start.toISOString())
    .eq("period_end", params.period.end.toISOString())
    .maybeSingle();

  if (error) {
    if (isMissingReportSchemaError(error)) {
      return { legacyReportAvailable: false, report: null };
    }

    if (__DEV__) {
      console.warn("AI insight report query failed", error);
    }

    throw new AIInsightReportServiceError(
      "Reflection report could not be loaded.",
      "remote_load_failed",
    );
  }

  if (!data) {
    return { legacyReportAvailable: false, report: null };
  }

  return mapReportResult(mapAIInsightReportRow(data));
}

export async function generateAIInsightReport(params: {
  period: ReportPeriod;
  regenerate?: boolean;
}): Promise<AIInsightReport> {
  throwIfFaultEnabled("ai_timeout");

  if (isFaultEnabled("ai_empty_response")) {
    throw new AIInsightReportServiceError(
      "DearDiary AI returned an empty reflection report.",
      "empty_response",
    );
  }

  if (isFaultEnabled("ai_invalid_response")) {
    throw new AIInsightReportServiceError(
      "DearDiary AI returned an invalid reflection report.",
      "invalid_response",
    );
  }

  const client = getReportClient();
  const { data, error } =
    await client.functions.invoke<GenerateAIInsightReportResponse>(
      "generate-insight-report",
      {
        body: {
          periodEnd: params.period.end.toISOString(),
          periodStart: params.period.start.toISOString(),
          periodType: params.period.type,
          regenerate: params.regenerate === true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    );

  if (error) {
    if (__DEV__ && !isExpectedSetupFunctionError(error)) {
      console.warn(
        "AI insight report function failed",
        await getFunctionErrorDetails(error),
      );
    }

    throw await getUserFacingFunctionError(error, params.period.type);
  }

  if (!isGenerateReportResponse(data)) {
    throw new AIInsightReportServiceError(
      "DearDiary AI returned an invalid reflection report.",
      "invalid_response",
    );
  }

  logAITextIntegrity({
    length: getAIInsightReportTextLength(data.report),
    stage: "validated",
    surface: `${data.report.periodType}_insight_report`,
  });

  return data.report;
}

function mapReportResult(
  result: AIInsightReportMapResult,
): FetchAIInsightReportResult {
  if (result.status === "ok") {
    return { legacyReportAvailable: false, report: result.report };
  }

  return {
    legacyReportAvailable: result.status === "legacy",
    report: null,
  };
}

function getReportClient() {
  try {
    return getAuthenticatedSupabaseClient();
  } catch (error) {
    if (error instanceof SupabaseConfigurationError) {
      const isMissingProjectConfig = error.message.includes(
        "Supabase is not configured",
      );

      throw new AIInsightReportServiceError(
        isMissingProjectConfig
          ? "Visual reflection reports are not configured yet."
          : "Please sign in again before viewing reflection reports.",
        isMissingProjectConfig ? "supabase_not_configured" : "auth_required",
      );
    }

    throw error;
  }
}

function isGenerateReportResponse(
  value: unknown,
): value is GenerateAIInsightReportResponse {
  return (
    isRecord(value) &&
    isRecord(value.report) &&
    isAIInsightReport(value.report) &&
    typeof value.requestId === "string"
  );
}

async function getUserFacingFunctionError(
  error: unknown,
  periodType: AIInsightPeriodType,
) {
  if (error instanceof FunctionsFetchError) {
    return new AIInsightReportServiceError(
      "Visual reflection reports need an internet connection to generate. Your saved reports and journal entries are still available.",
      "network_unavailable",
    );
  }

  if (error instanceof FunctionsHttpError) {
    const body = await readFunctionErrorBody(error.context);

    return new AIInsightReportServiceError(
      getHttpErrorMessage(error.context, periodType, body),
      "function_http_error",
    );
  }

  if (error instanceof FunctionsRelayError) {
    return new AIInsightReportServiceError(
      "DearDiary AI is unavailable right now.",
      "function_relay_error",
    );
  }

  return new AIInsightReportServiceError(
    "DearDiary AI is unavailable right now.",
    "unknown_function_error",
  );
}

function getHttpErrorMessage(
  response: unknown,
  periodType: AIInsightPeriodType,
  body?: FunctionErrorBody | null,
) {
  if (!(response instanceof Response)) {
    return "DearDiary AI is unavailable right now.";
  }

  if (body?.code === "UNAUTHORIZED_ASYMMETRIC_JWT") {
    return "Visual reflection reports need the report function auth setting deployed. Deploy the function with JWT verification disabled for Clerk, then try again.";
  }

  if (body?.code === "report_upsert_failed") {
    return "DearDiary created the reflection, but could not save the report. Please try again.";
  }

  if (response.status === 401) {
    return "Please sign in again before generating a reflection report.";
  }

  if (response.status === 404 || response.status === 503) {
    return "Visual reflection reports are still being set up. Apply the database migration and deploy the report function, then try again.";
  }

  if (response.status === 422) {
    return periodType === "weekly"
      ? "Add at least 2 journal entries this week before generating a weekly reflection."
      : "Add at least 3 journal entries this month before generating a monthly reflection.";
  }

  if (response.status === 502) {
    return "DearDiary AI could not create a reflection report right now.";
  }

  return "DearDiary AI is unavailable right now.";
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
    return { name: error.name };
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

type FunctionErrorBody = {
  code?: string;
  requestId?: string;
};

async function readFunctionErrorBody(
  response: unknown,
): Promise<FunctionErrorBody | null> {
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

function isMissingReportSchemaError(error: { code?: string }) {
  return error.code === "PGRST205" || error.code === "42P01" || error.code === "42703";
}

function isExpectedSetupFunctionError(error: unknown) {
  return (
    error instanceof FunctionsHttpError &&
    error.context instanceof Response &&
    (error.context.status === 404 || error.context.status === 503)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
