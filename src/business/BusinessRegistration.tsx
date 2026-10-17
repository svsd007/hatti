import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { BUSINESS_COLUMNS } from "../catalog/catalog";
import { useCatalog } from "../catalog/CatalogContext";

export default function BusinessRegistration({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const catalog = useCatalog();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true; setBusy(true); setError(null);
    try {
      if (!name.trim() || !location.trim()) throw new Error("Enter your business name and location.");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please log in again before registering your business.");
      const { error: failure } = await supabase.from("Businesses").insert({
        name: name.trim(), location: location.trim(), description: description.trim() || null, account_id: user.id,
      }).select(BUSINESS_COLUMNS).single();
      if (failure?.code === "23505") { onCreated(); throw new Error("This account already has a business."); }
      if (failure) throw new Error("We couldn't register your business. Please try again or contact Hatti support.");
      catalog.refresh(); onCreated();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not register business."); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <section className="hatti-card business-form">
    <h2>Register your farm or business</h2><p>Your existing account will also be your business account.</p>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
      <label>Business name<input className="form-control" required maxLength={150} value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Location<input className="form-control" required maxLength={200} placeholder="City, province" value={location} onChange={e => setLocation(e.target.value)} /></label>
      <label>About your business<textarea className="form-control" maxLength={2000} rows={4} value={description} onChange={e => setDescription(e.target.value)} /></label>
      <button className="btn hatti-primary-btn" type="submit">{busy ? "Registering…" : "Create business"}</button>
    </fieldset></form>
  </section>;
}
