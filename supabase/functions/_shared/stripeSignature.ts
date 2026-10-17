import Stripe from "npm:stripe@18.5.0";

export async function verifyTestEvent(stripe: Stripe, body: string, signature: string, secret: string) {
  const event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, Stripe.createSubtleCryptoProvider());
  if (event.livemode) throw new Error("Test events only");
  return event;
}
