const orders = [
  {
    date: "August 24, 2026",
    source: "Trout Lake Farmers Market",
    items: "Strawberries, kale, tomatoes",
    total: "$28.40",
    status: "Delivered",
  },
  {
    date: "August 17, 2026",
    source: "Cedar Grove Farm",
    items: "Carrots, blueberries, corn",
    total: "$22.15",
    status: "Delivered",
  },
  {
    date: "August 10, 2026",
    source: "Valley Harvest",
    items: "Tomatoes, zucchini, peaches",
    total: "$31.80",
    status: "Picked up",
  },
];

function PreviousOrder() {
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Previous Orders</p>
        <h1>Your recent Hatti baskets.</h1>
        <p>
          A simple prototype history for future receipts, reordering, and order
          details.
        </p>
      </section>

      <section className="content-section">
        <div className="order-list">
          {orders.map((order) => (
            <article className="hatti-card order-card" key={`${order.date}-${order.source}`}>
              <div>
                <h3>{order.source}</h3>
                <p>{order.date}</p>
                <span>{order.items}</span>
              </div>
              <div className="order-summary">
                <strong>{order.total}</strong>
                <span>{order.status}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default PreviousOrder;
