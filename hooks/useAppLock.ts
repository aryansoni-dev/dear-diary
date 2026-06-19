import { useContext } from "react";

import { AppLockContext } from "@/providers/AppLockProvider";

export function useAppLock() {
  const context = useContext(AppLockContext);

  if (!context) {
    throw new Error("useAppLock must be used inside AppLockProvider.");
  }

  return context;
}

