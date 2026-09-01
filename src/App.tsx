import "./App.css";
import FarmerCard from "./components/FarmerCard";
import MarketCard from "./components/MarketCard";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import Sidebar from "./components/Sidebar";

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
    description: "Family-grown berries, greens, and herbs picked fresh each morning.",
  },
  {
    name: "Fraser Family Farm",
    location: "Delta, BC",
    description: "Small-batch produce from rich Fraser Valley soil and sunny fields.",
  },
  {
    name: "Valley Harvest",
    location: "Abbotsford, BC",
    description: "Seasonal vegetables, orchard fruit, and market staples from local growers.",
  },
];

const seasonalCategories = ["Blueberries", "Peaches", "Tomatoes", "Zucchini"];

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

function App() {

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-layout">
        <Sidebar />

        <main className="hatti-main">

          <section className="hero-section">
            <div>
              <p className="section-kicker">Local harvest, simple shopping</p>
              <h1>Fresh food, closer to home.</h1>
              <p className="hero-copy">
                Shop produce from local farmers and markets around you.
              </p>
              <button className="btn hatti-primary-btn">Browse local produce</button>
            </div>
            <div className="hero-basket" aria-hidden="true">
              <span className="basket-icon">🥕</span>
              <span className="basket-icon">🍓</span>
              <span className="basket-icon">🥬</span>
            </div>
          </section>



          <section className="content-section">
            <div className="section-heading">
              <h2>Fresh near you</h2>
              <span>Picked for Vancouver homes</span>
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
              <span>Meet the people growing nearby</span>
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
              <h2>In season right now</h2>
              <span>Bright, ripe, and ready</span>
            </div>
            <div className="season-grid">
              {seasonalCategories.map((category) => (
                <button className="season-card" key={category}>
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="content-section">
            <div className="section-heading">
              <h2>Farmers' markets near you</h2>
              <span>Weekend stops worth planning around</span>
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
        </main>
      </div>
    </div>
  );
}

export default App;
