import { create } from "zustand";

import type {
  AccountDeletionFailureCode,
  AccountDeletionStage,
} from "@/types/accountDeletion";

type AccountDeletionState = {
  activeRequestId: string | null;
  deletionInProgress: boolean;
  failureCode: AccountDeletionFailureCode | null;
  stage: AccountDeletionStage;
  beginDeletion: (requestId?: string) => void;
  completeDeletion: (requestId?: string) => void;
  failDeletion: (
    code: AccountDeletionFailureCode,
    options?: { keepGuardActive?: boolean; requestId?: string },
  ) => void;
  resetDeletionState: () => void;
  setStage: (stage: AccountDeletionStage) => void;
};

export const useAccountDeletionStore = create<AccountDeletionState>()((set) => ({
  activeRequestId: null,
  beginDeletion: (requestId) =>
    set({
      activeRequestId: requestId ?? null,
      deletionInProgress: true,
      failureCode: null,
      stage: "verifying",
    }),
  completeDeletion: (requestId) =>
    set({
      activeRequestId: requestId ?? null,
      deletionInProgress: false,
      failureCode: null,
      stage: "completed",
    }),
  deletionInProgress: false,
  failDeletion: (code, options) =>
    set({
      activeRequestId: options?.requestId ?? null,
      deletionInProgress: options?.keepGuardActive ?? false,
      failureCode: code,
      stage: "failed",
    }),
  failureCode: null,
  resetDeletionState: () =>
    set({
      activeRequestId: null,
      deletionInProgress: false,
      failureCode: null,
      stage: "idle",
    }),
  setStage: (stage) => set({ stage }),
  stage: "idle",
}));
