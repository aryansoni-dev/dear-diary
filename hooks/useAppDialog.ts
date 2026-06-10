import { useContext } from "react";

import { AppDialogContext } from "@/providers/AppDialogProvider";

export function useAppDialog() {
  const context = useContext(AppDialogContext);

  if (!context) {
    throw new Error("useAppDialog must be used inside AppDialogProvider.");
  }

  return context;
}
