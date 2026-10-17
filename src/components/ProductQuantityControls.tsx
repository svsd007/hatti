import { useCart } from "../cart/CartContext";
import { quantityLimit } from "../cart/cart";
import type { CartProduct } from "../cart/cart";
import { useCatalog } from "../catalog/CatalogContext";

export default function ProductQuantityControls({ product }: { product: CartProduct }) {
  const { items, add, decrement } = useCart();
  const catalog = useCatalog();
  const quantity = items.find(item => item.id === product.id)?.quantity ?? 0;
  const limit = quantityLimit(product);
  return <div className="product-quantity" role="group" aria-label={`Basket quantity for ${product.name}`}>
    <button type="button" className="btn hatti-add-btn" disabled={quantity === 0}
      aria-label={`Remove one ${product.name} from cart`} onClick={() => decrement(product.id)}>−</button>
    <output aria-live="polite" aria-label={`${product.name} quantity in cart`}>{quantity}</output>
    <button type="button" className="btn hatti-add-btn" disabled={catalog.loading || Boolean(catalog.productError) || quantity >= limit}
      aria-label={`Add ${product.name} from ${product.farmName} to cart`}
      title={limit === 0 ? "Currently unavailable" : quantity >= limit ? "Stock limit reached" : "Add one"}
      onClick={() => add(product)}>+</button>
  </div>;
}
