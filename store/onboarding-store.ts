import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { createPersistStorage } from "@/lib/storage/createPersistStorage";
import { isRecord } from "@/lib/utils/typeGuards";

type OnboardingState = {
  completeOnboarding: () => void;
  hasCompletedOnboarding: boolean;
  hasHydrated: boolean;
  resetOnboarding: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      hasCompletedOnboarding: false,
      hasHydrated: false,
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "dear-diary-onboarding",
      merge: (persistedState, currentState) => ({
        ...currentState,
        hasCompletedOnboarding:
          isRecord(persistedState) &&
          typeof persistedState.hasCompletedOnboarding === "boolean"
            ? persistedState.hasCompletedOnboarding
            : currentState.hasCompletedOnboarding,
      }),
      onRehydrateStorage: (state) => () => {
        state.setHasHydrated(true);
      },
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      storage: createJSONStorage(() => createPersistStorage()),
    },
  ),
);
