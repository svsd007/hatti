import test from "node:test";
import assert from "node:assert/strict";
import { imageExtension, MAX_IMAGE_BYTES, priceInCents } from "../src/business/listing.ts";
import { decrementItem } from "../src/cart/cart.ts";
import { isProductId, PRODUCT_COLUMNS, PRODUCT_DETAIL_COLUMNS, stockLabel } from "../src/catalog/catalog.ts";

test("minus removes the last unit and permits reducing stale over-stock quantities", () => {
  const item = { id: "a", quantity: 1, available: false, stockQuantity: 0 };
  assert.deepEqual(decrementItem([item], "a"), []);
  assert.deepEqual(decrementItem([], "a"), []);
  const stale = { ...item, quantity: 10, stockQuantity: 2 };
  assert.equal(decrementItem([stale], "a")[0].quantity, 9);
  assert.equal(stale.quantity, 10);
  assert.deepEqual(decrementItem([stale], "another"), [stale]);
});

test("stock labels omit each while retaining measured units and availability", () => {
  const product = { is_available: true, stock_quantity: 80, unit: "each" };
  assert.equal(stockLabel(product), "80 in stock");
  assert.equal(stockLabel({ ...product, unit: "lb" }), "80 lb in stock");
  assert.equal(stockLabel({ ...product, stock_quantity: 0 }), "Out of stock");
  assert.equal(stockLabel({ ...product, is_available: false }), "Currently unavailable");
  assert.equal(stockLabel({ ...product, stock_quantity: null }), "Stock not specified");
});

test("listing price converts CAD to exact cents and rejects fractional cents", () => {
  for (const [value, expected] of [["5.99", 599], ["1.2", 120], ["0", 0], [" 10.01 ", 1001]]) assert.equal(priceInCents(value), expected);
  for (const value of ["", "1.999", "-1", "1e3", "NaN", "1000001", "5."]) assert.throws(() => priceInCents(value));
});

test("upload validation rejects unsupported, empty, and oversized files", () => {
  assert.equal(imageExtension({ type: "image/jpeg", size: 1024 }), "jpg");
  assert.equal(imageExtension({ type: "image/webp", size: MAX_IMAGE_BYTES }), "webp");
  for (const file of [{ type: "image/svg+xml", size: 100 }, { type: "image/png", size: 0 }, { type: "image/png", size: MAX_IMAGE_BYTES + 1 }]) assert.throws(() => imageExtension(file));
});

test("detail projection includes extended text without adding it to the catalog", () => {
  assert.equal(PRODUCT_COLUMNS.includes("further_description"), false);
  assert.equal(PRODUCT_DETAIL_COLUMNS.includes("further_description"), true);
  assert.equal(isProductId("a1000000-0000-4000-8000-000000000007"), true);
  assert.equal(isProductId("missing"), false);
});
