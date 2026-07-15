export type AppEnvironment = "development" | "preview" | "production";

export type PublicEnvironment = {
  accountDeletionUrl: string | null;
  appEnvironment: AppEnvironment;
  clerkPublishableKey: string;
  revenueCatAndroidApiKey: string | null;
  revenueCatIosApiKey: string | null;
  supabasePublicKey: string;
  supabaseUrl: string;
};

export type PublicEnvironmentInput = {
  accountDeletionUrl?: string;
  appEnvironment?: string;
  clerkPublishableKey?: string;
  revenueCatAndroidApiKey?: string;
  revenueCatIosApiKey?: string;
  supabasePublicKey?: string;
  supabaseUrl?: string;
};

export type PublicEnvironmentResult =
  | {
      environment: PublicEnvironment;
      isValid: true;
    }
  | {
      developerMessage: string;
      isValid: false;
    };

export const publicEnvironmentResult = validatePublicEnvironment({
  accountDeletionUrl: process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL,
  appEnvironment: process.env.EXPO_PUBLIC_APP_ENV,
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  revenueCatAndroidApiKey:
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  supabasePublicKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
});

export function getPublicEnvironment(): PublicEnvironment | null {
  return publicEnvironmentResult.isValid
    ? publicEnvironmentResult.environment
    : null;
}

export function validatePublicEnvironment(
  input: PublicEnvironmentInput,
): PublicEnvironmentResult {
  const issues: string[] = [];
  const rawAccountDeletionUrl = input.accountDeletionUrl?.trim();
  const rawAppEnvironment = input.appEnvironment?.trim();
  const rawClerkPublishableKey = input.clerkPublishableKey?.trim();
  const rawRevenueCatAndroidApiKey = input.revenueCatAndroidApiKey?.trim();
  const rawRevenueCatIosApiKey = input.revenueCatIosApiKey?.trim();
  const rawSupabasePublicKey = input.supabasePublicKey?.trim();
  const rawSupabaseUrl = input.supabaseUrl?.trim();
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
  } else if (
    appEnvironment === "production" &&
    rawClerkPublishableKey.startsWith("pk_test_")
  ) {
    issues.push("Production must use a production Clerk publishable key.");
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
      revenueCatAndroidApiKey: rawRevenueCatAndroidApiKey || null,
      revenueCatIosApiKey: rawRevenueCatIosApiKey || null,
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
