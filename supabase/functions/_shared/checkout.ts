export interface CheckoutItem { id: string; quantity: number }
export interface CheckoutProduct { id: string; business_id: string; name: string; unit: string; price: number; is_available: boolean | null; stock_quantity: number | null }
export const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseItems(value: unknown): CheckoutItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw new Error("Choose between 1 and 50 products.");
  const seen = new Set<string>();
  return value.map(item => {
    if (!item || typeof item.id !== "string" || !uuid.test(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("Invalid product or quantity.");
    const id = item.id.toLowerCase();
    if (seen.has(id)) throw new Error("Duplicate product IDs are not allowed.");
    seen.add(id);
    return { id, quantity: item.quantity };
  });
}

export function priceCart(items: CheckoutItem[], products: CheckoutProduct[]) {
  const lines = items.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product || product.is_available !== true) throw new Error("A product is no longer available. Refresh your cart.");
    const nil = "00000000-0000-0000-0000-000000000000";
    if (!uuid.test(product.id) || product.id === nil || !uuid.test(product.business_id) || product.business_id === nil
      || typeof product.name !== "string" || !product.name.trim() || product.name !== product.name.trim()
      || typeof product.unit !== "string" || !product.unit.trim() || product.unit !== product.unit.trim()
      || Array.from(product.unit).length > 40 || Array.from(`${product.name} / ${product.unit}`).length > 200
      || Array.from(product.name + product.unit).some(char => char.codePointAt(0)! < 32 || (char.codePointAt(0)! >= 127 && char.codePointAt(0)! <= 159))) {
      throw new Error("A product has invalid listing details. Contact the seller before paying.");
    }
    if (!Number.isSafeInteger(product.price) || product.price < 0 || product.price > 99999999) throw new Error("A product has an invalid price.");
    if (product.stock_quantity !== null && (!Number.isInteger(product.stock_quantity) || product.stock_quantity < item.quantity)) throw new Error("Insufficient stock. Refresh your cart.");
    return { ...product, quantity: item.quantity };
  });
  const total = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  if (!Number.isSafeInteger(total) || total < 50 || total > 99999999) throw new Error("Checkout total must be between CA$0.50 and CA$999,999.99.");
  return lines;
}

export function testKey(key: string | undefined): string {
  if (!key?.startsWith("sk_test_")) throw new Error("Stripe test mode is not configured.");
  return key;
}
