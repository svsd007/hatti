interface FarmerCardProps {
  name: string;
  location: string;
  description: string;
}

function FarmerCard({ name, location, description }: FarmerCardProps) {
  return (
    <article className="hatti-card farmer-card h-100">
      <div className="farmer-logo" aria-hidden="true">
        {name
          .split(" ")
          .map((word) => word[0])
          .join("")}
      </div>
      <div>
        <h3>{name}</h3>
        <p className="farmer-location">{location}</p>
        <p className="farmer-description">{description}</p>
      </div>
    </article>
  );
}

export default FarmerCard;
