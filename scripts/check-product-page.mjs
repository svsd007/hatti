// Exercise the actual page loader against one public product; no writes or sign-in.
import { createClient } from "@supabase/supabase-js";
import { validateSupabaseConfig } from "../src/lib/supabaseConfig.ts";
import { loadProduct } from "../src/catalog/loadProduct.ts";

const config = validateSupabaseConfig(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
const signal = AbortSignal.timeout(20000);
const { data, error } = await client.from("products").select("id").limit(1).abortSignal(signal).maybeSingle();
if (error) throw new Error(error.message);
if (!data) throw new Error("No visible product to test.");
const product = await loadProduct(client, data.id, signal);
console.log(JSON.stringify({ productPageLoaded: Boolean(product),
  hasName: Boolean(product?.name), hasFarm: product?.farmName !== "Farm details unavailable",
  extendedDescriptionAccessible: product ? !product.detailsUnavailable : false }));
if (!product) process.exitCode = 1;
