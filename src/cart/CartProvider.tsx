import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { CartContext } from "./CartContext";
import { addItem, CART_KEY, decrementItem, readCart, setItemQuantity } from "./cart";
import type { CartItem } from "./cart";
import { useCatalog } from "../catalog/CatalogContext";
import { toCartProduct } from "../catalog/catalog";

export default function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const [items, setItems] = useState(() => {
    try { return readCart(localStorage.getItem(CART_KEY)); }
    catch { return []; }
  });
  const current = useRef(items);
  const [storageError, setStorageError] = useState(false);
  const [message, setMessage] = useState("");
  const liveProducts = new Map(catalog.products.map(product => [product.id, toCartProduct(product)]));
  function reconcile(saved: CartItem[]) {
    return saved.map(item => {
      const live = liveProducts.get(item.id);
      return live ? { ...live, quantity: item.quantity } : { ...item, available: false };
    });
  }
  const displayedItems = reconcile(items);

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
      items: displayedItems,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      storageError,
      add: product => {
        const live = liveProducts.get(product.id);
        if (!live) return;
        update(addItem(reconcile(current.current), live), `${live.name} added to your cart.`);
      },
      setQuantity: (id, quantity) => update(setItemQuantity(reconcile(current.current), id, quantity), "Cart quantity updated."),
      remove: id => update(current.current.filter(item => item.id !== id), "Item removed from your cart."),
      decrement: id => update(decrementItem(current.current, id), "Basket quantity decreased."),
      clear: () => update([], "Cart cleared."),
    }}>
      {children}
      <div className="visually-hidden" role="status">{message}</div>
    </CartContext.Provider>
  );
}
