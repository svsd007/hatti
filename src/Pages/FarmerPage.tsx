import { Link, useParams } from "react-router-dom";
import { useCatalog } from "../catalog/CatalogContext";
import CatalogStatus from "../components/CatalogStatus";
import ProductCard from "../components/ProductCard";

export default function FarmerPage() {
  const { id } = useParams();
  const catalog = useCatalog();
  const farm = catalog.businesses.find(business => business.id === id);
  if (catalog.loading || catalog.businessError) return <CatalogStatus loading={catalog.loading}
    error={catalog.businessError} empty={false} label="farm" retry={catalog.refresh} />;
  if (!farm) return <section className="hatti-card cart-empty"><h1>Farm not found.</h1><Link to="/farmers">Browse farms</Link></section>;
  const products = catalog.products.filter(product => product.business_id === id);
  return <>
    <section className="page-intro"><p className="section-kicker">Our growers</p><h1>{farm.name || "Unnamed farm"}</h1>
      <p>{farm.location || "Location not provided"}</p><p>{farm.description}</p></section>
    <section className="content-section"><div className="section-heading"><h2>From this grower</h2></div>
      <CatalogStatus loading={false} error={catalog.productError} empty={!products.length} label="products" retry={catalog.refresh} />
      <div className="row g-4">{products.map(product => <div className="col-12 col-sm-6 col-xl-3" key={product.id}><ProductCard product={product} /></div>)}</div>
    </section>
  </>;
}
