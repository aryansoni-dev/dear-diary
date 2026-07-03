export type AppEnvironment = "development" | "preview" | "production";

export type PublicEnvironment = {
  accountDeletionUrl: string | null;
  appEnvironment: AppEnvironment;
  clerkPublishableKey: string;
  supabasePublicKey: string;
  supabaseUrl: string;
};

type PublicEnvironmentResult =
  | {
      environment: PublicEnvironment;
      isValid: true;
    }
  | {
      developerMessage: string;
      isValid: false;
    };

const rawAppEnvironment = process.env.EXPO_PUBLIC_APP_ENV?.trim();
const rawClerkPublishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
const rawSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const rawSupabasePublicKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
const rawAccountDeletionUrl =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL?.trim();

export const publicEnvironmentResult = validatePublicEnvironment();

function validatePublicEnvironment(): PublicEnvironmentResult {
  const issues: string[] = [];
  const appEnvironment = getAppEnvironment(rawAppEnvironment);

  if (!appEnvironment) {
    issues.push(
      "EXPO_PUBLIC_APP_ENV must be development, preview, or production.",
    );
  }

  if (!rawClerkPublishableKey) {
    issues.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");
  } else if (!isClerkPublishableKey(rawClerkPublishableKey)) {
    issues.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not a publishable key.");
  } else if (
    appEnvironment === "preview" &&
    rawClerkPublishableKey.startsWith("pk_live_")
  ) {
    issues.push("Preview must use a non-production Clerk publishable key.");
  }

  if (!rawSupabaseUrl) {
    issues.push("EXPO_PUBLIC_SUPABASE_URL is required.");
  } else if (!isAllowedUrl(rawSupabaseUrl, appEnvironment)) {
    issues.push("EXPO_PUBLIC_SUPABASE_URL must be a valid HTTPS URL.");
  }

  if (!rawSupabasePublicKey) {
    issues.push("EXPO_PUBLIC_SUPABASE_ANON_KEY is required.");
  }

  if (
    rawAccountDeletionUrl &&
    !isAllowedUrl(rawAccountDeletionUrl, appEnvironment)
  ) {
    issues.push(
      "EXPO_PUBLIC_ACCOUNT_DELETION_URL must be a valid HTTPS URL when set.",
    );
  }

  if (
    issues.length > 0 ||
    !appEnvironment ||
    !rawClerkPublishableKey ||
    !rawSupabaseUrl ||
    !rawSupabasePublicKey
  ) {
    return {
      developerMessage: issues.join(" "),
      isValid: false,
    };
  }

  return {
    environment: {
      accountDeletionUrl: rawAccountDeletionUrl || null,
      appEnvironment,
      clerkPublishableKey: rawClerkPublishableKey,
      supabasePublicKey: rawSupabasePublicKey,
      supabaseUrl: rawSupabaseUrl,
    },
    isValid: true,
  };
}

function getAppEnvironment(value: string | undefined) {
  if (
    value === "development" ||
    value === "preview" ||
    value === "production"
  ) {
    return value;
  }

  return null;
}

function isClerkPublishableKey(value: string) {
  return value.startsWith("pk_test_") || value.startsWith("pk_live_");
}

function isAllowedUrl(
  value: string,
  appEnvironment: AppEnvironment | null,
) {
  try {
    const url = new URL(value);

    if (url.protocol === "https:") {
      return true;
    }

    return (
      appEnvironment === "development" &&
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}
