export default function CatalogStatus({ loading, error, empty, label, retry }: {
  loading: boolean; error: string | null; empty: boolean; label: string; retry: () => void;
}) {
  if (loading) return <p role="status">Loading {label}…</p>;
  if (error) return <div className="hatti-card cart-confirm" role="alert"><p>{error}</p>
    <button className="btn hatti-add-btn" onClick={retry}>Try again</button></div>;
  if (empty) return <div className="hatti-card cart-empty" role="status"><h2>No {label} listed yet.</h2>
    <p>Check back as local growers add their listings.</p></div>;
  return null;
}
