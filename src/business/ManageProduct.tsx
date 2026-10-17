import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { PRODUCT_DETAIL_COLUMNS } from "../catalog/catalog";
import type { CatalogProduct, ProductDetails } from "../catalog/types";
import { useCatalog } from "../catalog/CatalogContext";
import { requireBusinessOwner } from "./ownership";
import ProductListingForm from "./ProductListingForm";

export default function ManageProduct({ product }: { product: CatalogProduct }) {
  const [editing, setEditing] = useState<ProductDetails | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const catalog = useCatalog();
  async function act(remove: boolean) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(null);
    try {
      await requireBusinessOwner(supabase, product.business_id);
      if (remove) {
        const { error } = await supabase.from("products").delete().eq("id", product.id)
          .eq("business_id", product.business_id).select("id").single();
        if (error) throw new Error("Could not delete this listing. Please retry.");
        setConfirmDelete(false); catalog.refresh();
      } else {
        // Never edit a partial response: missing detail access must not erase saved text.
        const { data, error } = await supabase.from("products").select(PRODUCT_DETAIL_COLUMNS)
          .eq("id", product.id).eq("business_id", product.business_id).single();
        if (error || !data) throw new Error("Could not load all product details for editing. Check business permissions and retry.");
        setEditing({ ...data, farmName: product.farmName } as ProductDetails);
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not manage listing."); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className="business-form mt-3">
    {error && <p role="alert" className="auth-error">{error}</p>}
    {editing ? <ProductListingForm key={editing.id} businessId={product.business_id} product={editing}
      onSaved={() => setEditing(null)} onCancel={() => setEditing(null)} /> : <>
      <div className="auth-actions"><button className="btn hatti-add-btn" disabled={busy || confirmDelete} onClick={() => void act(false)}>Edit listing</button>
        <button className="btn hatti-add-btn" disabled={busy || confirmDelete} onClick={() => setConfirmDelete(true)}>Delete listing</button></div>
      {confirmDelete && <div role="group" aria-label={`Delete ${product.name}`}>
        <p>Delete “{product.name}”? This removes the listing permanently. Its uploaded image will be kept.</p>
        <button className="btn hatti-primary-btn" disabled={busy} onClick={() => void act(true)}>{busy ? "Deleting…" : "Confirm delete"}</button>
        <button className="btn hatti-add-btn" disabled={busy} onClick={() => setConfirmDelete(false)}>Cancel</button>
      </div>}
    </>}
  </div>;
}
