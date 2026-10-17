// Read-only public API checks. Never prints keys, account IDs, or business records.
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Run with node --env-file=.env.local scripts/audit-supabase.mjs");
if (key.startsWith("sb_secret_")) throw new Error("A secret key must not be used in VITE variables.");
if (key.split(".").length === 3) {
  const claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
  if (claims.role !== "anon") throw new Error("The frontend JWT key must have the anon role.");
}
const headers = { apikey: key };
if (!key.startsWith("sb_publishable_")) headers.Authorization = `Bearer ${key}`;
for (const [label, path, method] of [
  ["Public business fields", "/rest/v1/Businesses?select=id,name,description&limit=0", "HEAD"],
  ["Private account_id (expect denial)", "/rest/v1/Businesses?select=account_id&limit=0", "HEAD"],
  ["Location field access", "/rest/v1/Businesses?select=location&limit=0", "HEAD"],
  ["Products table access", "/rest/v1/products?select=id&limit=0", "HEAD"],
  ["Auth settings", "/auth/v1/settings", "GET"],
  ["Public API schema", "/rest/v1/", "GET"],
]) {
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}${path}`, { method, headers, signal: AbortSignal.timeout(15000) });
    const result = { check: label, status: response.status };
    if (response.ok && label === "Auth settings") {
      const settings = await response.json();
      result.email = settings.external?.email;
      result.google = settings.external?.google;
      result.signupDisabled = settings.disable_signup;
      result.emailAutoConfirm = settings.mailer_autoconfirm;
    }
    if (response.ok && label === "Public API schema") {
      const schema = await response.json();
      result.tables = Object.keys(schema.definitions ?? {});
      result.businessColumns = Object.keys(schema.definitions?.Businesses?.properties ?? {});
    }
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(JSON.stringify({ check: label, error: error.cause?.code ?? error.name }));
    process.exitCode = 1;
    break;
  }
}
