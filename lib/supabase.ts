import { createClient } from "@supabase/supabase-js";

import { getPublicEnvironment } from "@/lib/environment";

export type SupabaseAccessTokenProvider = () => Promise<string | null>;

const publicEnvironment = getPublicEnvironment();
const supabaseUrl = publicEnvironment?.supabaseUrl;
const supabaseAnonKey = publicEnvironment?.supabasePublicKey;

let accessTokenProvider: SupabaseAccessTokenProvider | null = null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        async accessToken() {
          return accessTokenProvider?.() ?? null;
        },
      })
    : null;

export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigurationError";
  }
}

export function setSupabaseAccessTokenProvider(
  provider: SupabaseAccessTokenProvider | null,
) {
  accessTokenProvider = provider;
}

export function getSupabaseAccessTokenProvider() {
  return accessTokenProvider;
}

export function getAuthenticatedSupabaseClient() {
  if (!supabase) {
    throw new SupabaseConfigurationError(
      "Supabase client configuration is unavailable.",
    );
  }

  if (!accessTokenProvider) {
    throw new SupabaseConfigurationError(
      "Supabase authentication is not configured for the current Clerk session.",
    );
  }

  return supabase;
}
