import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthState } from "./session";

export interface AuthValue extends AuthState { user: User | null }
export const AuthContext = createContext<AuthValue | null>(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is missing");
  return value;
}
