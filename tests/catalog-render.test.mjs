import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

test("catalog pages render real fields, loading, errors, empty states, and disabled stock", async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom" });
  try {
    const { CatalogContext } = await server.ssrLoadModule("/src/catalog/CatalogContext.ts");
    const { CartContext } = await server.ssrLoadModule("/src/cart/CartContext.ts");
    const { default: Farmers } = await server.ssrLoadModule("/src/Pages/Farmers.tsx");
    const { default: Produce } = await server.ssrLoadModule("/src/Pages/FreshProduce.tsx");
    const { default: Home } = await server.ssrLoadModule("/src/Pages/Home.tsx");
    const { default: Deals } = await server.ssrLoadModule("/src/Pages/Deals.tsx");
    const { default: MarketDirectory } = await server.ssrLoadModule("/src/Pages/FarmersMarkets.tsx");
    const { default: ProductCard } = await server.ssrLoadModule("/src/components/ProductCard.tsx");
    const { default: BusinessPage } = await server.ssrLoadModule("/src/Pages/BusinessPage.tsx");
    const { default: AuthForm } = await server.ssrLoadModule("/src/components/AuthForm.tsx");
    const { AuthContext } = await server.ssrLoadModule("/src/auth/useAuth.ts");
    const catalog = { businesses: [{ id: "farm-1", name: "Database Farm", location: "Database Location", description: null }],
      products: [{ id: "product-1", name: "Database apples", farmName: "Database Farm", price: 599,
        unit: "bag", category: "Orchard", stock_quantity: 0, is_available: true, image_path: null, description: "Crisp apples" }],
      loading: false, businessError: null, productError: null, refresh() {} };
    function render(component, state = catalog, route = "/", items = []) {
      return renderToStaticMarkup(h(MemoryRouter, { initialEntries: [route] },
        h(CatalogContext.Provider, { value: state },
          h(CartContext.Provider, { value: { items, add() {}, decrement() {} } }, h(component)))));
    }
    assert.match(render(Farmers), /Database Location/);
    assert.match(render(Farmers), /No farm description available yet/);
    const produce = render(Produce);
    assert.match(produce, /Database apples/);
    assert.match(produce, /\$5\.99 \/ bag/);
    assert.match(produce, /Orchard/);
    assert.match(produce, /Out of stock/);
    assert.match(produce, /disabled=""/);
    assert.match(render(Produce, catalog, "/fresh-produce?q=notfound"), /No matching produce/);
    assert.match(render(Farmers, { ...catalog, loading: true, businesses: [] }), /Loading farms/);
    assert.match(render(Produce, { ...catalog, products: [], productError: "Read denied" }), /Read denied/);
    assert.match(render(Produce, { ...catalog, products: [] }), /No products listed yet/);
    const home = render(Home);
    assert.match(home, /Database apples/);
    assert.match(home, /Database Location/);
    assert.doesNotMatch(home, /Cedar Grove Farm|\$1\.25/);
    assert.doesNotMatch(home, /Trout Lake|Kitsilano|preview|km away|Open Saturday/);
    assert.match(render(MarketDirectory), /Database Farm/);
    assert.doesNotMatch(render(MarketDirectory), /Trout Lake|Kitsilano|prototype|km away/);
    assert.match(render(Deals), /No deals available yet/);
    assert.doesNotMatch(render(Deals), /Berry Box Bundle|Add to cart/);
    const listed = { ...catalog.products[0], unit: "each", stock_quantity: 80, further_description: "DETAILS ONLY" };
    const card = render(() => h(ProductCard, { product: listed }));
    assert.match(card, /href="\/products\/product-1"/);
    assert.match(card, /80 in stock/);
    assert.doesNotMatch(card, /80 each|DETAILS ONLY/);
    assert.match(card.match(/<button[^>]+aria-label="Remove one Database apples from cart"[^>]*>/)[0], /disabled=""/);
    const active = render(() => h(ProductCard, { product: listed }), catalog, "/", [{ id: listed.id, quantity: 1 }]);
    assert.doesNotMatch(active.match(/<button[^>]+aria-label="Remove one Database apples from cart"[^>]*>/)[0], /disabled/);
    // Controls are siblings of the Link rather than nested interactive content.
    assert.doesNotMatch(card, /<a[^>]*>[^<]*<button/);
    const guest = { user: null, session: null, loading: false, error: null };
    const business = render(() => h(AuthContext.Provider, { value: guest }, h(BusinessPage)));
    assert.match(business, /Create a business account/);
    assert.match(business, /href="\/business\/login"/);
    const signup = render(() => h(AuthContext.Provider, { value: guest }, h(AuthForm, { mode: "signup", business: true })));
    assert.match(signup, /login\?next=%2Fbusiness/);
    const { default: BusinessLogin } = await server.ssrLoadModule("/src/Pages/BusinessLogin.tsx");
    const businessLogin = render(() => h(AuthContext.Provider, { value: guest }, h(BusinessLogin)));
    assert.match(businessLogin, /Log in to your business/);
    assert.match(businessLogin, /autoComplete="current-password"/);
    assert.match(businessLogin, /href="\/business\/signup\?next=%2Fbusiness"/);
    assert.doesNotMatch(businessLogin, /confirm-password/);
  } finally { await server.close(); }
});
