import { useClerk } from "@clerk/expo";
import { useCallback } from "react";

import {
  getSupabaseAccessTokenProvider,
  setSupabaseAccessTokenProvider,
} from "@/lib/supabase";
import { useJournalStore } from "@/store/journal-store";
import { useSyncStore } from "@/store/useSyncStore";

export function useAppSignOut() {
  const { signOut } = useClerk();
  const setActiveUserId = useJournalStore((state) => state.setActiveUserId);

  return useCallback(
    async (currentUserId?: string | null) => {
      const previousActiveUserId = useJournalStore.getState().activeUserId;
      const signingOutUserId = currentUserId ?? previousActiveUserId;
      const previousAccessTokenProvider = getSupabaseAccessTokenProvider();

      try {
        await signOut();
        setActiveUserId(null);

        if (signingOutUserId) {
          useSyncStore.getState().clearSyncStateForUser(signingOutUserId);
        }

        setSupabaseAccessTokenProvider(null);
      } catch (error) {
        setActiveUserId(previousActiveUserId);
        setSupabaseAccessTokenProvider(previousAccessTokenProvider);
        throw error;
      }
    },
    [setActiveUserId, signOut],
  );
}
