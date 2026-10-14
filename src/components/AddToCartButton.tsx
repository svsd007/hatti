import { useCart } from "../cart/CartContext";
import { MAX_QUANTITY } from "../cart/cart";
import type { CartProduct } from "../cart/cart";
import Icon from "./Icon";

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const { items, add } = useCart();
  const quantity = items.find(item => item.id === product.id)?.quantity ?? 0;
  return (
    <button className="btn hatti-add-btn" type="button"
      aria-label={`Add ${product.name} from ${product.farmName} to cart`}
      disabled={quantity >= MAX_QUANTITY} onClick={() => add(product)}>
      <Icon name={quantity ? "check" : "plus"} /><span>{quantity ? `Add (${quantity})` : "Add"}</span>
    </button>
  );
}
