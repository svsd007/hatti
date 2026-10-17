import test from "node:test";
import assert from "node:assert/strict";
import { requireBusinessOwner } from "../src/business/ownership.ts";

function client({ user = { id: "owner" }, authError = null, businesses = [{ id: "my-business" }], rpcError = null } = {}) {
  return {
    auth: { async getUser() { return { data: { user }, error: authError }; } },
    async rpc(name) {
      assert.equal(name, "hatti_my_business");
      return { data: businesses, error: rpcError };
    },
  };
}

test("business management requires a verified session and server-derived ownership", async () => {
  assert.equal((await requireBusinessOwner(client(), "my-business")).id, "owner");
  await assert.rejects(requireBusinessOwner(client({ user: null }), "my-business"), /log in/);
  await assert.rejects(requireBusinessOwner(client({ authError: new Error("expired") }), "my-business"), /log in/);
});

test("another business and unowned demos cannot be managed", async () => {
  await assert.rejects(requireBusinessOwner(client(), "another-business"), /own business/);
  await assert.rejects(requireBusinessOwner(client({ businesses: [] }), "public-demo"), /own business/);
});

test("ownership lookup errors and malformed responses fail closed", async () => {
  for (const businesses of [null, {}, "my-business"]) {
    await assert.rejects(requireBusinessOwner(client({ businesses }), "my-business"), /own business/);
  }
  await assert.rejects(requireBusinessOwner(client({ rpcError: new Error("denied") }), "my-business"), /own business/);
});
