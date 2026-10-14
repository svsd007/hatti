import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { googleSignInAvailable, supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";
import { authErrorMessage, safeDestination } from "../auth/authUtils";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const { user, loading, error: sessionError } = useAuth();
  const [params] = useSearchParams();
  const next = safeDestination(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mounted = useRef(false);
  const submitting = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError(null);
    setNotice(null);
    if (signup && password !== confirmation) { setError("Your passwords do not match."); return; }
    submitting.current = true;
    setBusy(true);
    try {
      if (signup) {
        const { data, error: failure } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: {
            data: { display_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (failure) throw failure;
        if (mounted.current && !data.session) {
          setNotice("Check your email for a confirmation link. If you already have an account, log in instead.");
          setPassword(""); setConfirmation("");
        }
      } else {
        const { error: failure } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (failure) throw failure;
      }
    } catch (failure) { if (mounted.current) setError(authErrorMessage(failure)); }
    finally { submitting.current = false; if (mounted.current) setBusy(false); }
  }

  async function google() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true); setError(null); setNotice(null);
    try {
      if (!await googleSignInAvailable()) throw new Error("Google sign-in is unavailable. Please use email and password.");
      if (!mounted.current) return;
      const { error: failure } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (failure) throw failure;
    } catch (failure) {
      if (mounted.current) setError(authErrorMessage(failure));
    } finally { submitting.current = false; if (mounted.current) setBusy(false); }
  }

  if (loading) return <p role="status">Loading your account…</p>;
  if (user) return <Navigate replace to={next} />;
  return (
    <section className="hatti-card auth-card" aria-labelledby="auth-heading">
      <p className="section-kicker">Your Hatti account</p>
      <h1 id="auth-heading">{signup ? "Grow with your community." : "Welcome back."}</h1>
      <p>{signup ? "Create one account to shop local and, later, register your farm or business." : "Log in to manage your account and keep shopping local."}</p>
      {(error || sessionError) && <p className="auth-error" role="alert">{error || sessionError}</p>}
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <form onSubmit={submit} className="auth-form" aria-busy={busy}>
        <fieldset disabled={busy}>
          {signup && <div>
            <label htmlFor="display-name" className="form-label">Display name (optional)</label>
            <input id="display-name" className="form-control" autoComplete="name" maxLength={100} value={name} onChange={event => setName(event.target.value)} />
          </div>}
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input id="email" className="form-control" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
          </div>
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input id="password" className="form-control" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : undefined} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} aria-describedby={signup ? "password-help" : undefined} />
            {signup && <small id="password-help">Use at least 8 characters.</small>}
          </div>
          {signup && <div>
            <label htmlFor="confirm-password" className="form-label">Confirm password</label>
            <input id="confirm-password" className="form-control" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
          </div>}
          <button className="btn hatti-primary-btn" type="submit">{busy ? "Please wait…" : signup ? "Create account" : "Log in"}</button>
          <button className="btn hatti-add-btn" type="button" onClick={google}>Continue with Google</button>
        </fieldset>
      </form>
      <p className="auth-switch">{signup ? "Already have an account? " : "New to Hatti? "}
        <Link to={`/${signup ? "login" : "signup"}?next=${encodeURIComponent(next)}`}>{signup ? "Log in" : "Create an account"}</Link>
      </p>
    </section>
  );
}
