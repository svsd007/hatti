interface MarketCardProps {
  name: string;
  distance: string;
  schedule: string;
}

function MarketCard({ name, distance, schedule }: MarketCardProps) {
  return (
    <article className="hatti-card market-card h-100">
      <div className="market-icon" aria-hidden="true">
        Market
      </div>
      <div>
        <h3>{name}</h3>
        <p>{distance}</p>
        <span>{schedule}</span>
      </div>
    </article>
  );
}

export default MarketCard;
