import test from "node:test";
import assert from "node:assert/strict";
import { safeDestination, authErrorMessage } from "../src/auth/authUtils.ts";
import { observeSession } from "../src/auth/session.ts";
import { validateSupabaseConfig } from "../src/lib/supabaseConfig.ts";

test("login destinations preserve shopping routes and reject external redirects and auth loops", () => {
  for (const path of ["/cart", "/previous-orders", "/fresh-produce?category=Fruit#top", "/seller/products", "/"]) {
    assert.equal(safeDestination(path), path);
  }
  for (const path of [null, "", "https://evil.invalid", "//evil.invalid", "/\\evil.invalid", "/login?next=/login", "/signup", "/auth/callback", "/%2f%2fevil.invalid", "/\n/evil.invalid"]) {
    assert.equal(safeDestination(path), "/profile");
  }
});

test("frontend configuration rejects missing values, secret keys, and service-role JWTs", () => {
  const url = "https://example.supabase.co";
  const jwt = role => `header.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.signature`;
  assert.throws(() => validateSupabaseConfig(undefined, "key"), /VITE_SUPABASE_URL/);
  assert.throws(() => validateSupabaseConfig(url, "sb_secret_example"), /never a secret/);
  assert.throws(() => validateSupabaseConfig(url, jwt("service_role")), /never a service-role/);
  assert.throws(() => validateSupabaseConfig("file:///local", "sb_publishable_example"), /HTTP/);
  assert.equal(validateSupabaseConfig(url, jwt("anon")).url, url);
  assert.equal(validateSupabaseConfig(url, "sb_publishable_example").key, "sb_publishable_example");
});

function authHarness() {
  let resolve, reject, listener;
  let unsubscribed = false;
  const pending = new Promise((yes, no) => { resolve = yes; reject = no; });
  const states = [];
  const cleanup = observeSession({
    onAuthStateChange: callback => {
      listener = callback;
      return { data: { subscription: { unsubscribe() { unsubscribed = true; } } } };
    },
    getSession: () => pending,
  }, state => states.push(state));
  return { states, cleanup, resolve, reject, emit: (event, session) => listener(event, session), unsubscribed: () => unsubscribed };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test("initial session restores user, token refresh updates state, and logout removes it", async () => {
  const h = authHarness();
  const session = { user: { id: "customer-a" }, access_token: "test-token" };
  h.resolve({ data: { session }, error: null });
  await flush();
  assert.deepEqual(h.states.at(-1), { session, loading: false, error: null });
  h.emit("TOKEN_REFRESHED", { ...session, access_token: "refreshed" });
  assert.equal(h.states.at(-1).session.access_token, "refreshed");
  h.emit("SIGNED_OUT", null);
  assert.equal(h.states.at(-1).session, null);
  h.cleanup();
  assert.equal(h.unsubscribed(), true);
});

test("stale getSession cannot resurrect a logged-out user", async () => {
  const h = authHarness();
  h.emit("SIGNED_OUT", null);
  h.resolve({ data: { session: { user: { id: "stale-user" } } }, error: null });
  await flush();
  assert.equal(h.states.length, 1);
  assert.equal(h.states[0].session, null);
  h.cleanup();
});

test("cleanup ignores late responses and duplicate StrictMode subscriptions", async () => {
  const h = authHarness();
  h.cleanup();
  h.emit("SIGNED_IN", { user: { id: "late-user" } });
  h.resolve({ data: { session: null }, error: null });
  await flush();
  assert.deepEqual(h.states, []);
});

test("session failures end loading and report actionable errors", async () => {
  const h = authHarness();
  h.reject(new Error("Failed to fetch"));
  await flush();
  assert.equal(h.states[0].loading, false);
  assert.match(h.states[0].error, /internet connection/);
  assert.match(authErrorMessage({ code: "email_not_confirmed" }), /Confirm your email/);
  assert.match(authErrorMessage({ code: "provider_disabled" }), /Google sign-in is unavailable/);
  h.cleanup();
});
