import test from "node:test";
import assert from "node:assert/strict";
import { BUSINESS_COLUMNS, filterProducts, joinProducts, productImageUrl, readAllPages, toCartProduct } from "../src/catalog/catalog.ts";
import { addItem, quantityLimit, setItemQuantity, subtotal } from "../src/cart/cart.ts";

const farm = { id: "farm-1", name: "Real grower", description: null, location: "Delta, BC" };
const row = { id: "product-1", created_at: "2026-10-14", business_id: farm.id, name: "Apples",
  description: "Fresh orchard apples", is_available: true, price: 599, unit: "lb",
  category: "Orchard fruit", stock_quantity: 2, image_path: null };
const product = joinProducts([row], [farm])[0];

test("schema projection uses exact location and excludes private ownership fields", () => {
  assert.equal(BUSINESS_COLUMNS, "id,name,description,location");
  assert.equal(product.farmName, farm.name);
  assert.equal(joinProducts([row], [])[0].farmName, "Farm details unavailable");
  assert.equal(joinProducts([row], [{ ...farm, name: null }])[0].farmName, "Unnamed farm");
});

test("database UUID and integer price survive cart mapping without display parsing", () => {
  const cartProduct = toCartProduct(product);
  assert.equal(cartProduct.id, row.id);
  assert.equal(cartProduct.priceCents, 599);
  let items = addItem([], cartProduct);
  items = addItem(items, { ...cartProduct, name: "Renamed apples" });
  assert.equal(items.length, 1);
  assert.equal(subtotal(items), 1198);
  assert.equal(addItem(items, cartProduct)[0].quantity, 2);
  assert.equal(setItemQuantity(items, row.id, 3)[0].quantity, 2);
});

test("availability and stock limits fail closed for unavailable or malformed products", () => {
  for (const overrides of [{ is_available: false }, { is_available: null }, { stock_quantity: 0 },
    { stock_quantity: -1 }, { price: -1 }, { price: 1.2 }]) {
    const item = toCartProduct({ ...product, ...overrides });
    assert.equal(quantityLimit(item), 0);
    assert.deepEqual(addItem([], item), []);
  }
  assert.equal(quantityLimit(toCartProduct({ ...product, stock_quantity: null })), 99);
});

test("search uses database categories and grower names", () => {
  assert.equal(filterProducts([product], "Orchard fruit", "REAL GROWER").length, 1);
  assert.equal(filterProducts([product], "All", "orchard").length, 1);
  assert.equal(filterProducts([product], "Vegetables", "").length, 0);
});

test("images resolve filenames, nested paths, and bucket-prefixed paths in product-images", () => {
  const url = "https://example.supabase.co";
  assert.equal(productImageUrl("strawberries.jpg", url), `${url}/storage/v1/object/public/product-images/strawberries.jpg`);
  assert.equal(productImageUrl("produce/apple photo.jpg", url), `${url}/storage/v1/object/public/product-images/produce/apple%20photo.jpg`);
  assert.equal(productImageUrl("product-images/carrots.jpg", url), `${url}/storage/v1/object/public/product-images/carrots.jpg`);
  assert.equal(productImageUrl("https://images.example/apple.jpg", url), "https://images.example/apple.jpg");
  for (const path of [null, "", "product-images", "javascript:alert(1)", "//example.com/x", "bucket/../x", "https://user:pass@example.com/a"]) {
    assert.equal(productImageUrl(path, url), null);
  }
});

test("paginated reads include all rows even with a smaller API row cap", async () => {
  const data = [1, 2, 3, 4, 5];
  const ranges = [];
  const result = await readAllPages((from, to) => {
    ranges.push([from, to]);
    return Promise.resolve({ data: data.slice(from, from + 2), error: null });
  }, new AbortController().signal);
  assert.deepEqual(result, data);
  assert.deepEqual(ranges.map(range => range[0]), [0, 2, 4, 5]);
  await assert.rejects(readAllPages(() => Promise.resolve({ data: null, error: { message: "Denied" } }), new AbortController().signal), /Denied/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(readAllPages(() => { throw Error("should not run"); }, controller.signal), { name: "AbortError" });
});
