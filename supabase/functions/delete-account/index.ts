import { createClient } from "@supabase/supabase-js";
import { isRecord } from "../../../lib/utils/typeGuards.ts";

type AccountDeletionFailureCode =
  | "unauthenticated"
  | "verification_required"
  | "remote_data_deletion_failed"
  | "auth_account_deletion_failed"
  | "unknown";

type DeleteAccountFailureResponse = {
  code: AccountDeletionFailureCode;
  remoteDataDeleted?: boolean;
  requestId: string;
  retryable: boolean;
  success: false;
};

type JwtClaims = {
  sub: string;
};

const corsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const expectedConfirmationPhrase = "DELETE";
const clerkApiTimeoutMs = 10000;
const storageListPageLimit = 100;
const storageRemoveBatchSize = 1000;
const userOwnedStorageBuckets: string[] = [];

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        code: "unknown",
        requestId,
        retryable: false,
        success: false,
      },
      405,
    );
  }

  const authorization = request.headers.get("Authorization")?.trim();
  const bearerToken = authorization ? getBearerToken(authorization) : null;

  if (!bearerToken || !authorization) {
    return failureResponse(
      {
        code: "unauthenticated",
        requestId,
        retryable: false,
        success: false,
      },
      401,
    );
  }

  const claims = parseJwtClaims(bearerToken);

  if (!claims) {
    return failureResponse(
      {
        code: "unauthenticated",
        requestId,
        retryable: false,
        success: false,
      },
      401,
    );
  }

  const parsedRequest = await parseRequest(request);

  if (
    !parsedRequest.ok ||
    parsedRequest.confirmationPhrase !== expectedConfirmationPhrase
  ) {
    return failureResponse(
      {
        code: "verification_required",
        requestId,
        retryable: false,
        success: false,
      },
      400,
    );
  }

  const env = getRequiredEnvironment();

  if (!env.ok) {
    console.error("delete-account configuration_missing", {
      requestId,
      stage: "configuration",
    });

    return failureResponse(
      {
        code: "unknown",
        requestId,
        retryable: true,
        success: false,
      },
      500,
    );
  }

  const userClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
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
  const authProbe = await userClient
    .from("profiles")
    .select("id")
    .eq("id", claims.sub)
    .limit(1);

  if (authProbe.error) {
    console.info("delete-account token_rejected", {
      code: authProbe.error.code,
      requestId,
      stage: "authentication",
    });

    return failureResponse(
      {
        code: "unauthenticated",
        requestId,
        retryable: false,
        success: false,
      },
      401,
    );
  }

  const adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const storageResult = await deleteUserStorageObjects(adminClient, claims.sub);

  if (!storageResult.ok) {
    console.error("delete-account storage_cleanup_failed", {
      requestId,
      stage: "storage",
    });

    return failureResponse(
      {
        code: "remote_data_deletion_failed",
        requestId,
        retryable: true,
        success: false,
      },
      500,
    );
  }

  const databaseResult = await adminClient.rpc("delete_deardiary_user_data", {
    target_user_id: claims.sub,
  });

  if (databaseResult.error) {
    console.error("delete-account database_cleanup_failed", {
      code: databaseResult.error.code,
      requestId,
      stage: "database",
    });

    return failureResponse(
      {
        code: "remote_data_deletion_failed",
        requestId,
        retryable: true,
        success: false,
      },
      500,
    );
  }

  const clerkResult = await deleteClerkUser({
    clerkSecretKey: env.clerkSecretKey,
    requestId,
    userId: claims.sub,
  });

  if (!clerkResult.ok) {
    return failureResponse(
      {
        code: "auth_account_deletion_failed",
        remoteDataDeleted: true,
        requestId,
        retryable: true,
        success: false,
      },
      502,
    );
  }

  console.info("delete-account completed", {
    requestId,
    stage: "completed",
  });

  return jsonResponse(
    {
      requestId,
      success: true,
    },
    200,
  );
});

async function parseRequest(
  request: Request,
): Promise<
  | { confirmationPhrase: string; ok: true }
  | { ok: false }
> {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body) || typeof body.confirmationPhrase !== "string") {
      return { ok: false };
    }

    return {
      confirmationPhrase: body.confirmationPhrase,
      ok: true,
    };
  } catch {
    return { ok: false };
  }
}

function getRequiredEnvironment():
  | {
      clerkSecretKey: string;
      ok: true;
      supabaseAnonKey: string;
      supabaseServiceRoleKey: string;
      supabaseUrl: string;
    }
  | { ok: false } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY")?.trim() ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY")?.trim();
  const supabaseServiceRoleKey =
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ??
    Deno.env.get("SUPABASE_SECRET_KEY")?.trim() ??
    getDefaultSecretKey();
  const clerkSecretKey = Deno.env.get("CLERK_SECRET_KEY")?.trim();

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseServiceRoleKey ||
    !clerkSecretKey
  ) {
    return { ok: false };
  }

  return {
    clerkSecretKey,
    ok: true,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    supabaseUrl,
  };
}

function getDefaultSecretKey() {
  const rawSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (!rawSecretKeys) {
    return null;
  }

  try {
    const secretKeys: unknown = JSON.parse(rawSecretKeys);

    if (!isRecord(secretKeys) || typeof secretKeys.default !== "string") {
      return null;
    }

    return secretKeys.default.trim() || null;
  } catch {
    return null;
  }
}

async function deleteUserStorageObjects(
  client: ReturnType<typeof createClient>,
  userId: string,
) {
  for (const bucket of userOwnedStorageBuckets) {
    const result = await deleteStoragePrefix(client, bucket, userId, "");

    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}

async function deleteStoragePrefix(
  client: ReturnType<typeof createClient>,
  bucket: string,
  userId: string,
  path: string,
): Promise<{ ok: true } | { ok: false }> {
  const prefix = path ? `${userId}/${path}` : userId;
  const filesToRemove: string[] = [];
  const nestedPaths: string[] = [];
  let offset = 0;

  while (true) {
    const listResult = await client.storage.from(bucket).list(prefix, {
      limit: storageListPageLimit,
      offset,
    });

    if (listResult.error) {
      return { ok: false };
    }

    const items = listResult.data ?? [];

    for (const item of items) {
      const itemPath = path ? `${path}/${item.name}` : item.name;

      if (item.id === null) {
        nestedPaths.push(itemPath);
        continue;
      }

      filesToRemove.push(`${userId}/${itemPath}`);
    }

    if (items.length < storageListPageLimit) {
      break;
    }

    offset += storageListPageLimit;
  }

  for (const nestedPath of nestedPaths) {
    const nestedResult = await deleteStoragePrefix(
      client,
      bucket,
      userId,
      nestedPath,
    );

    if (!nestedResult.ok) {
      return nestedResult;
    }
  }

  if (filesToRemove.length === 0) {
    return { ok: true };
  }

  for (
    let index = 0;
    index < filesToRemove.length;
    index += storageRemoveBatchSize
  ) {
    const removeBatch = filesToRemove.slice(
      index,
      index + storageRemoveBatchSize,
    );
    const removeResult = await client.storage.from(bucket).remove(removeBatch);

    if (removeResult.error) {
      return { ok: false };
    }
  }

  return { ok: true };
}

async function deleteClerkUser({
  clerkSecretKey,
  requestId,
  userId,
}: {
  clerkSecretKey: string;
  requestId: string;
  userId: string;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), clerkApiTimeoutMs);

  try {
    const response = await fetch(
      `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
      {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
        },
        method: "DELETE",
        signal: controller.signal,
      },
    );

    if (response.ok || response.status === 404) {
      return { ok: true };
    }

    console.error("delete-account clerk_cleanup_failed", {
      requestId,
      stage: "auth_account",
      status: response.status,
    });

    return { ok: false };
  } catch (error) {
    console.error("delete-account clerk_cleanup_failed", {
      error: error instanceof Error ? error.name : "unknown",
      requestId,
      stage: "auth_account",
    });

    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

function getBearerToken(authorization: string) {
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  return token || null;
}

function parseJwtClaims(token: string): JwtClaims | null {
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

function failureResponse(body: DeleteAccountFailureResponse, status: number) {
  console.info("delete-account failed", {
    code: body.code,
    requestId: body.requestId,
    stage: "failed",
  });

  return jsonResponse(body, status);
}

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
    status,
  });
}
