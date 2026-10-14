import ProductCard from "../components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";

const produceItems = [
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
  {
    name: "Zucchini",
    farmName: "Meadow Patch Farm",
    price: "$2.75 / lb",
    accent: "zucchini",
  },
  {
    name: "Peaches",
    farmName: "Okanagan Orchard",
    price: "$4.99 / lb",
    accent: "peach",
  },
  {
    name: "Kale",
    farmName: "North Arm Greens",
    price: "$3.25 / bunch",
    accent: "kale",
  },
  {
    name: "Carrots",
    farmName: "Cedar Grove Farm",
    price: "$2.99 / bunch",
    accent: "carrot",
  },
];

const categories = ["All", "Fruit", "Vegetables", "Greens", "Market Deals"];

function FreshProduce() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "All";
  const query = params.get("q")?.trim().toLowerCase() ?? "";
  const fruit = new Set(["strawberry", "blueberry", "peach"]);
  const filteredItems = produceItems.filter(item => {
    const matchesCategory = category === "All" ||
      (category === "Fruit" && fruit.has(item.accent)) ||
      (category === "Greens" && item.accent === "kale") ||
      (category === "Vegetables" && !fruit.has(item.accent));
    return matchesCategory && `${item.name} ${item.farmName}`.toLowerCase().includes(query);
  });
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Fresh Produce</p>
        <h1>Shop what local farms picked this week.</h1>
        <p>
          Browse seasonal fruit, vegetables, and market staples from farms near
          Vancouver.
        </p>
      </section>

      <section className="content-section">
        <div className="filter-row" aria-label="Produce categories">
          {categories.map((option) => option === "Market Deals" ? <Link className="filter-chip" key={option} to="/deals">{option}</Link> : (
            <button
              className={category === option ? "filter-chip active" : "filter-chip"}
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => { const next = new URLSearchParams(params); next.set("category", option); setParams(next); }}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="result-count" role="status">{filteredItems.length} products{query ? ` matching “${params.get("q")}”` : " to explore"}</p>
        {filteredItems.length === 0 && <div className="hatti-card cart-empty"><h2>No produce found.</h2><p>Try a different name, farm, or category.</p><button className="btn hatti-add-btn" onClick={() => setParams({})}>Clear filters</button></div>}
        <div className="row g-4">
          {filteredItems.map((item) => (
            <div className="col-12 col-sm-6 col-xl-3" key={item.name}>
              <ProductCard
                name={item.name}
                farmName={item.farmName}
                price={item.price}
                accent={item.accent}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default FreshProduce;
