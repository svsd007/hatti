// Read-only check using the same public projections as the app; prints no records or keys.
import { BUSINESS_COLUMNS, PRODUCT_COLUMNS, PRODUCT_DETAIL_COLUMNS, productImageUrl } from "../src/catalog/catalog.ts";
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("Run with node --env-file=.env.local scripts/check-catalog.mjs");
if (key.startsWith("sb_secret_") || (key.split(".").length === 3 && JSON.parse(Buffer.from(key.split(".")[1], "base64url")).role !== "anon")) {
  throw new Error("Only public frontend keys may be used.");
}
const headers = { apikey: key };
if (!key.startsWith("sb_publishable_")) headers.Authorization = `Bearer ${key}`;
for (const [table, columns] of [["Businesses", BUSINESS_COLUMNS], ["products", PRODUCT_COLUMNS], ["products", PRODUCT_DETAIL_COLUMNS]]) {
  const endpoint = new URL(`/rest/v1/${table}`, url);
  endpoint.search = new URLSearchParams({ select: columns, order: "id.asc", limit: "1" }).toString();
  const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(15000) });
  const payload = await response.json();
  console.log(JSON.stringify({ table, details: columns === PRODUCT_DETAIL_COLUMNS, status: response.status, readable: response.ok,
    ...(response.ok ? { sampleRowCount: payload.length } : { code: payload.code, message: payload.message, hint: payload.hint }) }));
  if (!response.ok) process.exitCode = 1;
}
// Optional object paths verify public image delivery independently of table access.
for (const path of process.argv.slice(2)) {
  const imageUrl = productImageUrl(path, url);
  if (!imageUrl) throw new Error("Invalid image path");
  const response = await fetch(imageUrl, { method: "HEAD", signal: AbortSignal.timeout(15000) });
  const type = response.headers.get("content-type");
  console.log(JSON.stringify({ image: path, status: response.status, contentType: type }));
  if (!response.ok || !type?.startsWith("image/")) process.exitCode = 1;
}
