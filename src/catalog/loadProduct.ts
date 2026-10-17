import type { SupabaseClient } from "@supabase/supabase-js";
import { BUSINESS_COLUMNS, isProductId, PRODUCT_COLUMNS, PRODUCT_DETAIL_COLUMNS } from "./catalog.ts";
import type { Business, ProductDetails } from "./types.ts";

export async function loadProduct(client: Pick<SupabaseClient, "from">, id: string, signal: AbortSignal): Promise<ProductDetails | null> {
  if (!isProductId(id)) return null;
  let { data, error } = await client.from("products").select(PRODUCT_DETAIL_COLUMNS)
    .eq("id", id).abortSignal(signal).maybeSingle();
  let detailsUnavailable = false;
  // The optional new column may not yet have a public grant. Read only the
  // existing permitted catalog columns so the rest of the listing still opens.
  if (error && ["42501", "42703", "PGRST204"].includes(error.code)) {
    const fallback = await client.from("products").select(PRODUCT_COLUMNS)
      .eq("id", id).abortSignal(signal).maybeSingle();
    data = fallback.data ? { ...fallback.data, further_description: null } : null;
    error = fallback.error;
    detailsUnavailable = true;
  }
  if (error) throw error;
  if (!data) return null;
  const { data: business } = await client.from("Businesses").select(BUSINESS_COLUMNS)
    .eq("id", data.business_id).abortSignal(signal).maybeSingle<Business>();
  return { ...data, further_description: data.further_description ?? null, detailsUnavailable,
    farmName: business?.name?.trim() || "Farm details unavailable" } as ProductDetails;
}
