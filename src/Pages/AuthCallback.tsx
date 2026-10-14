import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { safeDestination } from "../auth/authUtils";

export default function AuthCallback() {
  const { user, loading, error } = useAuth();
  const [params] = useSearchParams();
  const next = safeDestination(params.get("next"));
  const [callbackError] = useState(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    return params.get("error_description") ?? hash.get("error_description");
  });
  if (loading) return <p role="status">Finishing sign-in…</p>;
  if (!callbackError && !error && user) return <Navigate replace to={next} />;
  return <section className="hatti-card auth-card">
    <h1>Let’s get you signed in.</h1>
    <p role="alert">{callbackError || error || "This sign-in link has expired or could not be verified. Try logging in again."}</p>
    <Link className="btn hatti-primary-btn" to={`/login?next=${encodeURIComponent(next)}`}>Back to login</Link>
  </section>;
}
