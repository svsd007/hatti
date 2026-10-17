import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCatalog } from "../catalog/CatalogContext";
import { imageExtension, priceInCents } from "./listing";
import type { ProductDetails } from "../catalog/types";
import { requireBusinessOwner } from "./ownership";

export default function ProductListingForm({ businessId, product, onSaved, onCancel }: { businessId: string; product?: ProductDetails; onSaved?: () => void; onCancel?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const submitting = useRef(false);
  const catalog = useCatalog();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    let uploaded: string | null = null;
    let saved = false;
    submitting.current = true; setBusy(true); setError(null); setCreated(null);
    try {
      const text = (key: string) => String(data.get(key) ?? "").trim();
      const price = priceInCents(text("price"));
      const stockText = text("stock");
      const stock = stockText ? Number(stockText) : null;
      if (stock !== null && (!Number.isInteger(stock) || stock < 0 || stock > 2147483647)) throw new Error("Stock must be a nonnegative whole number.");
      if (!text("name") || !text("unit")) throw new Error("Enter a product name and unit.");
      if (text("description").length > 150) throw new Error("Keep the card description to 150 characters.");
      const file = data.get("image");
      const extension = file instanceof File && file.size > 0 ? imageExtension(file) : null;
      const user = await requireBusinessOwner(supabase, businessId);
      if (product && product.business_id !== businessId) throw new Error("This listing belongs to another business.");
      const id = product?.id ?? crypto.randomUUID();
      if (extension && file instanceof File) {
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type });
        if (uploadError) throw new Error("Image upload failed. Please try again with a JPEG, PNG, or WebP under 5 MB.");
        uploaded = path;
      }
      const values = {
        name: text("name"), description: text("description") || null,
        further_description: text("further_description") || null, price, unit: text("unit"),
        category: text("category") || null, stock_quantity: stock, is_available: data.get("available") === "on", image_path: uploaded ?? product?.image_path ?? null,
      };
      const mutation = product
        ? supabase.from("products").update(values).eq("id", id).eq("business_id", businessId)
        : supabase.from("products").insert({ ...values, id, business_id: businessId });
      const { error: failure } = await mutation.select("id").single();
      if (failure) throw new Error("Could not save this listing. Please try again or contact Hatti support.");
      saved = true; setCreated(id); if (!product) form.reset(); catalog.refresh(); onSaved?.();
    } catch (failure) {
      let message = failure instanceof Error ? failure.message : "Could not publish listing.";
      if (uploaded && !saved) {
        const { error: cleanupError } = await supabase.storage.from("product-images").remove([uploaded]);
        if (cleanupError) message += " The unused uploaded image could not be removed; contact support for cleanup.";
      }
      setError(message);
    } finally { submitting.current = false; setBusy(false); }
  }
  return <section className="hatti-card business-form">
    <h2>{product ? "Edit product listing" : "Add a product listing"}</h2>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {created && <p className="auth-notice" role="status">Your product is saved. <Link to={`/products/${created}`}>View listing</Link></p>}
    <form onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>
      <label>Product name<input name="name" defaultValue={product?.name} className="form-control" required maxLength={150} /></label>
      <label>Card description (up to 150 characters)<textarea name="description" defaultValue={product?.description ?? ""} className="form-control" maxLength={150} rows={2} /></label>
      <label>Full product details<textarea name="further_description" defaultValue={product?.further_description ?? ""} className="form-control" maxLength={20000} rows={6} /></label>
      <div className="form-pair"><label>Price (CAD)<input name="price" defaultValue={product ? (product.price / 100).toFixed(2) : ""} className="form-control" type="number" min="0" max="1000000" step="0.01" placeholder="5.99" required /></label>
        <label>Unit<select name="unit" className="form-control" defaultValue={product?.unit ?? "each"}>{product && !["each", "lb", "kg", "bunch", "basket", "bag", "box"].includes(product.unit) && <option value={product.unit}>{product.unit}</option>}<option value="each">Each</option><option value="lb">Pound</option><option value="kg">Kilogram</option><option value="bunch">Bunch</option><option value="basket">Basket</option><option value="bag">Bag</option><option value="box">Box</option></select></label></div>
      <div className="form-pair"><label>Category<input name="category" defaultValue={product?.category ?? ""} className="form-control" maxLength={100} placeholder="e.g. Vegetables" /></label>
        <label>Stock quantity (optional)<input name="stock" defaultValue={product?.stock_quantity ?? ""} className="form-control" type="number" min="0" step="1" max="2147483647" /></label></div>
      <label className="checkbox-label"><input name="available" type="checkbox" defaultChecked={product ? product.is_available === true : true} /> Available for purchase</label>
      <label>Product image (optional)<input name="image" className="form-control" type="file" accept="image/jpeg,image/png,image/webp" /><small>JPEG, PNG, or WebP, up to 5 MB. {product && "Leave empty to keep the current image."}</small></label>
      <button type="submit" className="btn hatti-primary-btn">{busy ? "Saving…" : product ? "Save changes" : "Publish product"}</button>
    {onCancel && <button type="button" className="btn hatti-add-btn" onClick={onCancel}>Cancel</button>}
    </fieldset></form>
  </section>;
}
