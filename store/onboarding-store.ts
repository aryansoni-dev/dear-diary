import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
      onRehydrateStorage: (state) => () => {
        state.setHasHydrated(true);
      },
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
