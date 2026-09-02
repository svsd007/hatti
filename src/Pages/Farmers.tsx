import FarmerCard from "../components/FarmerCard";

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
  {
    name: "Meadow Patch Farm",
    location: "Surrey, BC",
    description: "A small vegetable farm focused on zucchini, squash, beans, and herbs.",
  },
  {
    name: "North Arm Greens",
    location: "Burnaby, BC",
    description: "Tender greens and salad mixes grown close to the city.",
  },
  {
    name: "Okanagan Orchard",
    location: "Kelowna, BC",
    description: "Tree fruit brought into local markets during peak summer season.",
  },
];

function Farmers() {
  return (
    <>
      <section className="page-intro">
        <p className="section-kicker">Farmers</p>
        <h1>Meet the growers behind your basket.</h1>
        <p>
          A simple directory preview for browsing local farms, learning their
          specialties, and eventually opening full farmer profiles.
        </p>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <h2>Local farm directory</h2>
          <span>6 farms near you</span>
        </div>
        <div className="row g-4">
          {farmers.map((farmer) => (
            <div className="col-12 col-lg-6" key={farmer.name}>
              <FarmerCard
                name={farmer.name}
                location={farmer.location}
                description={farmer.description}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Farmers;
