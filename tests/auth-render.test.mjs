import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";

test("auth screens render accessible fields, real profile values, and guarded account content", async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  try {
    const { AuthContext } = await server.ssrLoadModule("/src/auth/useAuth.ts");
    const { default: AuthForm } = await server.ssrLoadModule("/src/components/AuthForm.tsx");
    const { default: Profile } = await server.ssrLoadModule("/src/Pages/Profile.tsx");
    const { default: RequireAuth } = await server.ssrLoadModule("/src/auth/RequireAuth.tsx");
    const guest = { user: null, session: null, loading: false, error: null };
    function render(component, auth = guest) {
      return renderToStaticMarkup(h(MemoryRouter, { initialEntries: ["/login?next=%2Fcart"] },
        h(AuthContext.Provider, { value: auth }, component)));
    }
    const login = render(h(AuthForm, { mode: "login" }));
    assert.match(login, /for="email"/);
    assert.match(login, /for="password"/);
    assert.match(login, /autoComplete="current-password"/);
    assert.match(login, /signup\?next=%2Fcart/);
    const signup = render(h(AuthForm, { mode: "signup" }));
    assert.match(signup, /for="confirm-password"/);
    assert.match(signup, /for="display-name"/);
    assert.match(signup, /minLength="8"/);
    assert.match(signup, /Continue with Google/);

    const guestProfile = render(h(Profile));
    assert.match(guestProfile, /Log in or create an account/);
    assert.doesNotMatch(guestProfile, /maya\.chen|Maya Chen/);
    const signedIn = { ...guest, user: {
      email: "test-customer@example.invalid", created_at: "2026-01-01T00:00:00Z",
      email_confirmed_at: "2026-01-01T00:00:00Z", user_metadata: { display_name: "Test Customer" },
    } };
    const profile = render(h(Profile), signedIn);
    assert.match(profile, /test-customer@example.invalid/);
    assert.match(profile, /Test Customer/);
    assert.match(profile, /Log out/);
    const protectedContent = h(RequireAuth, null, h("p", null, "Private account content"));
    assert.match(render(protectedContent, signedIn), /Private account content/);
    assert.doesNotMatch(render(protectedContent), /Private account content/);
    assert.match(render(protectedContent, { ...guest, loading: true }), /Loading your account/);
    assert.match(render(protectedContent, { ...guest, error: "Connection unavailable" }), /Connection unavailable/);
    const { CatalogContext } = await server.ssrLoadModule("/src/catalog/CatalogContext.ts");
    const { default: ProductListingForm } = await server.ssrLoadModule("/src/business/ProductListingForm.tsx");
    const product = { id: "product-id", business_id: "my-business", name: "Fresh apples", price: 599,
      unit: "crate", stock_quantity: 0, is_available: false, description: "Short card text",
      further_description: "Preserve these extended details", category: "Fruit", image_path: "owner/image.jpg" };
    const editForm = render(h(CatalogContext.Provider, { value: { refresh() {} } },
      h(ProductListingForm, { businessId: "my-business", product, onCancel() {} })), signedIn);
    assert.match(editForm, /Save changes/);
    assert.match(editForm, /value="5.99"/);
    assert.match(editForm, /Preserve these extended details/);
    assert.match(editForm, /value="crate" selected=""/);
    assert.match(editForm, /Leave empty to keep the current image/);
    assert.doesNotMatch(editForm, /checked=""/);
  } finally {
    await server.close();
  }
});
