import test from "node:test";
import assert from "node:assert/strict";
import { addItem, MAX_QUANTITY, productFromDisplay, readCart, setItemQuantity, subtotal } from "../src/cart/cart.ts";

const berries = productFromDisplay("Strawberries", "Cedar Grove Farm", "$5.99 / lb");

test("the same product on different pages merges; different farms stay separate", () => {
  let cart = addItem([], berries);
  cart = addItem(cart, productFromDisplay("Strawberries", "Cedar Grove Farm", "$5.99 / lb"));
  cart = addItem(cart, productFromDisplay("Strawberries", "Another farm", "$6.50 / lb"));
  assert.equal(cart.length, 2);
  assert.equal(cart[0].quantity, 2);
  assert.equal(subtotal(cart), 1848);
});

test("discounted bundles and weighed produce retain their units and exact totals", () => {
  const deal = productFromDisplay("Berry Box Bundle", "Fraser Family Farm", "$10.99", "deal");
  const cart = setItemQuantity(addItem(addItem([], berries), deal), berries.id, 3);
  assert.equal(subtotal(cart), 2896);
  assert.equal(cart[0].unit, "lb");
  assert.equal(cart[1].unit, "bundle");
});

test("quantity limits reject invalid edits and cap repeated additions", () => {
  const cart = setItemQuantity(addItem([], berries), berries.id, MAX_QUANTITY);
  for (const invalid of [0, -1, 1.5, NaN, Infinity, 100]) {
    assert.deepEqual(setItemQuantity(cart, berries.id, invalid), cart);
  }
  assert.equal(addItem(cart, berries)[0].quantity, MAX_QUANTITY);
});

test("persistence round-trips valid items and recovers from malformed storage", () => {
  const cart = addItem([], berries);
  assert.deepEqual(readCart(JSON.stringify(cart)), cart);
  for (const raw of [null, "broken", "null", "{}", '[{"quantity":1}]']) assert.deepEqual(readCart(raw), []);
  const invalid = { ...cart[0], priceCents: -100 };
  assert.deepEqual(readCart(JSON.stringify([invalid, ...cart, ...cart])), cart);
  assert.deepEqual(readCart(JSON.stringify([])), []);
});
