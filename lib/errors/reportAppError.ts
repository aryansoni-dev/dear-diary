import Constants from "expo-constants";

import { normalizeAppError } from "@/lib/errors/normalizeAppError";
import type { AppErrorCode } from "@/types/appError";

export type ErrorReportContext = {
  errorCode?: AppErrorCode;
  feature?: string;
  operation?: string;
  screen?: string;
};

export const reportAppError = (
  error: unknown,
  context?: ErrorReportContext,
): void => {
  const normalizedError = normalizeAppError(error, {
    operation: context?.operation,
  });
  const errorCode = context?.errorCode ?? normalizedError.code;

  if (!__DEV__) {
    return;
  }

  console.warn("DearDiary error report", {
    buildVersion: Constants.expoConfig?.version ?? null,
    errorCode,
    feature: context?.feature ?? null,
    operation: context?.operation ?? normalizedError.operation ?? null,
    screen: context?.screen ?? null,
    timestamp: new Date().toISOString(),
  });
};
