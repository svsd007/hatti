import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../auth/useAuth";
import { CatalogContext } from "./CatalogContext";
import { BUSINESS_COLUMNS, PRODUCT_COLUMNS, joinProducts, readAllPages } from "./catalog";
import type { Business, Product } from "./types";
import { subscribeCatalog } from "./realtime";

export default function CatalogProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const owner = user?.id ?? "guest";
  const [revision, setRevision] = useState(0);
  useEffect(() => subscribeCatalog(() => setRevision(value => value + 1), true), [owner]);
  const [state, setState] = useState<{
    owner: string; revision: number; businesses: Business[]; products: Product[];
    businessError: string | null; productError: string | null;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    let active = true;
    async function load() {
      const [businesses, products] = await Promise.allSettled([
        readAllPages<Business>((from, to) => supabase.from("Businesses")
          .select(BUSINESS_COLUMNS).order("id").range(from, to).abortSignal(controller.signal).returns<Business[]>(), controller.signal),
        readAllPages<Product>((from, to) => supabase.from("products")
          .select(PRODUCT_COLUMNS).order("id").range(from, to).abortSignal(controller.signal).returns<Product[]>(), controller.signal),
      ]);
      clearTimeout(timer);
      if (!active) return;
      setState({ owner, revision,
        businesses: businesses.status === "fulfilled" ? businesses.value : [],
        products: products.status === "fulfilled" ? products.value : [],
        businessError: businesses.status === "rejected" ? "Could not load farms. Check your connection or database read permissions, then retry." : null,
        productError: products.status === "rejected" ? "Could not load products. Check your connection or database read permissions, then retry." : null,
      });
    }
    void load();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [owner, revision]);

  // Keep existing cards visible during background realtime refreshes.
  const ready = state?.owner === owner;
  return <CatalogContext.Provider value={{
    businesses: ready ? state.businesses : [],
    products: ready ? joinProducts(state.products, state.businesses) : [],
    loading: !ready,
    businessError: ready ? state.businessError : null,
    productError: ready ? state.productError : null,
    refresh: () => setRevision(value => value + 1),
  }}>{children}</CatalogContext.Provider>;
}
