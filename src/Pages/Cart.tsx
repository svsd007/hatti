


import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { quantityLimit, money, subtotal } from "../cart/cart";
import type { CartItem } from "../cart/cart";
import { useCatalog } from "../catalog/CatalogContext";
import CatalogStatus from "../components/CatalogStatus";
import CheckoutButton from "../components/CheckoutButton";

function QuantityInput({ item }: { item: CartItem }) {
  const { setQuantity } = useCart();
  const [draft, setDraft] = useState(String(item.quantity));
  function commit() {
    const quantity = Number(draft);
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= quantityLimit(item)) {
      setQuantity(item.id, quantity);
    } else {
      setDraft(String(item.quantity));
    }
  }
  return <input type="number" min="1" max={quantityLimit(item) || 1} step="1" disabled={!quantityLimit(item)}
    aria-label={`Quantity of ${item.name} from ${item.farmName}`}
    value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit}
    onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />;
}

function Cart() {
  const { items, count, setQuantity, remove, clear, storageError } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);
  const { loading, productError, refresh } = useCatalog();
  const needsReview = items.some(item => item.quantity > quantityLimit(item));
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Your cart</p>
        <h1>Your local harvest basket.</h1>
        <p>Review your picks and adjust quantities before your next market shop.</p>
      </section>
      {storageError && <p role="alert">Your browser could not save the cart. Keep this tab open to retain your items.</p>}
      <CatalogStatus loading={loading} error={productError} empty={false} label="current availability" retry={refresh} />
      {!loading && !productError && needsReview && <p role="alert">Some saved items are unavailable or exceed current stock. Review or remove them. Stock is not reserved.</p>}
      {items.length === 0 ? (
        <section className="hatti-card cart-empty">
          <h2>Your basket is empty.</h2>
          <p>Add fresh produce to get started.</p>
          <Link to="/fresh-produce" className="btn hatti-primary-btn">Browse fresh produce</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section aria-label="Cart items">
            <div className="section-heading">
              <h2>{items.length} {items.length === 1 ? "product" : "products"} in your basket</h2>
              <button className="btn hatti-add-btn" type="button" onClick={() => setConfirmClear(true)}>Clear cart</button>
            </div>
            {confirmClear && <div className="hatti-card cart-confirm">
              <p>Remove all items from your cart?</p>
              <button className="btn hatti-add-btn" type="button" onClick={() => { clear(); setConfirmClear(false); }}>Yes, clear cart</button>{" "}
              <button className="btn hatti-add-btn" type="button" onClick={() => setConfirmClear(false)}>Keep items</button>
            </div>}
            <ul className="cart-list">
              {items.map(item => (
                <li className="hatti-card cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="farmer-location">{item.farmName}</p>
                    <p>{money(item.priceCents)} / {item.unit}</p>
                    {!loading && !productError && (quantityLimit(item) === 0
                      ? <p role="status">Unavailable — remove this item from your basket.</p>
                      : item.quantity > quantityLimit(item) && <p role="status">Only {quantityLimit(item)} available. Reduce the quantity.</p>)}
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-quantity">
                      <button type="button" disabled={item.quantity <= 1 || !quantityLimit(item)} aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => setQuantity(item.id, Math.min(quantityLimit(item), item.quantity - 1))}>−</button>
                      <QuantityInput key={`${item.id}:${item.quantity}:${quantityLimit(item)}`} item={item} />
                      <button type="button" disabled={item.quantity >= quantityLimit(item)} aria-label={`Increase ${item.name} quantity`}
                        onClick={() => setQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <small>{item.quantity} {item.unit === "each" ? "items" : item.unit}</small>
                    <button type="button" className="cart-remove" aria-label={`Remove ${item.name} from ${item.farmName}`}
                      onClick={() => remove(item.id)}>Remove</button>
                  </div>
                  <strong>{money(item.priceCents * item.quantity)}</strong>
                </li>
              ))}
            </ul>
            <Link to="/fresh-produce" className="btn hatti-add-btn">Continue shopping</Link>
          </section>
          <aside className="hatti-card cart-summary" aria-label="Cart summary">
            <h2>Basket summary</h2>
            <p>{count} units across {items.length} products</p>
            <div className="cart-total"><span>{needsReview || loading || productError ? "Saved estimate" : "Subtotal"}</span><strong>{money(subtotal(items))}</strong></div>
            <button className="btn hatti-add-btn" type="button" disabled={loading} onClick={refresh}>Refresh prices and stock</button>
            <p>All prices in CAD. Quantities are in the units shown for each product.</p>
            <p>Test payments only. No taxes or delivery fees are added. Stock is checked at checkout but not reserved.</p>
            <CheckoutButton disabled={loading || !!productError || needsReview} />
          </aside>
        </div>
      )}
    </>
  );
}

export default Cart;
