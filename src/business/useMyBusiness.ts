import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { supabase } from "../lib/supabase";
import type { Business } from "../catalog/types";

export function useMyBusiness() {
  const { user } = useAuth();
  const owner = user?.id ?? "";
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ owner: string; revision: number; business: Business | null; error: string | null } | null>(null);
  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 15000);
    async function load() {
      try {
        const { data, error } = await supabase.rpc("hatti_my_business").abortSignal(controller.signal).returns<Business[]>();
        if (error) throw error;
        const rows: Business[] = Array.isArray(data) ? data : [];
        if (active) setState({ owner, revision, business: rows[0] ?? null, error: null });
      } catch {
        if (active) setState({ owner, revision, business: null,
          error: "Business tools are unavailable right now. Please try again or contact Hatti support." });
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [owner, revision]);
  const ready = state?.owner === owner && state?.revision === revision;
  return { business: ready ? state.business : null, error: ready ? state.error : null,
    loading: Boolean(owner) && !ready, refresh: () => setRevision(value => value + 1) };
}
