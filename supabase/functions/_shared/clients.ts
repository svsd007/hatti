import Stripe from "npm:stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { testKey } from "./checkout.ts";

export function stripeClient() {
  return new Stripe(testKey(Deno.env.get("STRIPE_SECRET_KEY")), { httpClient: Stripe.createFetchHttpClient() });
}
export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
