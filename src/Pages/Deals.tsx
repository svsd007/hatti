const deals = [
  {
    name: "Berry Box Bundle",
    farmName: "Fraser Family Farm",
    detail: "Strawberries and blueberries packed together for weekend breakfasts.",
    oldPrice: "$13.00",
    newPrice: "$10.99",
  },
  {
    name: "Market Salad Kit",
    farmName: "North Arm Greens",
    detail: "Kale, tomatoes, cucumber, and herbs for a simple local salad.",
    oldPrice: "$16.50",
    newPrice: "$13.75",
  },
  {
    name: "Corn Dozen",
    farmName: "Green Acres",
    detail: "Sweet corn picked for grilling, boiling, or a family dinner table.",
    oldPrice: "$15.00",
    newPrice: "$12.00",
  },
  {
    name: "Summer Veg Basket",
    farmName: "Meadow Patch Farm",
    detail: "Zucchini, carrots, tomatoes, and greens in one easy market basket.",
    oldPrice: "$24.00",
    newPrice: "$19.50",
  },
];

function Deals() {
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Deals</p>
        <h1>Good local food, a little easier on the basket.</h1>
        <p>
          A preview of seasonal bundles and small discounts from nearby farms and
          markets.
        </p>
      </section>

      <section className="content-section">
        <div className="row g-4">
          {deals.map((deal) => (
            <div className="col-12 col-lg-6" key={deal.name}>
              <article className="hatti-card deal-card h-100">
                <div>
                  <span className="deal-badge">Local deal</span>
                  <h3>{deal.name}</h3>
                  <p className="farmer-location">{deal.farmName}</p>
                  <p className="farmer-description">{deal.detail}</p>
                </div>
                <div className="deal-footer">
                  <span className="old-price">{deal.oldPrice}</span>
                  <strong>{deal.newPrice}</strong>
                  <button className="btn hatti-add-btn" type="button">
                    Add
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Deals;
