import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { CartContext } from "./CartContext";
import { addItem, CART_KEY, readCart, setItemQuantity } from "./cart";
import type { CartItem } from "./cart";

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState(() => {
    try { return readCart(localStorage.getItem(CART_KEY)); }
    catch { return []; }
  });
  const current = useRef(items);
  const [storageError, setStorageError] = useState(false);
  const [message, setMessage] = useState("");

  function update(next: CartItem[], announcement: string) {
    current.current = next;
    setItems(next);
    setMessage(announcement);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      storageError,
      add: product => update(addItem(current.current, product), `${product.name} added to your cart.`),
      setQuantity: (id, quantity) => update(setItemQuantity(current.current, id, quantity), "Cart quantity updated."),
      remove: id => update(current.current.filter(item => item.id !== id), "Item removed from your cart."),
      clear: () => update([], "Cart cleared."),
    }}>
      {children}
      <div className="visually-hidden" role="status">{message}</div>
    </CartContext.Provider>
  );
}
