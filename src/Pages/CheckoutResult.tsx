import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { money } from "../cart/cart";

export default function CheckoutResult({ cancelled = false }: { cancelled?: boolean }) {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [recorded, setOrder] = useState<{ id: string; total_cents: number; sessionId: string } | null>(null);
  const order = recorded?.sessionId === sessionId ? recorded : null;
  const [message, setMessage] = useState("Waiting for Stripe's verified payment confirmation…");
  useEffect(() => {
    if (cancelled || !sessionId?.startsWith("cs_test_")) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const controller = new AbortController();
    async function check() {
      const { data, error } = await supabase.from("orders").select("id,total_cents").eq("stripe_session_id", sessionId!)
        .eq("status", "paid").eq("is_test", true).abortSignal(controller.signal).maybeSingle();
      if (!active) return;
      if (data) { setOrder({ ...data, sessionId: sessionId! }); return; }
      if (error) { setMessage("We couldn't check your order. Please retry later; don't pay again while confirmation is pending."); return; }
      if (++attempts < 15) timer = setTimeout(() => void check(), 2000);
      else setMessage("Payment confirmation is still pending. Check this page again later before attempting another payment.");
    }
    void check();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [cancelled, sessionId]);
  return <section className="hatti-card auth-card">
    <p className="section-kicker">Stripe test checkout</p>
    <h1>{cancelled ? "Checkout cancelled." : order ? "Test payment confirmed." : "Confirming your test payment."}</h1>
    <p role="status">{cancelled ? "You returned without completing this checkout. Your basket has been kept." : order ? `Order ${order.id} · ${money(order.total_cents)} CAD` : !sessionId?.startsWith("cs_test_") ? "No valid test checkout reference was provided." : message}</p>
    <p>No real money is collected. Your basket is kept; returning here alone never marks an order as paid.</p>
    <Link to="/cart" className="btn hatti-add-btn">Back to basket</Link>
    {!cancelled && !order && <button className="btn hatti-add-btn" onClick={() => window.location.reload()}>Check again</button>}
  </section>;
}
