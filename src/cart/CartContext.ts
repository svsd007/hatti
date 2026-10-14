import { createContext, useContext } from "react";
import type { CartItem, CartProduct } from "./cart";

interface CartValue {
  items: CartItem[];
  count: number;
  storageError: boolean;
  add: (product: CartProduct) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const CartContext = createContext<CartValue | null>(null);
export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider is missing");
  return cart;
}
