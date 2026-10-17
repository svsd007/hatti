import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useCart } from "../cart/CartContext";
import { supabase } from "../lib/supabase";

export default function CheckoutButton({ disabled }: { disabled: boolean }) {
  const { user, loading } = useAuth();
  const { items } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const attempt = useRef({ cart: "", id: "" });
  async function checkout() {
    if (pending.current || disabled || !items.length) return;
    pending.current = true; setBusy(true); setError(null);
    try {
      const selected = items.map(({ id, quantity }) => ({ id, quantity }));
      const cart = JSON.stringify({ user: user?.id, items: selected });
      if (attempt.current.cart !== cart) attempt.current = { cart, id: crypto.randomUUID() };
      const { data, error: failure } = await supabase.functions.invoke("create-checkout-session", {
        body: { items: selected, requestId: attempt.current.id },
      });
      if (failure) {
        let message = "Test checkout is unavailable. Please try again after setup is complete.";
        if (failure.context instanceof Response) {
          const body = await failure.context.json().catch(() => null);
          if (typeof body?.error === "string") message = body.error;
        }
        throw new Error(message);
      }
      const url = new URL(data?.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com" || url.username || url.password) throw new Error("Invalid checkout response.");
      window.location.assign(url.href);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Checkout failed."); }
    finally { pending.current = false; setBusy(false); }
  }
  if (!user && !loading) return <Link to="/login?next=%2Fcart" className="btn hatti-primary-btn">Log in to checkout</Link>;
  return <>
    <button className="btn hatti-primary-btn" disabled={disabled || busy || loading} onClick={() => void checkout()}>{busy ? "Opening Stripe…" : "Checkout — test mode"}</button>
    {error && <p role="alert" className="auth-error">{error}</p>}
  </>;
}
