# Live catalog integration

The 2026-10-14 Supabase MCP schema inspection supersedes the historical product
availability assumptions in phase-1.md. No database changes
or migrations were performed for this integration.

A second live inspection during implementation found that `Location` had been
renamed to lowercase `location`; the code targets that current schema. The first
public API probe returned 400 for the old column and 401 / 42501 (permission denied)
for products. No database privileges were changed to bypass this restriction.
After correcting the column name, both exact public catalog queries returned
HTTP 401 / 42501. Live browsing is blocked on database read grants/policies; MCP
administrative access is not equivalent to the browser role. Build, lint, and all
18 tests passed. Visual browser behavior was not verified.

- Home, Farmers, and Fresh Produce read Businesses and products using explicit
  safe column projections. Businesses.location is case-sensitive. account_id is
  never fetched. Products are matched to farms using business_id, not names.
- Catalog reads are paginated, abortable, retriable, and refreshed on account changes.
  Errors do not silently fall back to invented inventory. RLS still controls visibility.
- Categories come from products.category. Nullable text has display fallbacks.
  Only is_available=true is addable; null availability is treated as unavailable.
  Null stock means unspecified, with the existing per-item cart ceiling of 99.
- Price is provisionally interpreted as CAD cents (599 = $5.99), matching the
  existing cart's money convention. The schema has no currency/unit-of-price
  metadata. Confirm this convention with the database owner before relying on prices.
  toCartProduct is the central mapping; ProductCard displays the same integer cents.
- image_path supports HTTPS URLs and paths in the public product-images bucket.
  Bare filenames, nested object paths, and product-images-prefixed paths resolve
  to that bucket. Missing or failed images use the local illustration.
  No storage permissions are changed.
- The cart keeps actual product UUIDs and rechecks loaded prices, availability,
  and stock. Old demo items are retained for user removal but cannot be increased.
  Over-stock saved quantities are flagged instead of silently deleting user choices.
  Refresh prices and stock explicitly reloads the catalog. There is no reservation,
  server-side cart, order placement, or payment flow in this two-table schema.
- Demo deals are no longer purchasable. Markets and order history remain clearly
  labeled prototype content, not database-backed records.

Validation: npm test, npm run lint, npm run build. Run the read-only API check with
`node --env-file=.env.local scripts/check-catalog.mjs`; it prints only status and
sample counts, never keys or records. MCP administrative visibility alone does not
prove that the public browser role can read rows. Browser and authenticated RLS
checks remain separate from local render/unit tests.
