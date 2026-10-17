import { useCart } from "../cart/CartContext";
import { quantityLimit } from "../cart/cart";
import type { CartProduct } from "../cart/cart";
import Icon from "./Icon";

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const { items, add } = useCart();
  const quantity = items.find(item => item.id === product.id)?.quantity ?? 0;
  const limit = quantityLimit(product);
  return (
    <button className="btn hatti-add-btn" type="button"
      aria-label={`Add ${product.name} from ${product.farmName} to cart`}
      disabled={quantity >= limit} onClick={() => add(product)}>
      <Icon name={quantity ? "check" : "plus"} /><span>{limit === 0 ? "Unavailable" : quantity >= limit ? "Limit reached" : quantity ? `Add (${quantity})` : "Add"}</span>
    </button>
  );
}
