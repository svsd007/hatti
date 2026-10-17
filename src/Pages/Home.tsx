import FarmerCard from "../components/FarmerCard";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import ProduceArt from "../components/ProduceArt";
import Icon from "../components/Icon";
import { useCatalog } from "../catalog/CatalogContext";
import CatalogStatus from "../components/CatalogStatus";


function Home() {
  const { products, businesses, loading, productError, businessError, refresh } = useCatalog();
  return (
    <>
      <div className="home-welcome"><span>Your neighbourhood market</span><span><Icon name="pin" /> Vancouver & beyond</span></div>
      <section className="hero-section">
        <div className="hero-content">
          <p className="section-kicker"><Icon name="leaf" /> Good things grow close to home</p>
          <h1>Fresh food,<br />closer to <em>home.</em></h1>
          <p className="hero-copy">A basket full of local goodness. Discover the growers, the markets, and the food that bring us together.</p>
          <Link to="/fresh-produce" className="btn hatti-primary-btn">Explore the harvest <Icon name="arrow" /></Link>
          <p className="hero-footnote"><Icon name="sun" /> A little seasonal. A lot of local.</p>
        </div>
        <div className="harvest-art" aria-hidden="true">
          <div className="harvest-circle" />
          <div className="harvest-produce harvest-kale"><ProduceArt kind="kale" /></div>
          <div className="harvest-produce harvest-carrot"><ProduceArt kind="carrot" /></div>
          <div className="harvest-produce harvest-corn"><ProduceArt kind="corn" /></div>
          <div className="harvest-produce harvest-tomato"><ProduceArt kind="tomato" /></div>
          <div className="harvest-produce harvest-berry"><ProduceArt kind="strawberry" /></div>
          <div className="harvest-basket"><span>hatti</span><Icon name="leaf" /></div>
          <div className="harvest-stamp">From the earth.<br /><strong>For your table.</strong></div>
        </div>
      </section>

      <section id="near-you" className="content-section">
        <div className="section-heading">
          <h2>Fresh from our growers</h2>
          <Link className="section-link" to="/fresh-produce">View all produce <Icon name="arrow" /></Link>
        </div>
        <CatalogStatus loading={loading} error={productError} empty={!products.length} label="products" retry={refresh} />
        <div className="row g-4">
          {products.slice(0, 4).map((product) => (
            <div className="col-12 col-sm-6 col-xl-3" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Meet our growers</h2>
          <Link className="section-link" to="/farmers">Meet all growers <Icon name="arrow" /></Link>
        </div>
        <CatalogStatus loading={loading} error={businessError} empty={!businesses.length} label="farms" retry={refresh} />
        <div className="row g-4">
          {businesses.slice(0, 6).map((farmer) => (
            <div className="col-12 col-lg-4" key={farmer.id}>
              <FarmerCard
                id={farmer.id}
                name={farmer.name?.trim() || "Unnamed farm"}
                location={farmer.location?.trim() || "Location not provided"}
                description={farmer.description?.trim() || "No farm description available yet."}
              />
            </div>
          ))}
        </div>
      </section>

    </>
  );
}

export default Home;
