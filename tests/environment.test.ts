// @ts-expect-error Node's built-in TypeScript runner requires an explicit extension.
import { type PublicEnvironmentInput, validatePublicEnvironment } from "../lib/environment.ts";

const validDevelopmentInput: PublicEnvironmentInput = {
  appEnvironment: "development",
  clerkPublishableKey: "pk_test_example",
  supabasePublicKey: "example-public-key",
  supabaseUrl: "https://example.supabase.co",
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertInvalid(
  input: PublicEnvironmentInput,
  expectedMessages: string[],
) {
  const result = validatePublicEnvironment(input);

  assert(!result.isValid, "Expected environment validation to fail.");

  expectedMessages.forEach((message) => {
    assert(
      result.developerMessage.includes(message),
      `Expected developer message to include: ${message}`,
    );
  });
}

assertInvalid({}, [
  "EXPO_PUBLIC_APP_ENV",
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
]);

assertInvalid(
  {
    ...validDevelopmentInput,
    appEnvironment: "staging",
    clerkPublishableKey: "sk_not_public",
  },
  [
    "EXPO_PUBLIC_APP_ENV",
    "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not a publishable key.",
  ],
);

assertInvalid(
  {
    ...validDevelopmentInput,
    accountDeletionUrl: "http://example.com/delete",
    supabaseUrl: "not-a-url",
  },
  [
    "EXPO_PUBLIC_SUPABASE_URL must be a valid HTTPS URL.",
    "EXPO_PUBLIC_ACCOUNT_DELETION_URL must be a valid HTTPS URL when set.",
  ],
);

assertInvalid(
  {
    ...validDevelopmentInput,
    appEnvironment: "preview",
    clerkPublishableKey: "pk_live_example",
  },
  ["Preview must use a non-production Clerk publishable key."],
);

assertInvalid(
  {
    ...validDevelopmentInput,
    appEnvironment: "production",
  },
  ["Production must use a production Clerk publishable key."],
);

const localDevelopmentResult = validatePublicEnvironment({
  ...validDevelopmentInput,
  accountDeletionUrl: "http://127.0.0.1:3000/delete",
  supabaseUrl: "http://localhost:54321",
});

assert(
  localDevelopmentResult.isValid,
  "Development must allow localhost HTTP URLs.",
);

assertInvalid(
  {
    ...validDevelopmentInput,
    appEnvironment: "preview",
    supabaseUrl: "http://localhost:54321",
  },
  ["EXPO_PUBLIC_SUPABASE_URL must be a valid HTTPS URL."],
);

const productionResult = validatePublicEnvironment({
  accountDeletionUrl: "https://example.com/delete-account",
  appEnvironment: "production",
  clerkPublishableKey: "pk_live_example",
  supabasePublicKey: "production-public-key",
  supabaseUrl: "https://production.supabase.co",
});

assert(productionResult.isValid, "Expected production environment to be valid.");
assert(
  productionResult.environment.accountDeletionUrl ===
    "https://example.com/delete-account" &&
    productionResult.environment.appEnvironment === "production" &&
    productionResult.environment.clerkPublishableKey === "pk_live_example" &&
    productionResult.environment.supabasePublicKey === "production-public-key" &&
    productionResult.environment.supabaseUrl ===
      "https://production.supabase.co",
  "Expected the validated production environment shape to be preserved.",
);
