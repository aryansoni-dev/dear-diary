import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  buildReportAnalytics,
  type JournalEntryRow,
  type ReportAnalytics,
} from "../_shared/buildReportAnalytics.ts";

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const systemPrompt = `You are DearDiary AI, a thoughtful journal analyst and reflection companion.

You are analyzing multiple journal entries from one clearly defined period.

The application has already calculated all numerical statistics and graph data.

Do not invent or recalculate percentages, entry counts, streaks, mood counts, dates or frequencies.

Your role is to interpret the entries and analytics into a meaningful personal reflection.

Identify:

- the overall theme of the period
- meaningful activities or experiences
- the emotional journey
- notable emotional transitions
- things the user appeared to enjoy
- challenges and stressors
- wins and progress
- recurring behavioural or reflection patterns
- areas that may have gone better
- one realistic focus for the next period
- one optional reflection prompt

Do not merely copy, list or paraphrase journal prompts and answers.

Combine related entries into broader insights.

Use only the provided journal entries and calculated analytics.

Do not invent events, relationships, motivations, moods or facts.

Clearly distinguish strong evidence from tentative observations.

If evidence is limited, say so.

Do not diagnose mental-health conditions.

Do not provide medical advice.

Do not shame or judge the user.

Keep the tone warm, grounded, concise and practical.

Every list item must be a complete sentence or a concise complete phrase.

Never end a sentence or list item with connector words such as "and", "or",
"which", "that", "with", "for", "to", "of", "a", "an", or "the".

Return only valid JSON with the exact requested keys.`;

const journalEntrySelectWithTags =
  "id,title,content,mood,type,prompt,tags,created_at,updated_at";
const journalEntrySelectWithoutTags =
  "id,title,content,mood,type,prompt,created_at,updated_at";
const maxFetchedEntries = 251;
const maxAnalyticsEntries = 250;
const maxDetailedEntries = 150;
const maxEntryContentLength = 1200;
const maxTitleLength = 200;
const maxPromptLength = 300;
const maxTagsPerEntry = 10;
const reportFormatVersion = 2;
const danglingEndingWords = new Set([
  "a",
  "about",
  "an",
  "and",
  "as",
  "at",
  "because",
  "being",
  "but",
  "by",
  "for",
  "from",
  "if",
  "in",
  "into",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "which",
  "while",
  "with",
]);

type AIInsightPeriodType = "weekly" | "monthly";

type GenerateInsightReportRequest = {
  periodEnd: string;
  periodStart: string;
  periodType: AIInsightPeriodType;
  regenerate: boolean;
  timezone?: string;
};

type ReportNarrative = {
  overview: string;
  activities: string[];
  emotionalJourney: string;
  emotionalFlow: string[];
  enjoyed: string[];
  challenges: string[];
  wins: string[];
  patterns: string[];
  improvements: string[];
  nextFocus: string;
  reflectionPrompt: string | null;
  dataQualityNote: string | null;
};

type AIInsightReportRow = {
  created_at: string;
  format_version: number | null;
  id: string;
  insight_type: string;
  model: string | null;
  period_end: string;
  period_start: string;
  related_entry_ids: string[] | null;
  report_data: unknown;
  source_entry_count: number | null;
  source_latest_updated_at: string | null;
  source_snapshot_hash: string | null;
  updated_at: string;
  user_id: string;
};

class AIProviderError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.info("generate-insight-report request_received", {
    method: request.method,
    requestId,
  });

  if (request.method !== "POST") {
    return jsonResponse(
      { code: "method_not_allowed", error: "Method not allowed.", requestId },
      405,
    );
  }

  const authorization = request.headers.get("Authorization")?.trim();
  const bearerToken = authorization ? getBearerToken(authorization) : null;

  if (!authorization || !bearerToken) {
    return jsonResponse(
      { code: "unauthorized", error: "Authentication is required.", requestId },
      401,
    );
  }

  const claims = parseJwtClaims(bearerToken);

  if (!claims?.sub) {
    return jsonResponse(
      { code: "invalid_jwt", error: "Authentication is invalid.", requestId },
      401,
    );
  }

  const parsedRequest = await parseRequest(request);

  if (!parsedRequest.ok) {
    return jsonResponse(
      {
        code: "invalid_request",
        error: parsedRequest.error,
        requestId,
      },
      400,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(
      {
        code: "supabase_not_configured",
        error: "The journal service is not configured.",
        requestId,
      },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });
  const reportRequest = parsedRequest.data;
  const periodStart = new Date(reportRequest.periodStart);
  const periodEnd = new Date(reportRequest.periodEnd);
  const entriesResult = await fetchJournalEntries({
    periodEnd: reportRequest.periodEnd,
    periodStart: reportRequest.periodStart,
    supabase,
  });

  if (entriesResult.error) {
    console.error("generate-insight-report entries_query_failed", {
      code: entriesResult.error.code,
      requestId,
    });

    return jsonResponse(
      {
        code: "entries_query_failed",
        error: "Journal entries could not be loaded.",
        requestId,
      },
      500,
    );
  }

  const dataWasCapped = entriesResult.entries.length > maxAnalyticsEntries;
  const entries = entriesResult.entries.slice(0, maxAnalyticsEntries);
  const analytics = buildReportAnalytics({
    dataWasCapped,
    entries,
    periodEnd,
    periodStart,
    timezone: reportRequest.timezone,
  });
  const source = await buildSourceSnapshot(entries);
  const existingReportResult = await fetchExistingReport({
    periodEnd: reportRequest.periodEnd,
    periodStart: reportRequest.periodStart,
    periodType: reportRequest.periodType,
    supabase,
  });

  if (existingReportResult.error) {
    if (isMissingReportTableError(existingReportResult.error)) {
      return jsonResponse(
        {
          code: "report_table_missing",
          error: "Visual reflection reports are not configured yet.",
          requestId,
        },
        503,
      );
    }

    console.error("generate-insight-report existing_report_query_failed", {
      code: existingReportResult.error.code,
      requestId,
    });

    return jsonResponse(
      {
        code: "report_query_failed",
        error: "Reflection report could not be loaded.",
        requestId,
      },
      500,
    );
  }

  const existingReport = existingReportResult.report;

  if (
    !reportRequest.regenerate &&
    existingReport &&
    existingReport.source_snapshot_hash === source.hash
  ) {
    const existingVisualReport = mapReportRow(existingReport);

    if (existingVisualReport) {
      console.info("generate-insight-report existing_report_reused", {
        requestId,
      });

      return jsonResponse({ report: existingVisualReport, requestId });
    }
  }

  const minimumEntries = reportRequest.periodType === "weekly" ? 2 : 3;

  if (entries.length < minimumEntries) {
    return jsonResponse(
      {
        code: "insufficient_entries",
        error:
          reportRequest.periodType === "weekly"
            ? "Add at least 2 journal entries this week before generating a weekly reflection."
            : "Add at least 3 journal entries this month before generating a monthly reflection.",
        requestId,
      },
      422,
    );
  }

  const prompt = buildNarrativePrompt({
    analytics,
    entries,
    periodEnd: reportRequest.periodEnd,
    periodStart: reportRequest.periodStart,
    periodType: reportRequest.periodType,
  });

  console.info("generate-insight-report prompt_ready", {
    dataWasCapped,
    entryCount: entries.length,
    periodType: reportRequest.periodType,
    requestId,
  });

  let narrative: ReportNarrative;

  try {
    narrative = await generateValidNarrative(prompt, analytics);
  } catch (error) {
    const providerError =
      error instanceof AIProviderError
        ? { code: error.code, name: error.name, status: error.status }
        : {
            code: "unknown",
            name: error instanceof Error ? error.name : "UnknownError",
          };

    console.error("generate-insight-report provider_failed", {
      ...providerError,
      requestId,
    });

    return jsonResponse(
      {
        code:
          error instanceof AIProviderError &&
          error.code === "invalid_narrative_response"
            ? "invalid_ai_response"
            : "ai_provider_failed",
        error:
          error instanceof AIProviderError &&
          error.code === "invalid_narrative_response"
            ? "DearDiary AI returned an invalid reflection report."
            : "The AI service is temporarily unavailable.",
        requestId,
      },
      502,
    );
  }

  const reportId = existingReport?.id ?? createReportId();
  const model = Deno.env.get("AI_MODEL")?.trim() ?? null;
  const now = new Date().toISOString();
  const recurringThemeNames = analytics.recurringThemes.map(
    (theme) => theme.name,
  );
  const upsertResult = await supabase
    .from("ai_insights")
    .upsert(
      {
        format_version: reportFormatVersion,
        id: reportId,
        insight_type: reportRequest.periodType,
        model,
        mood_summary: analytics.moodDistribution,
        period_end: reportRequest.periodEnd,
        period_start: reportRequest.periodStart,
        period_type: reportRequest.periodType,
        recurring_themes: recurringThemeNames,
        related_entry_ids: entries.map((entry) => entry.id),
        report_data: {
          analytics,
          formatVersion: reportFormatVersion,
          narrative,
        },
        summary: narrative.overview,
        source_entry_count: entries.length,
        source_latest_updated_at: source.latestUpdatedAt,
        source_snapshot_hash: source.hash,
        title:
          reportRequest.periodType === "weekly"
            ? "Weekly Reflection"
            : "Monthly Reflection",
        updated_at: now,
        user_id: claims.sub,
      },
      { onConflict: "user_id,insight_type,period_start,period_end" },
    )
    .select("*")
    .single();

  if (upsertResult.error || !isReportRow(upsertResult.data)) {
    console.error("generate-insight-report report_upsert_failed", {
      code: upsertResult.error?.code,
      message: upsertResult.error?.message,
      requestId,
    });

    return jsonResponse(
      {
        code: "report_upsert_failed",
        error: "Reflection report could not be saved.",
        requestId,
      },
      500,
    );
  }

  const report = mapReportRow(upsertResult.data);

  if (!report) {
    return jsonResponse(
      {
        code: "invalid_saved_report",
        error: "Reflection report could not be saved.",
        requestId,
      },
      500,
    );
  }

  console.info("generate-insight-report report_saved", { requestId });

  return jsonResponse({ report, requestId });
});

async function parseRequest(
  request: Request,
): Promise<
  | { data: GenerateInsightReportRequest; ok: true }
  | { error: string; ok: false }
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return { error: "Request body must be valid JSON.", ok: false };
  }

  if (!isRecord(body)) {
    return { error: "Request body is invalid.", ok: false };
  }

  const forbiddenKeys = [
    "analytics",
    "entries",
    "entryCount",
    "moodDistribution",
    "rawEntries",
    "reportData",
    "userId",
  ];

  if (forbiddenKeys.some((key) => key in body)) {
    return { error: "Request body contains unsupported fields.", ok: false };
  }

  if (body.periodType !== "weekly" && body.periodType !== "monthly") {
    return { error: "Report period type is invalid.", ok: false };
  }

  if (
    typeof body.periodStart !== "string" ||
    typeof body.periodEnd !== "string"
  ) {
    return { error: "Report period dates are required.", ok: false };
  }

  const periodStart = new Date(body.periodStart);
  const periodEnd = new Date(body.periodEnd);

  if (
    Number.isNaN(periodStart.getTime()) ||
    Number.isNaN(periodEnd.getTime()) ||
    periodEnd.getTime() <= periodStart.getTime()
  ) {
    return { error: "Report period dates are invalid.", ok: false };
  }

  const durationDays =
    (periodEnd.getTime() - periodStart.getTime()) / 86400000;

  if (durationDays > 35) {
    return { error: "Report period is too long.", ok: false };
  }

  if (
    body.regenerate !== undefined &&
    typeof body.regenerate !== "boolean"
  ) {
    return { error: "Regenerate flag is invalid.", ok: false };
  }

  if (
    body.timezone !== undefined &&
    (typeof body.timezone !== "string" || body.timezone.length > 80)
  ) {
    return { error: "Timezone is invalid.", ok: false };
  }

  return {
    data: {
      periodEnd: periodEnd.toISOString(),
      periodStart: periodStart.toISOString(),
      periodType: body.periodType,
      regenerate: body.regenerate === true,
      timezone:
        typeof body.timezone === "string" && body.timezone.trim()
          ? body.timezone.trim()
          : undefined,
    },
    ok: true,
  };
}

async function fetchJournalEntries({
  periodEnd,
  periodStart,
  supabase,
}: {
  periodEnd: string;
  periodStart: string;
  supabase: SupabaseClient;
}) {
  const buildQuery = (selectColumns: string) =>
    supabase
      .from("journal_entries")
      .select(selectColumns)
      .is("deleted_at", null)
      .gte("created_at", periodStart)
      .lte("created_at", periodEnd)
      .order("created_at", { ascending: true })
      .limit(maxFetchedEntries);

  const taggedResult = await buildQuery(journalEntrySelectWithTags);
  let data = taggedResult.data;
  let error = taggedResult.error;

  if (error && isMissingTagsColumnError(error)) {
    const fallbackResult = await buildQuery(journalEntrySelectWithoutTags);
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    return { entries: [], error };
  }

  const rows: unknown[] = Array.isArray(data) ? data : [];

  return {
    entries: rows.filter(isJournalEntryRow),
    error: null,
  };
}

async function fetchExistingReport({
  periodEnd,
  periodStart,
  periodType,
  supabase,
}: {
  periodEnd: string;
  periodStart: string;
  periodType: AIInsightPeriodType;
  supabase: SupabaseClient;
}) {
  const result = await supabase
    .from("ai_insights")
    .select("*")
    .eq("insight_type", periodType)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .maybeSingle();

  if (result.error) {
    return { error: result.error, report: null };
  }

  return {
    error: null,
    report: isReportRow(result.data) ? result.data : null,
  };
}

async function buildSourceSnapshot(entries: JournalEntryRow[]) {
  const sortedParts = entries
    .map((entry) => `${entry.id}:${entry.updated_at}`)
    .sort();
  const latestUpdatedAt =
    entries
      .map((entry) => entry.updated_at)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
  const bytes = new TextEncoder().encode(sortedParts.join("|"));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return { hash, latestUpdatedAt };
}

function buildNarrativePrompt({
  analytics,
  entries,
  periodEnd,
  periodStart,
  periodType,
}: {
  analytics: ReportAnalytics;
  entries: JournalEntryRow[];
  periodEnd: string;
  periodStart: string;
  periodType: AIInsightPeriodType;
}) {
  return `Requested report:
${periodType === "weekly" ? "Weekly reflection" : "Monthly reflection"}

Period:
${periodStart} to ${periodEnd}

Calculated analytics:
${JSON.stringify(analytics)}

Journal entries:
${entries.slice(0, maxDetailedEntries).map(formatEntryForPrompt).join("\n\n")}

Return valid JSON with exactly this shape:

{
  "overview": "string",
  "activities": ["string"],
  "emotionalJourney": "string",
  "emotionalFlow": ["string"],
  "enjoyed": ["string"],
  "challenges": ["string"],
  "wins": ["string"],
  "patterns": ["string"],
  "improvements": ["string"],
  "nextFocus": "string",
  "reflectionPrompt": "string or null",
  "dataQualityNote": "string or null"
}`;
}

function formatEntryForPrompt(entry: JournalEntryRow) {
  const tags = (entry.tags ?? []).slice(0, maxTagsPerEntry);

  return `ID: ${cleanSingleLine(entry.id)}
Date: ${cleanSingleLine(entry.created_at)}
Title: ${truncate(cleanSingleLine(entry.title), maxTitleLength) || "Untitled"}
Type: ${cleanSingleLine(entry.type)}
Mood: ${cleanSingleLine(entry.mood ?? "") || "Not selected"}
Tags: ${tags.length > 0 ? tags.map(cleanSingleLine).join(", ") : "None"}
Prompt: ${truncate(cleanSingleLine(entry.prompt ?? ""), maxPromptLength) || "Free writing"}
Content:
${truncate(entry.content.trim(), maxEntryContentLength)}`;
}

async function generateValidNarrative(
  prompt: string,
  analytics: ReportAnalytics,
) {
  const rawNarrative = await callAIProvider(prompt);
  const parsed = parseNarrativeResult(rawNarrative, analytics);

  if (!parsed.ok) {
    throw new AIProviderError(
      "The AI provider returned invalid narrative JSON.",
      "invalid_narrative_response",
    );
  }

  return parsed.narrative;
}

async function callAIProvider(finalPrompt: string) {
  const apiKey =
    Deno.env.get("AI_API_KEY") ??
    Deno.env.get("GEMINI_API_KEY") ??
    Deno.env.get("OPENROUTER_API_KEY") ??
    Deno.env.get("OPENAI_API_KEY");
  const baseUrl = Deno.env.get("AI_BASE_URL")?.replace(/\/+$/, "");
  const model = Deno.env.get("AI_MODEL")?.trim();

  if (!apiKey || !baseUrl || !model) {
    throw new AIProviderError(
      "The AI provider is not configured.",
      "provider_not_configured",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      body: JSON.stringify({
        messages: [
          { content: systemPrompt, role: "system" },
          { content: finalPrompt, role: "user" },
        ],
        max_tokens: 1400,
        model,
        temperature: 0.45,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    if (!response.ok) {
      const providerCode = await getProviderErrorCode(response);

      throw new AIProviderError(
        "The AI provider rejected the request.",
        providerCode,
        response.status,
      );
    }

    const body: unknown = await response.json();
    const providerMessage = getProviderMessage(body);
    const content = providerMessage?.content.trim();

    if (providerMessage?.finishReason === "length") {
      throw new AIProviderError(
        "The AI provider response was cut off.",
        "provider_response_truncated",
      );
    }

    if (!content) {
      throw new AIProviderError(
        "The AI provider returned an invalid response.",
        "invalid_provider_response",
      );
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function parseNarrativeResult(
  value: string,
  analytics: ReportAnalytics,
): { narrative: ReportNarrative; ok: true } | { ok: false } {
  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(stripJsonCodeFence(value));
  } catch {
    return { ok: false };
  }

  if (!isRecord(parsedValue)) {
    return { ok: false };
  }

  const overview = getRequiredString(parsedValue.overview, 700);
  const emotionalJourney = getRequiredString(parsedValue.emotionalJourney, 700);
  const nextFocus = getRequiredString(parsedValue.nextFocus, 320);

  if (!overview || !emotionalJourney || !nextFocus) {
    return { ok: false };
  }

  const dataQualityNote =
    analytics.dataWasCapped
      ? "This report was generated from the first 250 entries in the selected period."
      : getNullableString(parsedValue.dataQualityNote, 280);

  return {
    narrative: {
      activities: getStringArray(parsedValue.activities, 8, 180),
      challenges: getStringArray(parsedValue.challenges, 6, 220),
      dataQualityNote,
      emotionalFlow: getStringArray(parsedValue.emotionalFlow, 6, 80),
      emotionalJourney,
      enjoyed: getStringArray(parsedValue.enjoyed, 6, 180),
      improvements: getStringArray(parsedValue.improvements, 5, 220),
      nextFocus,
      overview,
      patterns: getStringArray(parsedValue.patterns, 6, 240),
      reflectionPrompt: getNullableString(parsedValue.reflectionPrompt, 260),
      wins: getStringArray(parsedValue.wins, 6, 180),
    },
    ok: true,
  };
}

function mapReportRow(row: AIInsightReportRow) {
  if (!isRecord(row.report_data)) {
    return null;
  }

  const reportData = row.report_data;

  if (reportData.formatVersion !== reportFormatVersion) {
    return null;
  }

  if (!isRecord(reportData.analytics) || !isRecord(reportData.narrative)) {
    return null;
  }

  const analytics = reportData.analytics as unknown as ReportAnalytics;
  const narrative = reportData.narrative as unknown as ReportNarrative;

  return {
    analytics,
    createdAt: row.created_at,
    formatVersion: reportFormatVersion,
    id: row.id,
    model: row.model,
    narrative,
    periodEnd: row.period_end,
    periodStart: row.period_start,
    periodType: row.insight_type,
    relatedEntryIds: row.related_entry_ids ?? [],
    sourceEntryCount: row.source_entry_count ?? analytics.totalEntries,
    sourceLatestUpdatedAt: row.source_latest_updated_at,
    sourceSnapshotHash: row.source_snapshot_hash ?? "",
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

async function getProviderErrorCode(response: Response) {
  try {
    const body: unknown = await response.json();

    if (isRecord(body) && isRecord(body.error)) {
      if (typeof body.error.status === "string") {
        return body.error.status.toLowerCase();
      }

      if (typeof body.error.code === "string") {
        return body.error.code;
      }
    }
  } catch {
    return `provider_http_${response.status}`;
  }

  return `provider_http_${response.status}`;
}

function getProviderMessage(body: unknown) {
  if (!isRecord(body) || !Array.isArray(body.choices)) {
    return null;
  }

  const firstChoice: unknown = body.choices[0];

  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return null;
  }

  const message = firstChoice.message;

  if (message.role !== "assistant" || typeof message.content !== "string") {
    return null;
  }

  return {
    content: message.content,
    finishReason:
      typeof firstChoice.finish_reason === "string"
        ? firstChoice.finish_reason
        : null,
  };
}

function isJournalEntryRow(value: unknown): value is JournalEntryRow {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    (value.mood === null || typeof value.mood === "string") &&
    typeof value.type === "string" &&
    (value.prompt === null || typeof value.prompt === "string") &&
    (value.tags === undefined ||
      value.tags === null ||
      (Array.isArray(value.tags) &&
        value.tags.every((tag) => typeof tag === "string"))) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isReportRow(value: unknown): value is AIInsightReportRow {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.user_id === "string" &&
    typeof value.insight_type === "string" &&
    typeof value.period_start === "string" &&
    typeof value.period_end === "string" &&
    (value.related_entry_ids === null ||
      (Array.isArray(value.related_entry_ids) &&
        value.related_entry_ids.every((id) => typeof id === "string"))) &&
    (value.source_entry_count === null ||
      typeof value.source_entry_count === "number") &&
    (value.source_latest_updated_at === null ||
      typeof value.source_latest_updated_at === "string") &&
    (value.source_snapshot_hash === null ||
      typeof value.source_snapshot_hash === "string") &&
    (value.format_version === null || typeof value.format_version === "number") &&
    (value.model === null || typeof value.model === "string") &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function getBearerToken(authorization: string) {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  return token || null;
}

function parseJwtClaims(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const claims: unknown = JSON.parse(atob(paddedPayload));

    if (!isRecord(claims) || typeof claims.sub !== "string") {
      return null;
    }

    return { sub: claims.sub };
  } catch {
    return null;
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status,
  });
}

function cleanSingleLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const truncated = value.slice(0, maxLength).trimEnd();
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > Math.floor(maxLength * 0.7)) {
    return `${truncated.slice(0, lastSpaceIndex).trimEnd()}…`;
  }

  return `${truncated}…`;
}

function stripJsonCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function getRequiredString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = sanitizeNarrativeText(value, maxLength);

  return isCompleteNarrativeText(trimmedValue) ? trimmedValue : null;
}

function getNullableString(value: unknown, maxLength: number) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = sanitizeNarrativeText(value, maxLength);

  return isCompleteNarrativeText(trimmedValue) ? trimmedValue : null;
}

function getStringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => sanitizeNarrativeText(item, maxLength))
    .filter(isCompleteNarrativeText)
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeNarrativeText(value: string, maxLength: number) {
  return truncate(value.replace(/\s+/g, " ").trim(), maxLength);
}

function isCompleteNarrativeText(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return false;
  }

  if (/[,;:]$/.test(trimmedValue) || /\.{3}$/.test(trimmedValue)) {
    return false;
  }

  const lastWord = trimmedValue.match(/[A-Za-z]+[.!?"]?$/)?.[0]
    .replace(/[.!?"]+$/g, "")
    .toLowerCase();

  return !lastWord || !danglingEndingWords.has(lastWord);
}

function createReportId() {
  return `insight_report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMissingTagsColumnError(error: { code?: string; message?: string }) {
  return (
    error.code === "42703" &&
    (error.message ?? "").includes("journal_entries.tags")
  );
}

function isMissingReportTableError(error: { code?: string }) {
  return error.code === "PGRST205" || error.code === "42P01";
}
