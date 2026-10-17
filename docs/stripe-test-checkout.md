# Hatti Stripe Checkout — test mode only

## Current deployment status

Read-only inspection after the user's manual SQL application confirmed the order
tables, RPC and service-role write permissions exist. The installed RPC's UUID
regex has six groups (`8-4-4-4-4-12`) instead of five (`8-4-4-4-12`), so valid
product IDs are rejected. Review `supabase/fix_order_uuid.proposed.sql` before
deployment; it repairs only that pattern and preserves the user's other edits.
Do NOT rerun the original table-creation proposal. No Edge Functions were deployed
at inspection time. No payment or replay test has been performed against this DB.

The original setup instructions below are retained for reference; the table
creation step has already been completed manually.

## Approval gate

Nothing has been deployed or applied to Supabase. Review and approve [the proposed SQL](../supabase/stripe_checkout.proposed.sql) first. It adds `orders`, `order_items`, buyer-only SELECT policies, and a service-role-only atomic recording function. It does not change existing catalog data or schemas. Do not run it if those table names now exist without reviewing their structure.

The browser cannot insert paid orders. A verified `checkout.session.completed` webhook is the only application path that records a payment. Unique session IDs prevent duplicates, including concurrent retries. Items retain their purchased name, unit, price and IDs even if listings change or are deleted. The success page reads the authenticated buyer's order under RLS; visiting its URL cannot mark anything paid.

## Manual setup (after approval)

1. In Stripe, select a **test environment** and obtain an `sk_test_...` secret key. Live keys are explicitly rejected by both functions. No Stripe publishable key is needed for this hosted redirect integration.
2. Install/login to the Supabase CLI, then link this project:
   ```powershell
   supabase login
   supabase link --project-ref guhinvriafkcnkqorpsb
   ```
3. After SQL approval, run ONLY `supabase/stripe_checkout.proposed.sql` in the project's SQL editor. Do not blindly run `db push`: this repository contains older, unrelated draft migrations.
4. Set secrets in **Supabase Dashboard → Edge Functions → Secrets**:
   - `STRIPE_SECRET_KEY`: your `sk_test_...` key.
   - `APP_ORIGIN`: the exact browser origin, e.g. `http://localhost:5173` (no trailing slash), or your HTTPS deployed Hatti origin. One origin per deployment; do not use `*`.
   - `STRIPE_WEBHOOK_SECRET`: the endpoint's `whsec_...` signing secret (step 6).
   Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` inside hosted functions. Neither service-role nor Stripe secrets may go in `VITE_` variables, frontend code, source control, chat, or screenshots.
5. After deployment approval:
   ```powershell
   supabase functions deploy create-checkout-session --project-ref guhinvriafkcnkqorpsb
   supabase functions deploy stripe-webhook --project-ref guhinvriafkcnkqorpsb
   ```
   `supabase/config.toml` disables gateway JWT verification for these functions. Checkout still verifies the user's Bearer JWT with `auth.getUser`; the webhook instead verifies Stripe's signature against the raw request body. Do not remove those checks.
6. In Stripe's test-environment webhook/event-destination settings, register:
   ```text
   https://guhinvriafkcnkqorpsb.supabase.co/functions/v1/stripe-webhook
   ```
   Subscribe to **checkout.session.completed** using snapshot events. Copy this endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`. A Stripe CLI listener has a DIFFERENT secret; never substitute that for the hosted endpoint's secret. Redeploy/retry as needed after setting secrets.
7. Serve Hatti on the exact `APP_ORIGIN`. Ensure deployed hosting serves the SPA for `/checkout/success` and `/checkout/cancel`. No frontend Stripe SDK installation is needed.

## Test checklist

- Log in, add an available product, click **Checkout — test mode**. Hosted Stripe must show a test-mode payment and CAD prices from the database.
- Use Stripe's test Visa `4242 4242 4242 4242`, a future expiry and any three-digit CVC. Never enter a real card.
- After paying, the success page initially waits for the webhook, then shows the recorded order and amount. Check the Stripe webhook delivery returns 200 and exactly one order has the purchased items.
- Resend that same event from Stripe: still one order and one set of items. This also verifies the database function's transaction/idempotency behavior.
- Cancel Checkout: the cart remains. Merely visiting the success URL must not create an order. The cart is intentionally not auto-cleared, even after payment, to avoid discarding changes made in another tab.
- Test a declined card (`4000 0000 0000 0002`); no paid order should be recorded.
- Try missing auth, invalid quantities, duplicates, unavailable products, and excessive stock: Checkout must fail. Altering client price fields must have no effect.
- An invalid webhook signature must return 400. Missing config returns 503; failed recording returns 500 so Stripe retries. Fix configuration/database errors and resend rather than paying again.
- Confirm another logged-in account cannot read the buyer's orders/items or insert/update/delete them.
- Test live-key rejection only in a local isolated environment; never enable live Stripe settings for this project.

## Deliberate test-MVP boundaries

Card payments only; no delayed payment methods, payouts, tax calculation, delivery fees, fulfillment, refunds, stock reservations, or stock decrements. Stock is checked when the session is created, not reserved while the customer is at Stripe. Concurrent sessions can therefore exceed stock: this is NOT ready for live commerce. Existing demo listings can be test-purchased. Orders are not yet integrated into the older Previous Orders prototype.

Price/availability edits during an open Checkout do not change its Stripe snapshot. Retry the basket after changes; if a request was already processed with different parameters, Stripe can reject reuse of that idempotency key (reload the cart to begin a new attempt). Browser duplicate clicks are suppressed; failed same-cart requests in the same mounted component reuse the key.

Local checks:
```powershell
npm.cmd test
npm.cmd run build
npm.cmd run lint
$env:DENO_NO_PACKAGE_JSON='1' # Keep Edge checks separate from Vite's dependency ranges.
deno check --no-lock --node-modules-dir=none supabase/functions/create-checkout-session/index.ts supabase/functions/stripe-webhook/index.ts
deno test --no-lock --node-modules-dir=none supabase/functions/tests/signature_test.ts
```

References: [Stripe Checkout](https://docs.stripe.com/payments/checkout/quickstarts), [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature), [Stripe testing](https://docs.stripe.com/testing), [Supabase function configuration](https://supabase.com/docs/guides/functions/function-configuration).
