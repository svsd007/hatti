import AddToCartButton from "./AddToCartButton";
import { productFromDisplay } from "../cart/cart";
import ProduceArt from "./ProduceArt";

interface ProductCardProps {
  name: string;
  farmName: string;
  price: string;
  accent: string;
}

function ProductCard({ name, farmName, price, accent }: ProductCardProps) {
  return (
    <article className="hatti-card product-card h-100">
      <div className={`product-image ${accent}`} aria-hidden="true">
        <ProduceArt kind={accent} />
      </div>
      <div className="card-body-content">
        <div>
          <h3>{name}</h3>
          <p>{farmName}</p>
        </div>
        <div className="product-footer">
          <strong>{price}</strong>
          <AddToCartButton product={productFromDisplay(name, farmName, price)} />
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
