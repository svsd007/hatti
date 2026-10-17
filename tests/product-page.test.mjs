import test from "node:test";
import assert from "node:assert/strict";
import { loadProduct } from "../src/catalog/loadProduct.ts";

const id = "b1000000-0000-4000-8000-000000000001";
function mockClient(product, failure = null, detailFailure = null) {
  const calls = [];
  return { calls, from(table) {
    const request = { table };
    calls.push(request);
    const builder = {
      select(columns) { request.columns = columns; return builder; },
      eq(column, value) { request.filter = [column, value]; return builder; },
      abortSignal(signal) { request.signal = signal; return builder; },
      async maybeSingle() { return table === "products" ? request.columns.includes("further_description") && detailFailure
        ? { data: null, error: detailFailure } : { data: product, error: failure }
        : { data: { name: "Real farmer" }, error: null }; },
    };
    return builder;
  } };
}

test("detail lookup uses the URL UUID, includes extended description and matches the grower", async () => {
  const client = mockClient({ id, business_id: "farm-id", name: "Apples", further_description: "Full growing information" });
  const signal = new AbortController().signal;
  const result = await loadProduct(client, id, signal);
  assert.equal(result.further_description, "Full growing information");
  assert.equal(result.farmName, "Real farmer");
  assert.deepEqual(client.calls[0].filter, ["id", id]);
  assert.deepEqual(client.calls[1].filter, ["id", "farm-id"]);
  assert.equal(client.calls[0].signal, signal);
  assert.match(client.calls[0].columns, /further_description/);
  assert.doesNotMatch(client.calls[1].columns, /account_id/);
});

test("denied optional description does not prevent an otherwise readable product page", async () => {
  const client = mockClient({ id, business_id: "farm-id", name: "Apples", price: 599 }, null, { code: "42501", message: "Permission denied" });
  const result = await loadProduct(client, id, new AbortController().signal);
  assert.equal(result.name, "Apples");
  assert.equal(result.price, 599);
  assert.equal(result.detailsUnavailable, true);
  assert.equal(result.further_description, null);
  assert.equal(client.calls.length, 3);
  assert.doesNotMatch(client.calls[1].columns, /further_description/);
  assert.deepEqual(client.calls[1].filter, ["id", id]);
});

test("fallback preserves a genuine permission denial for the base product", async () => {
  const client = mockClient(null, new Error("Base access denied"), { code: "42501" });
  await assert.rejects(loadProduct(client, id, new AbortController().signal), /Base access denied/);
});

test("missing and invalid UUIDs yield not found, permission failures remain errors", async () => {
  const client = mockClient(null);
  assert.equal(await loadProduct(client, "invalid", new AbortController().signal), null);
  assert.equal(client.calls.length, 0);
  assert.equal(await loadProduct(client, id, new AbortController().signal), null);
  assert.equal(client.calls.length, 1);
  const denied = mockClient(null, new Error("Permission denied"));
  await assert.rejects(loadProduct(denied, id, new AbortController().signal), /Permission denied/);
});
