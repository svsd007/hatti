import MarketCard from "../components/MarketCard";

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
  {
    name: "Riley Park Farmers Market",
    distance: "4.6 km away",
    schedule: "Open Saturday, 10 AM - 2 PM",
  },
  {
    name: "Mount Pleasant Farmers Market",
    distance: "2.9 km away",
    schedule: "Open Sunday, 10 AM - 2 PM",
  },
];

function FarmersMarkets() {
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Farmers' Markets</p>
        <h1>Plan your next market morning.</h1>
        <p>
          Find nearby markets, opening windows, and distance estimates for a
          future pickup or shopping trip.
        </p>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Markets near Vancouver</h2>
          <span>Updated for this prototype</span>
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

export default FarmersMarkets;
