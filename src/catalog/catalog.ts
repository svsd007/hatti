import type { Business, CatalogProduct, Product } from "./types.ts";
import type { CartProduct } from "../cart/cart.ts";

export const BUSINESS_COLUMNS = "id,name,description,location";
export const PRODUCT_COLUMNS = "id,created_at,business_id,name,description,is_available,price,unit,category,stock_quantity,image_path";
export const PRODUCT_DETAIL_COLUMNS = `${PRODUCT_COLUMNS},further_description`;
export const isProductId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function stockLabel(product: Product): string {
  if (product.is_available !== true) return "Currently unavailable";
  if (product.stock_quantity != null && product.stock_quantity <= 0) return "Out of stock";
  if (product.stock_quantity == null) return "Stock not specified";
  return `${product.stock_quantity}${product.unit.trim().toLowerCase() === "each" ? "" : ` ${product.unit}`} in stock`;
}

export function joinProducts(products: Product[], businesses: Business[]): CatalogProduct[] {
  const farms = new Map(businesses.map(business => [business.id, business.name?.trim() || "Unnamed farm"]));
  return products.map(product => ({ ...product, farmName: farms.get(product.business_id) ?? "Farm details unavailable" }));
}

// Integer prices are interpreted as CAD cents; keep conversion in one place.
export function toCartProduct(product: CatalogProduct): CartProduct {
  return { id: product.id, name: product.name, farmName: product.farmName,
    priceCents: product.price, unit: product.unit,
    available: product.is_available === true,
    stockQuantity: product.stock_quantity };
}

export function productAccent(name: string): string {
  const value = name.toLowerCase();
  if (value.includes("strawber")) return "strawberry";
  if (value.includes("blueber")) return "blueberry";
  return ["tomato", "corn", "zucchini", "peach", "kale", "carrot"].find(kind => value.includes(kind)) ?? "kale";
}

// Relative paths belong to the product-images bucket; full HTTPS URLs also work.
export function productImageUrl(path: string | null, projectUrl: string): string | null {
  if (!path?.trim()) return null;
  const value = path.trim();
  if (/^https:\/\//i.test(value)) {
    try { const url = new URL(value); return url.username || url.password ? null : url.href; }
    catch { return null; }
  }
  if (value.includes(":") || value.startsWith("/") || value.includes("\\")) return null;
  const parts = value.split("/");
  if (parts.some(part => !part || part === "." || part === "..")) return null;
  if (parts[0] !== "product-images") parts.unshift("product-images");
  if (parts.length < 2) return null;
  return `${projectUrl.replace(/\/$/, "")}/storage/v1/object/public/${parts.map(encodeURIComponent).join("/")}`;
}

export function filterProducts(products: CatalogProduct[], category: string, query: string) {
  const search = query.trim().toLowerCase();
  return products.filter(product => (category === "All" || product.category === category) &&
    `${product.name} ${product.farmName} ${product.description ?? ""} ${product.category ?? ""}`.toLowerCase().includes(search));
}

export async function readAllPages<T>(read: (from: number, to: number) => PromiseLike<{
  data: T[] | null; error: { message: string } | null;
}>, signal: AbortSignal): Promise<T[]> {
  const result: T[] = [];
  // Advance by the actual response length, including projects with smaller API caps.
  for (;;) {
    signal.throwIfAborted();
    const { data, error } = await read(result.length, result.length + 499);
    if (error) throw new Error(error.message);
    if (!data?.length) return result;
    result.push(...data);
  }
}
