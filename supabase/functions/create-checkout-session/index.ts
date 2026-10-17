import { adminClient, stripeClient } from "../_shared/clients.ts";
import { parseItems, priceCart, uuid } from "../_shared/checkout.ts";

Deno.serve(async req => {
  const origin = Deno.env.get("APP_ORIGIN") ?? "";
  const headers = { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin", "Content-Type": "application/json" };
  const respond = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (!origin || req.headers.get("origin") !== origin) return respond(403, { error: "Origin not allowed." });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return respond(405, { error: "Use POST." });
  try {
    const db = adminClient();
    const token = req.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return respond(401, { error: "Log in before checking out." });
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) return respond(401, { error: "Your session expired. Log in again." });
    const raw = await req.text();
    if (raw.length > 15000) return respond(413, { error: "Cart is too large." });
    let items, requestId;
    try {
      const body = JSON.parse(raw);
      items = parseItems(body.items);
      requestId = body.requestId;
      if (typeof requestId !== "string" || !uuid.test(requestId)) throw new Error("Invalid checkout request.");
    } catch (error) { return respond(400, { error: error instanceof Error ? error.message : "Invalid cart." }); }
    const { data: products, error } = await db.from("products")
      .select("id,business_id,name,unit,price,is_available,stock_quantity").in("id", items.map(i => i.id));
    if (error) throw error;
    let lines;
    try { lines = priceCart(items, products ?? []); }
    catch (error) { return respond(409, { error: error instanceof Error ? error.message : "Refresh your cart." }); }
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment", payment_method_types: ["card"], client_reference_id: user.id,
      metadata: { app: "hatti-test", user_id: user.id },
      line_items: lines.map(line => ({ quantity: line.quantity, price_data: {
        currency: "cad", unit_amount: line.price,
        product_data: { name: `${line.name} / ${line.unit}`, metadata: { product_id: line.id, business_id: line.business_id, unit: line.unit } },
      } })),
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    }, { idempotencyKey: `hatti:${user.id}:${requestId}` });
    if (session.livemode || !session.url) throw new Error("Invalid test session.");
    return respond(200, { url: session.url });
  } catch {
    return respond(500, { error: "Test checkout could not be started. Check the Edge Function configuration or retry." });
  }
});
