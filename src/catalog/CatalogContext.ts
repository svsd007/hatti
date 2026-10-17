import { createContext, useContext } from "react";
import type { Business, CatalogProduct } from "./types";

export interface CatalogValue {
  businesses: Business[];
  products: CatalogProduct[];
  loading: boolean;
  businessError: string | null;
  productError: string | null;
  refresh: () => void;
}
export const CatalogContext = createContext<CatalogValue | null>(null);
export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("CatalogProvider is missing");
  return catalog;
}
