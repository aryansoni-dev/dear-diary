import { createClient } from "@supabase/supabase-js";

export type SupabaseAccessTokenProvider = () => Promise<string | null>;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

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
      "Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (!accessTokenProvider) {
    throw new SupabaseConfigurationError(
      "Supabase authentication is not configured for the current Clerk session.",
    );
  }

  return supabase;
}
