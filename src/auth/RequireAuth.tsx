import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status">Loading your account…</p>;
  if (error) return <div role="alert"><p>{error}</p><button className="btn hatti-add-btn" onClick={() => window.location.reload()}>Try again</button></div>;
  if (!user) return <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname + location.search + location.hash)}`} />;
  return children;
}
