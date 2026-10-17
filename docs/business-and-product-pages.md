# Business listings and product pages

Implemented routes:

- `/products/:id`: one reusable ProductPage, direct UUID lookup with
  further_description. Missing/invalid IDs show not found; request failures have retry.
- `/farmers/:id`: business profile and its product listings.
- `/business`: account holder's registration form or publishing dashboard.
- `/business/signup`: separate business signup entry, using Supabase Auth and
  email confirmation, then returning to business registration.
- `/business/login`: dedicated business login, returning to the business dashboard.

Product pages retry using permitted catalog columns when the extended-description
query is denied or the column is missing. The listing still opens with a notice
that more details are temporarily unavailable; failures of the base query remain
errors. Run `node --env-file=.env.local scripts/check-product-page.mjs` to verify
the same loader against a live product without creating accounts or changing data.

Personal accounts access business registration from Profile or Sell on Hatti.
There is one business per auth user, matching the existing account_id unique
constraint. Users may use a separate email/account for an independent business.
No dummy business is automatically claimed and no accounts are created by testing.

Cards use a stretched React Router Link, with quantity controls above the link hit
area. Minus removes the last unit and is disabled at zero. Product descriptions on
cards stay short; further_description is selected only for the detail page.
`each` is omitted from stock labels. Product photos use product-images with an
illustration fallback. Uploads accept JPEG/PNG/WebP under 5 MB, using a fresh product
UUID and user UUID folder. Failed listing creation attempts remove only their new,
unused image. Price input is CAD dollars, converted to integer cents for the DB.

Realtime subscriptions re-fetch the catalog and active detail page after product
INSERT/UPDATE/DELETE events, debouncing bursts. Cards remain visible during catalog
refreshes. Focus, online, and channel reconnect trigger resync. Subscriptions,
event listeners, timers, and in-flight reads are cleaned up. This is a shopping
basket, not a stock reservation or checkout system.

## Required database setup

The connected MCP is read-only. This implementation has NOT changed the database.
Run `supabase/migrations/202610150001_business_listings.sql` in the same project's
SQL Editor as administrator. It supplies:

- SELECT for further_description and the public catalog columns;
- hatti_my_business() and hatti_owns_business(uuid), with fixed search paths,
  auth-derived ownership and no public account_id exposure;
- authenticated business INSERT and owned product INSERT with RLS checks;
- own-folder storage upload and unused-image cleanup policies.

Live inspection before implementation: the RPC is absent, neither browser role
can INSERT, and there are no storage object policies. Products is already in the
supabase_realtime publication. Exact public API tests now pass for Businesses,
regular product fields, and an uploaded JPEG. The detail projection fails with
42501 until the new-column SELECT grant is applied. Do not run the old phase-1
migration afterward: its historical column grants omit newer catalog fields.

The migration targets the inspected live schema (further_description text,
description length <=150, unique nullable account_id). It may be rerun against its
own function signatures/policy names. A different existing hatti_my_business()
return signature requires review before applying. No existing rows are modified.
The existing public product-images bucket is reused. For server-enforced file
limits, configure that bucket's size limit (5 MB) and allowed MIME types as well.

## Verification

Run `npm test`, `npm run build`, `npm run lint`.
Run `node --env-file=.env.local scripts/check-catalog.mjs strawberries.jpg` for
read-only public API and image probes, including the detail projection.

After SQL setup, use two test accounts to verify that A cannot publish for B or
upload under B's folder, private account_id reads remain denied, and guest writes
fail. Register a business, publish a product, follow its generated URL, and open a
second browser to verify that stock/availability/text changes update both catalog
and detail pages. Verify minus at zero/one, stock reductions, deletion, and an
unknown UUID. Browser interactions, actual uploads and realtime delivery require
manual live verification; unit/render tests do not establish those outcomes.
