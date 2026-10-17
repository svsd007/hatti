import ProductCard from "../components/ProductCard";
import CatalogStatus from "../components/CatalogStatus";
import { useSearchParams } from "react-router-dom";
import { useCatalog } from "../catalog/CatalogContext";
import { filterProducts } from "../catalog/catalog";

export default function FreshProduce() {
  const { products, loading, productError, businessError, refresh } = useCatalog();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "All";
  const query = params.get("q") ?? "";
  const categories = ["All", ...Array.from(new Set(products.map(product => product.category).filter((value): value is string => Boolean(value) && value !== "All"))).sort()];
  const filtered = filterProducts(products, category, query);
  return <>
    <section className="page-intro">
      <p className="section-kicker">Fresh Produce</p>
      <h1>Shop what local farms picked this week.</h1>
      <p>Browse produce from our growers, with current prices and availability.</p>
    </section>
    <section className="content-section">
      <CatalogStatus loading={loading} error={productError} empty={!products.length} label="products" retry={refresh} />
      {businessError && <CatalogStatus loading={false} error={businessError} empty={false} label="farms" retry={refresh} />}
      {!loading && !productError && products.length > 0 && <>
        <div className="filter-row" aria-label="Produce categories">
          {categories.map(option => <button className={category === option ? "filter-chip active" : "filter-chip"}
            key={option} type="button" aria-pressed={category === option}
            onClick={() => { const next = new URLSearchParams(params); next.set("category", option); setParams(next); }}>{option}</button>)}
        </div>
        <p className="result-count" role="status">{filtered.length} products{query ? ` matching “${query}”` : " to explore"}</p>
        {!filtered.length && <div className="hatti-card cart-empty"><h2>No matching produce.</h2>
          <p>Try a different name, farm, or category.</p>
          <button className="btn hatti-add-btn" onClick={() => setParams({})}>Clear filters</button></div>}
        <div className="row g-4">{filtered.map(product => <div className="col-12 col-sm-6 col-xl-3" key={product.id}>
          <ProductCard product={product} />
        </div>)}</div>
      </>}
    </section>
  </>;
}
