import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { isProductId } from "./catalog";
import { loadProduct } from "./loadProduct";
import { subscribeCatalog } from "./realtime";
import type { ProductDetails } from "./types";

export function useProduct(id: string) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ id: string; product: ProductDetails | null; error: string | null } | null>(null);
  useEffect(() => subscribeCatalog(() => setRevision(value => value + 1)), []);
  useEffect(() => {
    if (!isProductId(id)) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 15000);
    async function load() {
      try {
        const product = await loadProduct(supabase, id, controller.signal);
        if (active) setState({ id, product, error: null });
      } catch {
        if (active) setState({ id, product: null, error: "We couldn't load this product. Please try again." });
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [id, revision]);
  const valid = isProductId(id);
  return { product: valid && state?.id === id ? state.product : null,
    loading: valid && state?.id !== id,
    error: valid && state?.id === id ? state.error : null,
    retry: () => setRevision(value => value + 1) };
}
