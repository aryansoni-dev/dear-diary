import { getAuthenticatedSupabaseClient } from "@/lib/supabase";

type SyncProfileParams = {
  avatarUrl?: string | null;
  email?: string | null;
  fullName?: string | null;
  userId: string;
};

export async function syncProfileToCloud({
  avatarUrl,
  email,
  fullName,
  userId,
}: SyncProfileParams): Promise<void> {
  if (!userId) {
    throw new Error("A signed-in user is required to sync a profile.");
  }

  const client = getAuthenticatedSupabaseClient();
  const { error } = await client.from("profiles").upsert(
    {
      avatar_url: avatarUrl ?? null,
      email: email ?? null,
      full_name: fullName ?? null,
      id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}
