import { Link } from "react-router-dom";
import { money } from "../cart/cart";
import { stockLabel, toCartProduct } from "../catalog/catalog";
import type { CatalogProduct } from "../catalog/types";
import ProductImage from "./ProductImage";
import ProductQuantityControls from "./ProductQuantityControls";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const priceValid = Number.isSafeInteger(product.price) && product.price >= 0;
  return <article className="hatti-card product-card h-100">
    <ProductImage name={product.name} path={product.image_path} />
    <div className="card-body-content">
      <div>
        <h3><Link className="product-card-link" to={`/products/${product.id}`}>{product.name}</Link></h3>
        <p>{product.farmName}</p>
        {product.description && <p>{product.description}</p>}
        <p>{stockLabel(product)}</p>
      </div>
      <div className="product-footer">
        <strong>{priceValid ? `${money(product.price)} / ${product.unit}` : "Price unavailable"}</strong>
        <ProductQuantityControls product={toCartProduct(product)} />
      </div>
    </div>
  </article>;
}
