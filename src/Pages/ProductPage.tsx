import { Link, useParams } from "react-router-dom";
import { useProduct } from "../catalog/useProduct";
import { money } from "../cart/cart";
import { stockLabel, toCartProduct } from "../catalog/catalog";
import ProductImage from "../components/ProductImage";
import ProductQuantityControls from "../components/ProductQuantityControls";

export default function ProductPage() {
  const { id = "" } = useParams();
  const { product, loading, error, retry } = useProduct(id);
  if (loading) return <p role="status">Loading product…</p>;
  if (error) return <section className="hatti-card cart-empty" role="alert"><h1>Couldn't load this product</h1>
    <p>{error}</p><button className="btn hatti-add-btn" onClick={retry}>Try again</button></section>;
  if (!product) return <section className="hatti-card cart-empty"><h1>Product not found.</h1>
    <p>This listing may have been removed.</p><Link to="/fresh-produce">Browse produce</Link></section>;
  return <>
    <Link className="section-link" to="/fresh-produce">← Back to produce</Link>
    <section className="product-detail hatti-card">
      <ProductImage name={product.name} path={product.image_path} />
      <div>
        <p className="section-kicker">{product.category || "Fresh from our growers"}</p>
        <h1>{product.name}</h1>
        <Link to={`/farmers/${product.business_id}`}>{product.farmName}</Link>
        {product.description && <p className="product-description">{product.description}</p>}
        <p className="product-price">{money(product.price)} / {product.unit}</p>
        <p>{stockLabel(product)}</p>
        <ProductQuantityControls product={toCartProduct(product)} />
        <p className="farmer-description">All prices in CAD. Basket quantities do not reserve stock.</p>
      </div>
      <div className="product-further"><h2>About this product</h2>
        <p>{product.detailsUnavailable ? "More product details are temporarily unavailable." : product.further_description?.trim() || "The grower hasn't added more details yet."}</p>
        <dl><dt>Unit</dt><dd>{product.unit}</dd><dt>Category</dt><dd>{product.category || "Uncategorized"}</dd>
          <dt>Listed</dt><dd>{new Date(product.created_at).toLocaleDateString("en-CA")}</dd></dl>
      </div>
    </section>
  </>;
}
