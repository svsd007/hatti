import { Link } from "react-router-dom";

export default function Deals() {
  return <>
    <section className="page-intro">
      <p className="section-kicker">Deals</p>
      <h1>Good local food, a little easier on the basket.</h1>
      <p>Seasonal offers will appear here when they become available.</p>
    </section>
    <section className="hatti-card cart-empty">
      <h2>No deals available yet.</h2>
      <p>Browse our growers’ current products and prices instead.</p>
      <Link className="btn hatti-primary-btn" to="/fresh-produce">Browse fresh produce</Link>
    </section>
  </>;
}
