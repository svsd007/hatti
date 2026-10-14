import { createClient } from "@supabase/supabase-js";
import { validateSupabaseConfig } from "./supabaseConfig";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const config = validateSupabaseConfig(supabaseUrl, supabaseKey);

// One shared client handles persisted sessions, token refresh, and redirect callbacks.
export const supabase = createClient(config.url, config.key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// The OAuth SDK builds a redirect URL even when the provider is disabled.
// Check the public settings endpoint first so failures stay inside Hatti.
export async function googleSignInAvailable(): Promise<boolean> {
  const response = await fetch(`${config.url.replace(/\/$/, "")}/auth/v1/settings`, {
    headers: { apikey: config.key },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Could not check Google sign-in availability. Please use email and password or try again.");
  const settings: { external?: { google?: boolean } } = await response.json();
  return settings.external?.google === true;
}
