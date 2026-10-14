import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { observeSession } from "./session";
import type { AuthState } from "./session";
import { AuthContext } from "./useAuth";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true, error: null });
  useEffect(() => observeSession(supabase.auth, setState), []);
  return <AuthContext.Provider value={{ ...state, user: state.session?.user ?? null }}>{children}</AuthContext.Provider>;
}
