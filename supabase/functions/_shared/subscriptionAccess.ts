import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AIFeature =
  | "ai_chat"
  | "entry_reflection"
  | "weekly_report"
  | "monthly_report";

type FeatureLimit = {
  freeLimit: number;
  proLimit: number | null;
};

type UsageAccessAllowed = {
  isPro: boolean;
  ok: true;
  reservation: AIUsageReservation;
};

type UsageAccessDenied = {
  body: {
    code: string;
    feature: AIFeature;
    limit: number | null;
    period: "monthly";
    requestId: string;
  };
  ok: false;
  status: number;
};

type UsageRpcResult = {
  allowed: boolean;
  code: string;
  count: number;
  feature: AIFeature;
  limit: number | null;
  period: "monthly";
};

export type AIUsageReservation = {
  feature: AIFeature;
  periodKey: string;
  userId: string;
};

const entitlementId = "DearDiary Pro";
const revenueCatSubscriberEndpoint = "https://api.revenuecat.com/v1/subscribers";
const revenueCatFallbackTimeoutMs = 3_500;
const revenueCatFallbackCacheLifetimeMs = 5 * 60 * 1000;
const revenueCatFallbackCache = new Map<
  string,
  { expiresAt: number; isPro: boolean }
>();

const featureLimits: Record<AIFeature, FeatureLimit> = {
  ai_chat: {
    freeLimit: 10,
    proLimit: 300,
  },
  entry_reflection: {
    freeLimit: 3,
    proLimit: 100,
  },
  monthly_report: {
    freeLimit: 0,
    proLimit: null,
  },
  weekly_report: {
    freeLimit: 1,
    proLimit: null,
  },
};

export function getUTCPeriodKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export async function reserveAIUsageAccess(params: {
  feature: AIFeature;
  requestId: string;
  userId: string;
}): Promise<UsageAccessAllowed | UsageAccessDenied> {
  const serviceClientResult = getServiceClient();

  if (!serviceClientResult.ok) {
    return {
      body: {
        code: "USAGE_LEDGER_UNAVAILABLE",
        feature: params.feature,
        limit: featureLimits[params.feature].freeLimit,
        period: "monthly",
        requestId: params.requestId,
      },
      ok: false,
      status: 503,
    };
  }

  const serviceClient = serviceClientResult.client;
  const isPro = await resolveServerSideProEntitlement(
    serviceClient,
    params.userId,
  );
  const limit = featureLimits[params.feature];
  const periodKey = getUTCPeriodKey();
  const { data, error } = await serviceClient.rpc(
    "increment_ai_usage_if_allowed",
    {
      p_feature: params.feature,
      p_free_limit: limit.freeLimit,
      p_is_pro: isPro,
      p_period_key: periodKey,
      p_pro_limit: limit.proLimit,
      p_user_id: params.userId,
    },
  );

  if (error) {
    console.error("ai_usage_ledger_rpc_failed", {
      code: error.code,
      feature: params.feature,
      requestId: params.requestId,
    });

    return {
      body: {
        code: "USAGE_LEDGER_UNAVAILABLE",
        feature: params.feature,
        limit: isPro ? limit.proLimit : limit.freeLimit,
        period: "monthly",
        requestId: params.requestId,
      },
      ok: false,
      status: 503,
    };
  }

  const usageResult = parseUsageRpcResult(data, params.feature);

  if (!usageResult) {
    return {
      body: {
        code: "USAGE_LEDGER_UNAVAILABLE",
        feature: params.feature,
        limit: isPro ? limit.proLimit : limit.freeLimit,
        period: "monthly",
        requestId: params.requestId,
      },
      ok: false,
      status: 503,
    };
  }

  if (!usageResult.allowed) {
    return {
      body: {
        code: usageResult.code,
        feature: params.feature,
        limit: usageResult.limit,
        period: "monthly",
        requestId: params.requestId,
      },
      ok: false,
      status: 402,
    };
  }

  return {
    isPro,
    ok: true,
    reservation: {
      feature: params.feature,
      periodKey,
      userId: params.userId,
    },
  };
}

export async function finalizeAIUsageReservation(
  _reservation: AIUsageReservation,
) {
  return;
}

export async function releaseAIUsageReservation(
  reservation: AIUsageReservation,
  requestId: string,
) {
  const serviceClientResult = getServiceClient();

  if (!serviceClientResult.ok) {
    console.error("ai_usage_reservation_release_unavailable", {
      feature: reservation.feature,
      requestId,
    });
    return;
  }

  const { error } = await serviceClientResult.client.rpc(
    "release_ai_usage_reservation",
    {
      p_feature: reservation.feature,
      p_period_key: reservation.periodKey,
      p_user_id: reservation.userId,
    },
  );

  if (error) {
    console.error("ai_usage_reservation_release_failed", {
      code: error.code,
      feature: reservation.feature,
      requestId,
    });
  }
}

function getServiceClient():
  | { client: SupabaseClient; ok: true }
  | { ok: false } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return { ok: false };
  }

  return {
    client: createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
    ok: true,
  };
}

async function resolveServerSideProEntitlement(
  serviceClient: SupabaseClient,
  userId: string,
) {
  const mirroredStatus = await getMirroredProStatus(serviceClient, userId);

  if (mirroredStatus === true) {
    return true;
  }

  return getCachedRevenueCatProStatus(userId);
}

async function getMirroredProStatus(
  serviceClient: SupabaseClient,
  userId: string,
) {
  const { data, error } = await serviceClient
    .from("subscription_status")
    .select("is_active,expires_at")
    .eq("user_id", userId)
    .eq("entitlement_id", entitlementId)
    .maybeSingle();

  if (error || !isRecord(data)) {
    return null;
  }

  if (data.is_active !== true) {
    return false;
  }

  if (typeof data.expires_at !== "string") {
    return true;
  }

  const expiresAt = Date.parse(data.expires_at);

  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

async function getCachedRevenueCatProStatus(userId: string) {
  const cachedStatus = revenueCatFallbackCache.get(userId);

  if (cachedStatus && cachedStatus.expiresAt > Date.now()) {
    return cachedStatus.isPro;
  }

  const revenueCatStatus = await getRevenueCatProStatus(userId);
  const isPro = revenueCatStatus ?? false;

  revenueCatFallbackCache.set(userId, {
    expiresAt: Date.now() + revenueCatFallbackCacheLifetimeMs,
    isPro,
  });

  return isPro;
}

async function getRevenueCatProStatus(userId: string) {
  const revenueCatSecretKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");

  if (!revenueCatSecretKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    revenueCatFallbackTimeoutMs,
  );

  try {
    const response = await fetch(
      `${revenueCatSubscriberEndpoint}/${encodeURIComponent(userId)}`,
      {
        headers: {
          Authorization: `Bearer ${revenueCatSecretKey}`,
          "Content-Type": "application/json",
        },
        method: "GET",
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      return null;
    }

    const body: unknown = await response.json();

    return hasActiveRevenueCatEntitlement(body);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function hasActiveRevenueCatEntitlement(body: unknown) {
  if (!isRecord(body) || !isRecord(body.subscriber)) {
    return false;
  }

  const entitlements = body.subscriber.entitlements;

  if (!isRecord(entitlements)) {
    return false;
  }

  const proEntitlement = entitlements[entitlementId];

  if (!isRecord(proEntitlement)) {
    return false;
  }

  const expiresDate = proEntitlement.expires_date;

  if (expiresDate === null) {
    return true;
  }

  if (typeof expiresDate !== "string") {
    return false;
  }

  const expiresAt = Date.parse(expiresDate);

  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

function parseUsageRpcResult(
  value: unknown,
  feature: AIFeature,
): UsageRpcResult | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.allowed !== "boolean" ||
    typeof value.code !== "string" ||
    value.feature !== feature ||
    value.period !== "monthly"
  ) {
    return null;
  }

  return {
    allowed: value.allowed,
    code: value.code,
    count: typeof value.count === "number" ? value.count : 0,
    feature,
    limit: typeof value.limit === "number" ? value.limit : null,
    period: "monthly",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
