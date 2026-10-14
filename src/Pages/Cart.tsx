


import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { MAX_QUANTITY, money, subtotal } from "../cart/cart";
import type { CartItem } from "../cart/cart";

function QuantityInput({ item }: { item: CartItem }) {
  const { setQuantity } = useCart();
  const [draft, setDraft] = useState(String(item.quantity));
  function commit() {
    const quantity = Number(draft);
    if (Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY) {
      setQuantity(item.id, quantity);
    } else {
      setDraft(String(item.quantity));
    }
  }
  return <input type="number" min="1" max={MAX_QUANTITY} step="1"
    aria-label={`Quantity of ${item.name} from ${item.farmName}`}
    value={draft} onChange={event => setDraft(event.target.value)} onBlur={commit}
    onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} />;
}

function Cart() {
  const { items, count, setQuantity, remove, clear, storageError } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Your cart</p>
        <h1>Your local harvest basket.</h1>
        <p>Review your picks and adjust quantities before your next market shop.</p>
      </section>
      {storageError && <p role="alert">Your browser could not save the cart. Keep this tab open to retain your items.</p>}
      {items.length === 0 ? (
        <section className="hatti-card cart-empty">
          <h2>Your basket is empty.</h2>
          <p>Add fresh produce or a seasonal deal to get started.</p>
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
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-quantity">
                      <button type="button" disabled={item.quantity <= 1} aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => setQuantity(item.id, item.quantity - 1)}>−</button>
                      <QuantityInput key={`${item.id}:${item.quantity}`} item={item} />
                      <button type="button" disabled={item.quantity >= MAX_QUANTITY} aria-label={`Increase ${item.name} quantity`}
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
            <div className="cart-total"><span>Subtotal</span><strong>{money(subtotal(items))}</strong></div>
            <p>All prices in CAD. Quantities are in the units shown for each product.</p>
            <p>Taxes and delivery fees are not included. Online checkout is not available yet.</p>
          </aside>
        </div>
      )}
    </>
  );
}

export default Cart;
