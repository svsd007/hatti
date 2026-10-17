import FarmerCard from "../components/FarmerCard";
import CatalogStatus from "../components/CatalogStatus";
import { useCatalog } from "../catalog/CatalogContext";

export default function Farmers() {
  const { businesses, loading, businessError, refresh } = useCatalog();
  return <>
    <section className="page-intro">
      <p className="section-kicker">Farmers</p>
      <h1>Meet the growers behind your basket.</h1>
      <p>Browse local farms and learn about the people growing your food.</p>
    </section>
    <section className="content-section">
      <div className="section-heading"><h2>Local farm directory</h2>
        {!loading && !businessError && <span>{businesses.length} {businesses.length === 1 ? "farm" : "farms"} listed</span>}
      </div>
      <CatalogStatus loading={loading} error={businessError} empty={!businesses.length} label="farms" retry={refresh} />
      <div className="row g-4">
        {businesses.map(business => <div className="col-12 col-lg-6" key={business.id}>
          <FarmerCard id={business.id} name={business.name?.trim() || "Unnamed farm"}
            location={business.location?.trim() || "Location not provided"}
            description={business.description?.trim() || "No farm description available yet."} />
        </div>)}
      </div>
    </section>
  </>;
}
