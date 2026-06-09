import { isClerkAPIResponseError } from "@clerk/expo";
import { router } from "expo-router";
import type { Href } from "expo-router";
import { Alert } from "react-native";

export type FieldFeedback = {
  message: string;
  tone: "error" | "success";
};

export const homeHref = "/home-tab" as Href;
export const minimumPasswordLength = 12;

export function getEmailFeedback(email: string): FieldFeedback | undefined {
  if (!email) {
    return undefined;
  }

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return { message: "Enter a valid email address.", tone: "error" };
  }

  return { message: "Email looks good.", tone: "success" };
}

export function getPasswordFeedback(
  password: string,
  isLogin: boolean,
): FieldFeedback | undefined {
  if (!password) {
    return undefined;
  }

  if (isLogin) {
    return undefined;
  }

  if (password.length < minimumPasswordLength) {
    return {
      message: `Password must be at least ${minimumPasswordLength} characters long.`,
      tone: "error",
    };
  }

  const strengthChecks = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  if (!strengthChecks.every(Boolean)) {
    return {
      message:
        "Password must include uppercase, lowercase, number, and special symbol.",
      tone: "error",
    };
  }

  return { message: "Strong password.", tone: "success" };
}

export function getClerkErrorMessage(error: unknown) {
  if (isClerkAPIResponseError(error)) {
    return (
      error.errors[0]?.longMessage ??
      error.errors[0]?.message ??
      "Something went wrong. Please try again."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function showAuthError(message: string) {
  Alert.alert("Authentication error", message);
}

export async function finalizeAuth(resource: {
  finalize: (params: {
    navigate: (params: {
      session: { currentTask?: { key?: string } } | null;
    }) => void;
  }) => Promise<{ error: unknown | null }>;
}) {
  const { error } = await resource.finalize({
    navigate: ({ session }) => {
      if (session?.currentTask) {
        showAuthError(
          "Your account needs one more setup step before opening.",
        );
        return;
      }

      router.replace(homeHref);
    },
  });

  if (error) {
    showAuthError(getClerkErrorMessage(error));
  }
}
