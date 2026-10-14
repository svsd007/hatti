import FarmerCard from "../components/FarmerCard";
import MarketCard from "../components/MarketCard";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import ProduceArt from "../components/ProduceArt";
import Icon from "../components/Icon";

const products = [
  {
    name: "Strawberries",
    farmName: "Cedar Grove Farm",
    price: "$5.99 / lb",
    accent: "strawberry",
  },
  {
    name: "Tomatoes",
    farmName: "Valley Harvest",
    price: "$3.49 / lb",
    accent: "tomato",
  },
  {
    name: "Corn",
    farmName: "Green Acres",
    price: "$1.25 each",
    accent: "corn",
  },
  {
    name: "Blueberries",
    farmName: "Fraser Family Farm",
    price: "$6.50 / lb",
    accent: "blueberry",
  },
];

const farmers = [
  {
    name: "Cedar Grove Farm",
    location: "Richmond, BC",
    description:
      "Family-grown berries, greens, and herbs picked fresh each morning.",
  },
  {
    name: "Fraser Family Farm",
    location: "Delta, BC",
    description:
      "Small-batch produce from rich Fraser Valley soil and sunny fields.",
  },
  {
    name: "Valley Harvest",
    location: "Abbotsford, BC",
    description:
      "Seasonal vegetables, orchard fruit, and market staples from local growers.",
  },
];


const markets = [
  {
    name: "Trout Lake Farmers Market",
    distance: "3.2 km away",
    schedule: "Open Saturday, 9 AM - 2 PM",
  },
  {
    name: "Kitsilano Farmers Market",
    distance: "5.8 km away",
    schedule: "Open Sunday, 10 AM - 2 PM",
  },
];

function Home() {
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
          <h2>Fresh near you</h2>
          <Link className="section-link" to="/fresh-produce">View all produce <Icon name="arrow" /></Link>
        </div>
        <div className="row g-4">
          {products.map((product) => (
            <div className="col-12 col-sm-6 col-xl-3" key={product.name}>
              <ProductCard
                name={product.name}
                farmName={product.farmName}
                price={product.price}
                accent={product.accent}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Local farmers</h2>
          <Link className="section-link" to="/farmers">Meet all growers <Icon name="arrow" /></Link>
        </div>
        <div className="row g-4">
          {farmers.map((farmer) => (
            <div className="col-12 col-lg-4" key={farmer.name}>
              <FarmerCard
                name={farmer.name}
                location={farmer.location}
                description={farmer.description}
              />
            </div>
          ))}
        </div>
      </section>


      <section className="content-section">
        <div className="section-heading">
          <h2>Farmers' markets near you</h2>
          <Link className="section-link" to="/farmers-markets">Explore markets <Icon name="arrow" /></Link>
        </div>
        <div className="row g-4">
          {markets.map((market) => (
            <div className="col-12 col-lg-6" key={market.name}>
              <MarketCard
                name={market.name}
                distance={market.distance}
                schedule={market.schedule}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
