import type { FaultInjectionKey } from "@/types/faultInjection";

const enabledFaults = new Set<FaultInjectionKey>([
  // Add development-only keys here while manually testing edge cases.
]);

export const isFaultEnabled = (key: FaultInjectionKey): boolean => {
  if (!__DEV__) {
    return false;
  }

  return enabledFaults.has(key);
};

export const throwIfFaultEnabled = (key: FaultInjectionKey): void => {
  if (!isFaultEnabled(key)) {
    return;
  }

  throw new Error(`Development fault injected: ${key}`);
};

