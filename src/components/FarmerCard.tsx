import { Link } from "react-router-dom";

interface FarmerCardProps {
  id: string;
  name: string;
  location: string;
  description: string;
}

function FarmerCard({ id, name, location, description }: FarmerCardProps) {
  return (
    <article className="hatti-card farmer-card listing-card h-100">
      <div className="farmer-logo" aria-hidden="true">
        {name
          .split(" ")
          .map((word) => word[0])
          .join("")}
      </div>
      <div>
        <h3><Link className="product-card-link" to={`/farmers/${id}`}>{name}</Link></h3>
        <p className="farmer-location">{location}</p>
        <p className="farmer-description">{description}</p>
      </div>
    </article>
  );
}

export default FarmerCard;
