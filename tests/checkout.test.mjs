import test from "node:test";
import assert from "node:assert/strict";
import { parseItems, priceCart, testKey } from "../supabase/functions/_shared/checkout.ts";
const id = "a1000000-0000-4000-8000-000000000001";
const product = { id, business_id: id, name: "Apples", unit: "bag", price: 599, is_available: true, stock_quantity: 3 };
test("checkout ignores client prices and uses integer database cents", () => {
  const items = parseItems([{ id, quantity: 2, price: 1, priceCents: 1 }]);
  assert.deepEqual(items, [{ id, quantity: 2 }]);
  assert.equal(priceCart(items, [product])[0].price, 599);
});
test("checkout rejects invalid IDs, duplicate IDs and invalid quantities", () => {
  for (const quantity of [0, -1, 1.5, 100, "2", null]) assert.throws(() => parseItems([{ id, quantity }]));
  for (const items of [[], null, [{ id: "bad", quantity: 1 }], [{ id, quantity: 1 }, { id: id.toUpperCase(), quantity: 1 }], Array(51).fill({ id, quantity: 1 })]) assert.throws(() => parseItems(items));
});
test("checkout rejects unavailable, missing, insufficient-stock and invalid-price products", () => {
  const items = parseItems([{ id, quantity: 2 }]);
  assert.throws(() => priceCart(items, []));
  for (const patch of [{ is_available: false }, { is_available: null }, { stock_quantity: 1 }, { stock_quantity: -1 }, { price: -1 }, { price: 1.5 }, { price: 100000000 }, { price: 0 }]) assert.throws(() => priceCart(items, [{ ...product, ...patch }]));
  assert.equal(priceCart(items, [{ ...product, stock_quantity: null }]).length, 1);
});
test("Stripe live and missing credentials fail closed", () => {
  assert.equal(testKey("sk_test_example"), "sk_test_example");
  for (const key of [undefined, "", "sk_live_example", "rk_live_example", "pk_test_example"]) assert.throws(() => testKey(key));
});

test("purchase snapshot fields are validated before collecting payment", () => {
  const items = parseItems([{ id, quantity: 1 }]);
  for (const patch of [{ business_id: "bad" }, { business_id: "00000000-0000-0000-0000-000000000000" },
    { name: " " }, { name: "Apple\n" }, { name: "a".repeat(201) }, { unit: "" }, { unit: "x".repeat(41) }]) {
    assert.throws(() => priceCart(items, [{ ...product, ...patch }]));
  }
});
