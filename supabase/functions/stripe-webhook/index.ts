import Stripe from "npm:stripe@18.5.0";
import { adminClient, stripeClient } from "../_shared/clients.ts";
import { uuid } from "../_shared/checkout.ts";
import { verifyTestEvent } from "../_shared/stripeSignature.ts";

Deno.serve(async req => {
  if (req.method !== "POST") return new Response("Use POST", { status: 405 });
  let stripe;
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  try { stripe = stripeClient(); if (!secret?.startsWith("whsec_")) throw new Error(); }
  catch { return new Response("Webhook not configured", { status: 503 }); }
  let event: Stripe.Event;
  try {
    event = await verifyTestEvent(stripe, await req.text(), req.headers.get("stripe-signature") ?? "", secret!);
  } catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.livemode) return new Response("Test events only", { status: 400 });
  if (event.type !== "checkout.session.completed") return new Response("Ignored", { status: 200 });
  const session = event.data.object;
  if (session.metadata?.app !== "hatti-test") return new Response("Ignored", { status: 200 });
  if (session.livemode || session.mode !== "payment" || session.payment_status !== "paid" || session.currency !== "cad") return new Response("Invalid payment", { status: 400 });
  const userId = session.metadata.user_id;
  if (!uuid.test(userId ?? "") || session.client_reference_id !== userId) return new Response("Invalid customer", { status: 400 });
  try {
    // Cross-check the signed event against the Session retrieved using our test key.
    const confirmed = await stripe.checkout.sessions.retrieve(session.id);
    if (confirmed.livemode || confirmed.mode !== "payment" || confirmed.status !== "complete"
      || confirmed.payment_status !== "paid" || confirmed.currency !== "cad"
      || confirmed.amount_total !== session.amount_total || confirmed.currency !== session.currency
      || !Number.isSafeInteger(confirmed.amount_total) || confirmed.amount_total! < 50
      || confirmed.amount_total! > 99999999 || confirmed.client_reference_id !== userId
      || confirmed.metadata?.user_id !== userId || confirmed.metadata?.app !== "hatti-test") {
      throw new Error("Checkout Session verification failed");
    }
    // Stripe line-item prices are the purchase-time prices. Product names/metadata
    // originate on our server, but Stripe administrators can subsequently edit them.
    const purchased = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100, expand: ["data.price.product"] });
    if (purchased.has_more || !purchased.data.length) throw new Error("Invalid line items");
    const items = purchased.data.map(line => {
      const product = line.price?.product;
      const cents = line.price?.unit_amount;
      if (!product || typeof product === "string" || product.deleted === true || !uuid.test(product.metadata.product_id ?? "") || !uuid.test(product.metadata.business_id ?? "") ||
        !Number.isInteger(line.quantity) || !line.quantity || line.quantity < 1 || line.quantity > 99
        || !Number.isSafeInteger(cents) || cents! < 0 || cents! > 99999999
        || line.currency !== "cad" || line.price?.currency !== "cad"
        || line.amount_total !== cents! * line.quantity) throw new Error("Invalid purchase snapshot");
      return { product_id: product.metadata.product_id, business_id: product.metadata.business_id,
        name: product.name, unit: product.metadata.unit, quantity: line.quantity, unit_price: cents };
    });
    if (items.reduce((sum, item) => sum + item.unit_price! * item.quantity, 0) !== session.amount_total) throw new Error("Total mismatch");
    const { error } = await adminClient().rpc("hatti_record_test_order", {
      p_session_id: session.id, p_event_id: event.id, p_account_id: userId,
      p_total: session.amount_total, p_items: items,
    });
    if (error) throw error;
    return new Response("Recorded", { status: 200 });
  } catch {
    // Non-2xx makes Stripe retry; the database transaction is idempotent.
    console.error("Test order recording failed", { eventId: event.id, sessionId: session.id });
    return new Response("Order recording failed; retry", { status: 500 });
  }
});
