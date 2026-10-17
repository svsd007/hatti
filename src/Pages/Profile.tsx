import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { authErrorMessage } from "../auth/authUtils";
import { supabase } from "../lib/supabase";

function Profile() {
  const { user, loading, error: sessionError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  async function logout() {
    setBusy(true); setError(null);
    try {
      const { error: failure } = await supabase.auth.signOut({ scope: "local" });
      if (failure) throw failure;
    } catch (failure) { if (mounted.current) setError(authErrorMessage(failure)); }
    finally { if (mounted.current) setBusy(false); }
  }

  const displayName: unknown = user?.user_metadata?.display_name ?? user?.user_metadata?.full_name;
  if (loading) return <p role="status">Loading your account…</p>;
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Profile</p>
        <h1>Your local food account.</h1>
        <p>
          Your account connects you with your local food community.
        </p>
      </section>

      {(error || sessionError) && <p className="auth-error" role="alert">{error || sessionError}</p>}
      {user ? <section className="content-section row g-4">
        <div className="col-12 col-lg-6">
          <article className="hatti-card profile-card h-100">
            <h2>Account details</h2>
            {typeof displayName === "string" && displayName && <p>{displayName}</p>}
            <p>{user.email ?? "No email address available"}</p>
            <p>Joined {new Date(user.created_at).toLocaleDateString("en-CA")}</p>
            <p>Email {user.email_confirmed_at ? "confirmed" : "not yet confirmed"}</p>
            <button className="btn hatti-add-btn" type="button" disabled={busy} onClick={logout}>{busy ? "Logging out…" : "Log out"}</button>
          </article>
        </div>
        <div className="col-12 col-lg-6">
          <article className="hatti-card profile-card h-100">
            <h2>Your shopping</h2>
            <Link to="/cart">View your basket</Link>
            <Link to="/previous-orders">View order history</Link>
            <h2>Your business</h2>
            <Link to="/business">Register or manage your business</Link>
          </article>
        </div>
      </section> : <section className="hatti-card auth-card">
        <h2>Welcome to Hatti.</h2>
        <p>Log in or create an account to view your profile.</p>
        <div className="auth-actions">
          <Link className="btn hatti-primary-btn" to="/login?next=%2Fprofile">Log in</Link>
          <Link className="btn hatti-add-btn" to="/signup?next=%2Fprofile">Create account</Link>
        </div>
      </section>}
    </>
  );
}

export default Profile;
