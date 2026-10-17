export function validateSupabaseConfig(url: string | undefined, key: string | undefined) {
  if (!url?.trim() || !key?.trim()) {
    throw new Error("Hatti needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local. Add the public Supabase project values and restart Vite.");
  }
  let parsed: URL;
  try { parsed = new URL(url); }
  catch { throw new Error("VITE_SUPABASE_URL must be a valid Supabase project URL."); }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error("VITE_SUPABASE_URL must be an HTTP(S) project URL without credentials.");
  }
  if (key.startsWith("sb_secret_")) {
    throw new Error("Use a Supabase publishable key in the frontend, never a secret or service-role key.");
  }
  if (!key.startsWith("sb_publishable_")) {
    try {
      const payload = key.split(".")[1];
      const { role } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      if (role !== "anon") throw new Error("Not an anon key");
    } catch {
      throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY must be a publishable key or legacy anon key, never a service-role key.");
    }
  }
  return { url: url.trim(), key: key.trim() };
}
