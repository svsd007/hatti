import Stripe from "npm:stripe@18.5.0";
import { verifyTestEvent } from "../_shared/stripeSignature.ts";

// Synthetic local fixtures only. No API calls or real credentials.
const stripe = new Stripe("sk_test_local_fixture", { httpClient: Stripe.createFetchHttpClient() });
const secret = "whsec_local_fixture";
async function signed(livemode = false) {
  const payload = JSON.stringify({ id: "evt_fixture", type: "checkout.session.completed", livemode });
  const signature = await stripe.webhooks.generateTestHeaderStringAsync({ payload, secret, cryptoProvider: Stripe.createSubtleCryptoProvider() });
  return { payload, signature };
}
async function mustReject(callback: () => Promise<unknown>) {
  try { await callback(); } catch { return; }
  throw new Error("Expected verification to reject");
}
Deno.test("valid signed test webhook verifies", async () => {
  const { payload, signature } = await signed();
  if ((await verifyTestEvent(stripe, payload, signature, secret)).id !== "evt_fixture") throw new Error("Wrong event");
});
Deno.test("tampering, missing signature and wrong secret reject", async () => {
  const { payload, signature } = await signed();
  await mustReject(() => verifyTestEvent(stripe, payload + " ", signature, secret));
  await mustReject(() => verifyTestEvent(stripe, payload, "", secret));
  await mustReject(() => verifyTestEvent(stripe, payload, signature, "whsec_wrong"));
});
Deno.test("even a correctly signed live event rejects", async () => {
  const { payload, signature } = await signed(true);
  await mustReject(() => verifyTestEvent(stripe, payload, signature, secret));
});
