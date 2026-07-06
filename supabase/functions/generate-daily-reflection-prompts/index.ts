const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const systemPrompt = `You are DearDiary AI, a warm and thoughtful journaling companion.

Generate exactly three concise journaling questions for one day: one morning question, one afternoon question, and one evening question.

Each question must:
- be open-ended, emotionally gentle, and useful for reflection
- be understandable without additional context
- be exactly one concise sentence and end with a question mark
- be distinct from the other two questions
- avoid diagnoses, medical or therapeutic claims, pressure, guilt, and judgment
- avoid assuming the user had a good or bad day
- avoid asking for sensitive disclosure
- avoid repeating its time-period label inside the question

Morning may focus on intention, energy, priorities, self-kindness, needs, or anticipation.
Afternoon may focus on the day so far, current energy, attention, unexpected moments, small wins, or what is needed next.
Evening may focus on reflection, lessons, memorable or difficult moments, letting go, or tomorrow without forcing positivity.

Return only one valid JSON object with this exact shape:
{"morning":"question","afternoon":"question","evening":"question"}

Do not wrap the JSON in markdown or add text before or after it.`;

const promptMinLength = 15;
const promptMaxLength = 160;
const providerTimeoutMs = 15_000;
const cacheLifetimeMs = 48 * 60 * 60 * 1000;
const periods = ["morning", "afternoon", "evening"] as const;
const unsafePromptPattern =
  /\b(anxi(?:ety|ous)|depress(?:ed|ion|ive)|diagnos(?:e|ed|is)|medical advice|self[- ]harm|suicid(?:e|al)|therap(?:y|ist|eutic)|trauma(?:tic)?|password|home address|bank account|credit card|financial information)\b/i;
const providerErrorPattern =
  /\b(error|bad gateway|rate limit|request failed|service unavailable|unauthorized)\b/i;

type DailyPrompts = Record<(typeof periods)[number], string>;

type GeneratePromptRequest = {
  dateKey: string;
  timezone: string;
};

type ChatCompletionRequestBody = {
  max_tokens: number;
  messages: {
    content: string;
    role: "system" | "user";
  }[];
  model: string;
  response_format?: { type: "json_object" };
  temperature: number;
};

type CachedPromptBundle = {
  expiresAt: number;
  prompts: DailyPrompts;
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

const cachedBundles = new Map<string, CachedPromptBundle>();
const inFlightRequests = new Map<string, Promise<DailyPrompts>>();

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { code: "method_not_allowed", error: "Method not allowed.", requestId },
      405,
    );
  }

  const authorization = request.headers.get("Authorization")?.trim();
  const bearerToken = authorization ? getBearerToken(authorization) : null;
  const claims = bearerToken ? parseJwtClaims(bearerToken) : null;

  if (!claims?.sub) {
    return jsonResponse(
      { code: "unauthorized", error: "Authentication is required.", requestId },
      401,
    );
  }

  const parsedRequest = await parseRequest(request);

  if (!parsedRequest.ok) {
    return jsonResponse(
      { code: "invalid_request", error: parsedRequest.error, requestId },
      400,
    );
  }

  const cacheKey = `${claims.sub}:${parsedRequest.data.dateKey}`;
  clearExpiredCacheEntries();
  const cachedBundle = cachedBundles.get(cacheKey);

  if (cachedBundle && cachedBundle.expiresAt > Date.now()) {
    return jsonResponse({ prompts: cachedBundle.prompts, requestId });
  }

  try {
    const prompts = await getOrCreatePromptBundle(
      cacheKey,
      parsedRequest.data,
    );

    return jsonResponse({ prompts, requestId });
  } catch (error) {
    const providerError =
      error instanceof AIProviderError
        ? { code: error.code, name: error.name, status: error.status }
        : {
            code: "unknown",
            name: error instanceof Error ? error.name : "UnknownError",
          };

    console.error("generate-daily-reflection-prompts provider_failed", {
      ...providerError,
      requestId,
    });

    return jsonResponse(
      {
        code:
          error instanceof AIProviderError &&
          error.code === "invalid_prompt_response"
            ? "invalid_ai_response"
            : "ai_provider_failed",
        error: "Daily reflection prompts could not be generated.",
        requestId,
      },
      502,
    );
  }
});

async function getOrCreatePromptBundle(
  cacheKey: string,
  request: GeneratePromptRequest,
) {
  const existingRequest = inFlightRequests.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const generationRequest = generatePromptBundle(request)
    .then((prompts) => {
      cachedBundles.set(cacheKey, {
        expiresAt: Date.now() + cacheLifetimeMs,
        prompts,
      });

      return prompts;
    })
    .finally(() => {
      if (inFlightRequests.get(cacheKey) === generationRequest) {
        inFlightRequests.delete(cacheKey);
      }
    });

  inFlightRequests.set(cacheKey, generationRequest);

  return generationRequest;
}

async function generatePromptBundle(request: GeneratePromptRequest) {
  const providerResponse = await callAIProvider(
    `Create a prompt bundle for local date ${request.dateKey} in timezone ${request.timezone}.`,
  );
  const parsedResponse = parsePromptBundle(providerResponse);

  if (!parsedResponse) {
    throw new AIProviderError(
      "The AI provider returned invalid prompt JSON.",
      "invalid_prompt_response",
    );
  }

  return parsedResponse;
}

async function callAIProvider(userPrompt: string) {
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
  const timeout = setTimeout(() => controller.abort(), providerTimeoutMs);

  try {
    const requestBody: ChatCompletionRequestBody = {
      max_tokens: 220,
      messages: [
        { content: systemPrompt, role: "system" },
        { content: userPrompt, role: "user" },
      ],
      model,
      temperature: 0.7,
    };

    if (supportsJsonObjectResponseFormat(baseUrl)) {
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
      throw new AIProviderError(
        "The AI provider rejected the request.",
        "provider_request_failed",
        response.status,
      );
    }

    const responseBody: unknown = await response.json();
    const content = getProviderContent(responseBody);

    if (!content) {
      throw new AIProviderError(
        "The AI provider returned an empty response.",
        "invalid_provider_response",
      );
    }

    return content;
  } finally {
    clearTimeout(timeout);
  }
}

function parsePromptBundle(value: string): DailyPrompts | null {
  if (value.includes("```") || value.length > 1000) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(value);

    if (!isRecord(parsedValue)) {
      return null;
    }

    const keys = Object.keys(parsedValue).sort();

    if (
      keys.length !== periods.length ||
      !periods.every((period) => keys.includes(period))
    ) {
      return null;
    }

    const promptValues = periods.map((period) => parsedValue[period]);

    if (!promptValues.every(isValidQuestion)) {
      return null;
    }

    const normalizedPrompts = promptValues.map((prompt) =>
      normalizePrompt(prompt as string),
    );

    if (
      new Set(normalizedPrompts).size !== periods.length ||
      hasNearDuplicate(normalizedPrompts)
    ) {
      return null;
    }

    return {
      afternoon: (parsedValue.afternoon as string).trim(),
      evening: (parsedValue.evening as string).trim(),
      morning: (parsedValue.morning as string).trim(),
    };
  } catch {
    return null;
  }
}

function isValidQuestion(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const prompt = value.trim();
  const questionMarkCount = [...prompt].filter(
    (character) => character === "?",
  ).length;

  return (
    prompt.length >= promptMinLength &&
    prompt.length <= promptMaxLength &&
    questionMarkCount === 1 &&
    prompt.endsWith("?") &&
    !/[.!]/.test(prompt.slice(0, -1)) &&
    !/[\r\n]/.test(prompt) &&
    !unsafePromptPattern.test(prompt) &&
    !providerErrorPattern.test(prompt)
  );
}

function hasNearDuplicate(prompts: string[]) {
  for (let firstIndex = 0; firstIndex < prompts.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < prompts.length;
      secondIndex += 1
    ) {
      if (getWordOverlap(prompts[firstIndex], prompts[secondIndex]) >= 0.8) {
        return true;
      }
    }
  }

  return false;
}

function getWordOverlap(firstPrompt: string, secondPrompt: string) {
  const firstWords = new Set(firstPrompt.split(" ").filter(Boolean));
  const secondWords = new Set(secondPrompt.split(" ").filter(Boolean));
  const smallerSet =
    firstWords.size <= secondWords.size ? firstWords : secondWords;
  const largerSet = smallerSet === firstWords ? secondWords : firstWords;
  let sharedWordCount = 0;

  smallerSet.forEach((word) => {
    if (largerSet.has(word)) {
      sharedWordCount += 1;
    }
  });

  return smallerSet.size === 0 ? 0 : sharedWordCount / smallerSet.size;
}

async function parseRequest(
  request: Request,
): Promise<
  | { data: GeneratePromptRequest; ok: true }
  | { error: string; ok: false }
> {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return { error: "A JSON request body is required.", ok: false };
    }

    const dateKey = typeof body.dateKey === "string" ? body.dateKey.trim() : "";
    const timezone =
      typeof body.timezone === "string" ? body.timezone.trim() : "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return { error: "A valid local date is required.", ok: false };
    }

    if (
      !timezone ||
      timezone.length > 100 ||
      !/^[A-Za-z0-9_+.-]+(?:\/[A-Za-z0-9_+.-]+)*$/.test(timezone)
    ) {
      return { error: "A valid timezone is required.", ok: false };
    }

    const expectedDateKey = getDateKeyForTimezone(timezone);

    if (!expectedDateKey || expectedDateKey !== dateKey) {
      return {
        error: "The local date does not match the supplied timezone.",
        ok: false,
      };
    }

    return { data: { dateKey, timezone }, ok: true };
  } catch {
    return { error: "A valid JSON request body is required.", ok: false };
  }
}

function getProviderContent(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.choices)) {
    return null;
  }

  const firstChoice = value.choices[0];

  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return null;
  }

  return typeof firstChoice.message.content === "string"
    ? firstChoice.message.content.trim()
    : null;
}

function supportsJsonObjectResponseFormat(baseUrl: string) {
  try {
    const hostname = new URL(baseUrl).hostname.toLowerCase();

    return (
      hostname === "api.openai.com" ||
      hostname === "api.groq.com" ||
      hostname === "api.openrouter.ai" ||
      hostname === "openrouter.ai" ||
      hostname.endsWith(".openai.azure.com")
    );
  } catch {
    return false;
  }
}

function clearExpiredCacheEntries() {
  const now = Date.now();

  cachedBundles.forEach((bundle, key) => {
    if (bundle.expiresAt <= now) {
      cachedBundles.delete(key);
    }
  });
}

function getDateKeyForTimezone(timezone: string) {
  try {
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: timezone,
      year: "numeric",
    }).formatToParts(new Date());
    const getPart = (type: "day" | "month" | "year") =>
      dateParts.find((part) => part.type === type)?.value;
    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");

    return year && month && day ? `${year}-${month}-${day}` : null;
  } catch {
    return null;
  }
}

function normalizePrompt(prompt: string) {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function getBearerToken(authorization: string) {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
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

    return isRecord(claims) && typeof claims.sub === "string"
      ? { sub: claims.sub }
      : null;
  } catch {
    return null;
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
