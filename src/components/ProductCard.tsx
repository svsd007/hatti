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
        <span>{name.charAt(0)}</span>
      </div>
      <div className="card-body-content">
        <div>
          <h3>{name}</h3>
          <p>{farmName}</p>
        </div>
        <div className="product-footer">
          <strong>{price}</strong>
          <button className="btn hatti-add-btn" type="button">
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
