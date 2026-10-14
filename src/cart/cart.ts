export interface CartProduct {
  id: string;
  name: string;
  farmName: string;
  priceCents: number;
  unit: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export const CART_KEY = "hatti.cart.v1";
export const MAX_QUANTITY = 99;

export function productFromDisplay(name: string, farmName: string, price: string, kind = "produce"): CartProduct {
  const match = /^\$(\d+)\.(\d{2})(?:\s*\/\s*(\w+)|\s+(each))?$/.exec(price);
  if (!match) throw new Error(`Invalid product price: ${price}`);
  return {
    id: JSON.stringify([kind, farmName, name]),
    name,
    farmName,
    priceCents: Number(match[1]) * 100 + Number(match[2]),
    unit: match[3] ?? (kind === "deal" ? "bundle" : "each"),
  };
}

export function readCart(raw: string | null): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object" ||
        ![item.id, item.name, item.farmName, item.unit].every(value => typeof value === "string" && value.length > 0) ||
        !Number.isSafeInteger(item.priceCents) || item.priceCents < 0 || item.priceCents > 100000000 ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function addItem(items: CartItem[], product: CartProduct): CartItem[] {
  const existing = items.find(item => item.id === product.id);
  return existing
    ? items.map(item => item.id === product.id ? { ...product, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item)
    : [...items, { ...product, quantity: 1 }];
}

export function setItemQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return items;
  return items.map(item => item.id === id ? { ...item, quantity } : item);
}

export const subtotal = (items: CartItem[]) => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
export const money = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
