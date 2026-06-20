import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const systemPrompt = `You are DearDiary AI, a thoughtful journaling and self-reflection companion.

Analyze one journal entry and return a structured reflection.

Do not merely repeat or paraphrase the entry.

Identify:
- the main meaning of the entry
- emotions and emotional changes
- recurring or important themes
- one thoughtful observation the user may not have noticed
- one useful follow-up reflection question
- one gentle practical suggestion

Use only the entry provided.

Do not invent events, emotions, or facts.

Do not diagnose the user.

Do not provide medical advice.

Keep the tone warm, calm, specific, and non-judgmental.

Every string field must be complete. Do not leave any sentence or question unfinished.
Keep every prose field concise enough for a mobile card.

Return only one valid JSON object.
Do not wrap the JSON in markdown.
Do not include explanatory text before or after the JSON object.`;

const journalEntrySelectWithTags =
  "id,title,content,mood,type,prompt,tags,created_at,updated_at";
const journalEntrySelectWithoutTags =
  "id,title,content,mood,type,prompt,created_at,updated_at";
const maxEntryContentLength = 8000;
const maxTagCount = 10;
const maxEmotionsCount = 6;
const maxThemesCount = 6;
const maxReflectionAttempts = 3;
const maxReflectionTextLength = 220;

type ReflectOnEntryRequest = {
  entryId: string;
  regenerate?: boolean;
};

type JournalEntryRow = {
  content: string;
  created_at: string;
  id: string;
  mood: string | null;
  prompt: string | null;
  tags?: string[] | null;
  title: string;
  type: string;
  updated_at: string;
};

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

type ProviderMessage = {
  content: string;
  finishReason: string | null;
  role: "assistant";
};

type ValidReflectionResult = {
  emotions: string[];
  followUpQuestion: string;
  observation: string;
  suggestion: string;
  summary: string;
  themes: string[];
};

type ChatCompletionRequestBody = {
  max_tokens: number;
  messages: Array<{
    content: string;
    role: "system" | "user";
  }>;
  model: string;
  response_format?: { type: "json_object" };
  temperature: number;
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

  console.info("reflect-on-entry request_received", {
    method: request.method,
    requestId,
  });

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error: "Method not allowed.",
        code: "method_not_allowed",
        requestId,
      },
      405,
    );
  }

  const authorization = request.headers.get("Authorization")?.trim();
  const bearerToken = authorization ? getBearerToken(authorization) : null;

  if (!authorization || !bearerToken) {
    return jsonResponse(
      {
        error: "Authentication is required.",
        code: "unauthorized",
        requestId,
      },
      401,
    );
  }

  const claims = parseJwtClaims(bearerToken);

  if (!claims?.sub) {
    console.info("reflect-on-entry auth_claims_invalid", { requestId });

    return jsonResponse(
      {
        error: "Authentication is invalid.",
        code: "invalid_jwt",
        requestId,
      },
      401,
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(
      {
        error: "The journal service is not configured.",
        code: "supabase_not_configured",
        requestId,
      },
      500,
    );
  }

  const parsedRequest = await parseRequest(request);

  if (!parsedRequest.ok) {
    return jsonResponse(
      {
        error: parsedRequest.error,
        code: "invalid_request",
        requestId,
      },
      400,
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
  const { entryId, regenerate } = parsedRequest.data;
  const entryResult = await fetchJournalEntry(supabase, entryId);

  if (entryResult.error) {
    console.error("reflect-on-entry entry_query_failed", {
      code: entryResult.error.code,
      requestId,
    });

    return jsonResponse(
      {
        error: "Entry could not be loaded.",
        code: "entry_query_failed",
        requestId,
      },
      500,
    );
  }

  if (!entryResult.entry) {
    return jsonResponse(
      {
        error: "Entry not found.",
        code: "entry_not_found",
        requestId,
      },
      404,
    );
  }

  const existingResult = await supabase
    .from("entry_ai_reflections")
    .select("*")
    .eq("entry_id", entryId)
    .maybeSingle();

  if (existingResult.error) {
    if (isMissingReflectionTableError(existingResult.error)) {
      console.error("reflect-on-entry reflection_table_missing", {
        code: existingResult.error.code,
        requestId,
      });

      return jsonResponse(
        {
          error: "AI reflections are not configured yet.",
          code: "reflection_table_missing",
          requestId,
        },
        503,
      );
    }

    console.error("reflect-on-entry existing_reflection_query_failed", {
      code: existingResult.error.code,
      requestId,
    });

    return jsonResponse(
      {
        error: "Reflection could not be loaded.",
        code: "reflection_query_failed",
        requestId,
      },
      500,
    );
  }

  if (!regenerate && existingResult.data) {
    if (!isEntryAIReflectionRow(existingResult.data)) {
      return jsonResponse(
        {
          error: "Reflection data is invalid.",
          code: "invalid_reflection_data",
          requestId,
        },
        500,
      );
    }

    console.info("reflect-on-entry existing_reflection_returned", {
      requestId,
    });

    return jsonResponse({
      reflection: mapEntryAIReflectionRow(existingResult.data),
      requestId,
    });
  }

  let reflectionResult: ValidReflectionResult;

  try {
    reflectionResult = await generateValidReflection(entryResult.entry);
  } catch (error) {
    const providerError =
      error instanceof AIProviderError
        ? {
            code: error.code,
            name: error.name,
            status: error.status,
          }
        : {
            code: "unknown",
            name: error instanceof Error ? error.name : "UnknownError",
          };

    console.error("reflect-on-entry provider_failed", {
      ...providerError,
      requestId,
    });

    return jsonResponse(
      {
        error:
          error instanceof AIProviderError &&
          error.code === "invalid_reflection_response"
            ? "DearDiary AI returned an invalid reflection."
            : "The AI service is temporarily unavailable.",
        code:
          error instanceof AIProviderError &&
          error.code === "invalid_reflection_response"
            ? "invalid_ai_response"
            : "ai_provider_failed",
        requestId,
      },
      502,
    );
  }

  const model = Deno.env.get("AI_MODEL")?.trim() ?? null;
  const now = new Date().toISOString();
  const reflectionId = isEntryAIReflectionRow(existingResult.data)
    ? existingResult.data.id
    : createReflectionId();
  const upsertResult = await supabase
    .from("entry_ai_reflections")
    .upsert(
      {
        emotions: reflectionResult.emotions,
        entry_id: entryResult.entry.id,
        follow_up_question: reflectionResult.followUpQuestion,
        id: reflectionId,
        model,
        observation: reflectionResult.observation,
        source_entry_updated_at: entryResult.entry.updated_at,
        suggestion: reflectionResult.suggestion,
        summary: reflectionResult.summary,
        themes: reflectionResult.themes,
        updated_at: now,
        user_id: claims.sub,
      },
      { onConflict: "user_id,entry_id" },
    )
    .select("*")
    .single();

  if (upsertResult.error || !isEntryAIReflectionRow(upsertResult.data)) {
    console.error("reflect-on-entry reflection_upsert_failed", {
      code: upsertResult.error?.code,
      requestId,
    });

    return jsonResponse(
      {
        error: "Reflection could not be saved.",
        code: "reflection_upsert_failed",
        requestId,
      },
      500,
    );
  }

  console.info("reflect-on-entry reflection_saved", { requestId });

  return jsonResponse({
    reflection: mapEntryAIReflectionRow(upsertResult.data),
    requestId,
  });
});

async function parseRequest(
  request: Request,
): Promise<
  | { data: ReflectOnEntryRequest; ok: true }
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

  const forbiddenKeys = ["userId", "content", "title", "mood", "tags"];
  const hasForbiddenKey = forbiddenKeys.some((key) => key in body);

  if (hasForbiddenKey) {
    return { error: "Request body contains unsupported fields.", ok: false };
  }

  if (typeof body.entryId !== "string") {
    return { error: "Entry ID is required.", ok: false };
  }

  const entryId = body.entryId.trim();

  if (!entryId || entryId.length > 200) {
    return { error: "Entry ID is invalid.", ok: false };
  }

  if (
    body.regenerate !== undefined &&
    typeof body.regenerate !== "boolean"
  ) {
    return { error: "Regenerate flag is invalid.", ok: false };
  }

  return {
    data: {
      entryId,
      regenerate: body.regenerate,
    },
    ok: true,
  };
}

async function fetchJournalEntry(
  supabase: SupabaseClient,
  entryId: string,
): Promise<{
  entry: JournalEntryRow | null;
  error: { code?: string; message?: string } | null;
}> {
  const result = await supabase
    .from("journal_entries")
    .select(journalEntrySelectWithTags)
    .eq("id", entryId)
    .is("deleted_at", null)
    .maybeSingle();

  if (result.error && isMissingTagsColumnError(result.error)) {
    const fallbackResult = await supabase
      .from("journal_entries")
      .select(journalEntrySelectWithoutTags)
      .eq("id", entryId)
      .is("deleted_at", null)
      .maybeSingle();

    if (fallbackResult.error) {
      return { entry: null, error: fallbackResult.error };
    }

    return {
      entry: isJournalEntryRow(fallbackResult.data)
        ? fallbackResult.data
        : null,
      error: null,
    };
  }

  if (result.error) {
    return { entry: null, error: result.error };
  }

  return {
    entry: isJournalEntryRow(result.data) ? result.data : null,
    error: null,
  };
}

function buildUserPrompt(entry: JournalEntryRow) {
  const content = truncateEntryContent(entry.content);
  const tags = (entry.tags ?? []).slice(0, maxTagCount);
  const truncationNote =
    entry.content.length > maxEntryContentLength
      ? "\nNote: The content was truncated to fit the model context."
      : "";

  return `Journal entry:

Title:
${cleanSingleLine(entry.title) || "Untitled"}

Date:
${entry.created_at}

Type:
${cleanSingleLine(entry.type)}

Mood:
${cleanSingleLine(entry.mood ?? "") || "Not selected"}

Tags:
${tags.length > 0 ? tags.map(cleanSingleLine).join(", ") : "None"}

Prompt:
${cleanSingleLine(entry.prompt ?? "") || "Free writing"}

Content:
${content}${truncationNote}

Return JSON with exactly these keys:

{
  "summary": string,
  "emotions": string[],
  "themes": string[],
  "observation": string,
  "followUpQuestion": string,
  "suggestion": string
}

Rules for the JSON values:
- summary, observation, followUpQuestion, and suggestion must be complete.
- summary, observation, followUpQuestion, and suggestion must each be 220 characters or fewer.
- followUpQuestion must end with a question mark.
- summary, observation, and suggestion must end with punctuation.
- Do not end any field with an unfinished phrase like "in your", "with", "to", "for", or "...".`;
}

async function generateValidReflection(entry: JournalEntryRow) {
  const basePrompt = buildUserPrompt(entry);

  for (let attempt = 1; attempt <= maxReflectionAttempts; attempt += 1) {
    const aiMessage = await callAIProvider(
      attempt === 1 ? basePrompt : buildRetryPrompt(basePrompt),
    );
    const parsedReflection = parseReflectionResult(aiMessage);

    if (parsedReflection.ok) {
      return parsedReflection.result;
    }

    console.error("reflect-on-entry invalid_ai_json", {
      attempt,
      reason: parsedReflection.reason,
    });
  }

  throw new AIProviderError(
    "The AI provider returned invalid reflection JSON.",
    "invalid_reflection_response",
  );
}

function buildRetryPrompt(basePrompt: string) {
  return `${basePrompt}

Your previous response was rejected because at least one field was incomplete, too long, or invalid.
Return shorter valid JSON now.
Use one complete sentence for each prose field.
Do not end with filler, ellipses, commas, or dangling prepositions.`;
}

async function callAIProvider(finalPrompt: string) {
  const apiKey = Deno.env.get("AI_API_KEY");
  const baseUrl = Deno.env.get("AI_BASE_URL")?.replace(/\/+$/, "");
  const model = Deno.env.get("AI_MODEL")?.trim();

  if (!apiKey || !baseUrl || !model) {
    throw new AIProviderError(
      "The AI provider is not configured.",
      "provider_not_configured",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const requestBody: ChatCompletionRequestBody = {
      messages: [
        { content: systemPrompt, role: "system" },
        { content: finalPrompt, role: "user" },
      ],
      max_tokens: 1000,
      model,
      temperature: 0.2,
    };

    if (supportsJsonObjectResponseFormat(baseUrl)) {
      // Only send JSON mode to providers that document this OpenAI-compatible parameter.
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      body: JSON.stringify(requestBody),
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

function supportsJsonObjectResponseFormat(baseUrl: string) {
  const hostname = getProviderHostname(baseUrl);

  return (
    hostname === "api.openai.com" ||
    hostname === "api.groq.com" ||
    hostname === "api.openrouter.ai" ||
    hostname === "openrouter.ai" ||
    hostname.endsWith(".openai.azure.com")
  );
}

function getProviderHostname(baseUrl: string) {
  try {
    return new URL(baseUrl).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function parseReflectionResult(
  value: string,
):
  | { ok: true; result: ValidReflectionResult }
  | { ok: false; reason: string } {
  const parsedValue = parseJsonObjectFromText(value);

  if (!parsedValue) {
    return { ok: false, reason: "invalid_json" };
  }

  const summary = getReflectionText(parsedValue.summary, "punctuation");
  const observation = getReflectionText(
    parsedValue.observation,
    "punctuation",
  );
  const followUpQuestion = getReflectionText(
    parsedValue.followUpQuestion ?? parsedValue.follow_up_question,
    "question",
  );
  const suggestion = getReflectionText(parsedValue.suggestion, "punctuation");
  const emotions = getTrimmedStringArray(parsedValue.emotions).slice(
    0,
    maxEmotionsCount,
  );
  const themes = getTrimmedStringArray(parsedValue.themes).slice(
    0,
    maxThemesCount,
  );

  if (!summary) {
    return { ok: false, reason: "invalid_summary" };
  }

  if (!observation) {
    return { ok: false, reason: "invalid_observation" };
  }

  if (!followUpQuestion) {
    return { ok: false, reason: "invalid_follow_up_question" };
  }

  if (!suggestion) {
    return { ok: false, reason: "invalid_suggestion" };
  }

  return {
    ok: true,
    result: {
      emotions,
      followUpQuestion,
      observation,
      suggestion,
      summary,
      themes,
    },
  };
}

function parseJsonObjectFromText(value: string) {
  const cleanedValue = stripJsonCodeFence(value);

  try {
    const parsedValue: unknown = JSON.parse(cleanedValue);

    return isRecord(parsedValue) ? parsedValue : null;
  } catch {
    const objectStartIndex = cleanedValue.indexOf("{");
    const objectEndIndex = cleanedValue.lastIndexOf("}");

    if (objectStartIndex < 0 || objectEndIndex <= objectStartIndex) {
      return null;
    }

    try {
      const parsedValue: unknown = JSON.parse(
        cleanedValue.slice(objectStartIndex, objectEndIndex + 1),
      );

      return isRecord(parsedValue) ? parsedValue : null;
    } catch {
      return null;
    }
  }
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

    if (Array.isArray(body)) {
      const firstError: unknown = body[0];

      if (
        isRecord(firstError) &&
        isRecord(firstError.error) &&
        typeof firstError.error.status === "string"
      ) {
        return firstError.error.status.toLowerCase();
      }
    }
  } catch {
    return `provider_http_${response.status}`;
  }

  return `provider_http_${response.status}`;
}

function getProviderMessage(body: unknown): ProviderMessage | null {
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
    role: "assistant",
  };
}

function mapEntryAIReflectionRow(row: EntryAIReflectionRow) {
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

function createReflectionId() {
  return `reflection_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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

    return {
      sub: claims.sub,
    };
  } catch {
    return null;
  }
}

function isJournalEntryRow(value: unknown): value is JournalEntryRow {
  if (!isRecord(value)) {
    return false;
  }

  return (
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

function isEntryAIReflectionRow(value: unknown): value is EntryAIReflectionRow {
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

function getTrimmedStringArray(value: unknown) {
  const sourceValues =
    typeof value === "string"
      ? value.split(",")
      : Array.isArray(value)
        ? value
        : [];

  return sourceValues
    .filter((item): item is string => typeof item === "string")
    .map((item) => cleanSingleLine(item))
    .filter(Boolean);
}

function getReflectionText(
  value: unknown,
  terminal: "punctuation" | "question",
) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = cleanSingleLine(value);

  if (!trimmedValue) {
    return null;
  }

  const sanitizedValue = ensureReflectionTerminal(
    truncateReflectionText(trimmedValue, maxReflectionTextLength),
    terminal,
  );

  if (!sanitizedValue || isIncompleteReflectionText(sanitizedValue)) {
    return null;
  }

  return sanitizedValue;
}

function truncateReflectionText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sentenceEndMatch = value
    .slice(0, maxLength + 1)
    .match(/^([\s\S]*[.!?।])(?:\s|$)/);

  if (sentenceEndMatch?.[1]) {
    return sentenceEndMatch[1].trim();
  }

  const truncatedValue = value.slice(0, maxLength).trimEnd();
  const lastSpaceIndex = truncatedValue.lastIndexOf(" ");

  if (lastSpaceIndex > Math.floor(maxLength * 0.7)) {
    return truncatedValue.slice(0, lastSpaceIndex).trimEnd();
  }

  return truncatedValue;
}

function ensureReflectionTerminal(
  value: string,
  terminal: "punctuation" | "question",
) {
  if (terminal === "question") {
    if (value.endsWith("?")) {
      return value;
    }

    if (hasTerminalPunctuation(value)) {
      return null;
    }

    return looksLikeQuestion(value) ? appendTerminal(value, "?") : null;
  }

  return hasTerminalPunctuation(value) ? value : appendTerminal(value, ".");
}

function appendTerminal(value: string, terminal: "." | "?") {
  if (value.length < maxReflectionTextLength) {
    return `${value}${terminal}`;
  }

  return `${truncateReflectionText(
    value,
    maxReflectionTextLength - terminal.length,
  )}${terminal}`;
}

function looksLikeQuestion(value: string) {
  return /^(what|when|where|why|how|who|which|could|would|can|do|does|did|is|are|was|were|have|has|had|might|may|will|should)\b/i.test(
    value,
  );
}

function hasTerminalPunctuation(value: string) {
  return /[.!?।]$/.test(value.trim());
}

function isIncompleteReflectionText(value: string) {
  const trimmedValue = value.trim();

  if (
    trimmedValue.length > maxReflectionTextLength ||
    /(\.\.\.|…)$/.test(trimmedValue) ||
    /[,;:]$/.test(trimmedValue)
  ) {
    return true;
  }

  const normalizedWords =
    trimmedValue
      .toLowerCase()
      .replace(/[.!?।]+$/g, "")
      .match(/[a-z0-9']+/g) ?? [];
  const lastWord = normalizedWords.at(-1);

  if (!lastWord) {
    return true;
  }

  return danglingEndingWords.has(lastWord);
}

const danglingEndingWords = new Set([
  "a",
  "about",
  "after",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "by",
  "can",
  "could",
  "for",
  "from",
  "her",
  "his",
  "in",
  "into",
  "is",
  "it",
  "its",
  "may",
  "might",
  "my",
  "of",
  "on",
  "or",
  "our",
  "should",
  "that",
  "the",
  "their",
  "these",
  "this",
  "those",
  "through",
  "to",
  "was",
  "were",
  "which",
  "will",
  "with",
  "would",
  "your",
]);

function stripJsonCodeFence(value: string) {
  const trimmedValue = value.trim();
  const fenceMatch = trimmedValue.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);

  return fenceMatch?.[1]?.trim() ?? trimmedValue;
}

function cleanSingleLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateEntryContent(value: string) {
  const cleanedValue = value.replace(/\s+/g, " ").trim();

  if (cleanedValue.length <= maxEntryContentLength) {
    return cleanedValue || "No written content.";
  }

  return cleanedValue.slice(0, maxEntryContentLength).trim();
}

function isMissingTagsColumnError(error: { code?: string; message?: string }) {
  return (
    (error.code === "42703" || error.code === "PGRST204") &&
    (error.message ?? "").includes("journal_entries.tags")
  );
}

function isMissingReflectionTableError(error: { code?: string }) {
  return error.code === "PGRST205" || error.code === "42P01";
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
