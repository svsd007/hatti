import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { authErrorMessage } from "./authUtils.ts";

export interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
}

// Kept separate so lifecycle races can be tested without mounting the whole app.
export function observeSession(
  auth: Pick<SupabaseClient["auth"], "getSession" | "onAuthStateChange">,
  publish: (state: AuthState) => void,
) {
  let active = true;
  let revision = 0;
  const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
    revision++;
    if (active) publish({ session, loading: false, error: null });
  });
  const initialRevision = revision;
  void auth.getSession().then(({ data, error }) => {
    if (active && revision === initialRevision) {
      publish({ session: error ? null : data.session, loading: false, error: error ? authErrorMessage(error) : null });
    }
  }).catch((error: unknown) => {
    if (active && revision === initialRevision) publish({ session: null, loading: false, error: authErrorMessage(error) });
  });
  return () => { active = false; subscription.unsubscribe(); };
}
