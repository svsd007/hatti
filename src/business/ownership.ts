import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireBusinessOwner(supabase: SupabaseClient, businessId: string) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Please log in again to manage your business.");
  const { data, error: ownershipError } = await supabase.rpc("hatti_my_business");
  if (ownershipError || !Array.isArray(data) || !data.some(b => b.id === businessId)) {
    throw new Error("You can only manage listings for your own business.");
  }
  return user;
}
