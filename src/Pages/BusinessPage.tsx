import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useMyBusiness } from "../business/useMyBusiness";
import BusinessRegistration from "../business/BusinessRegistration";
import ProductListingForm from "../business/ProductListingForm";
import ManageProduct from "../business/ManageProduct";
import { useCatalog } from "../catalog/CatalogContext";
import ProductCard from "../components/ProductCard";
import CatalogStatus from "../components/CatalogStatus";

export default function BusinessPage() {
  const { user, loading, error } = useAuth();
  const own = useMyBusiness();
  const catalog = useCatalog();
  if (loading) return <p role="status">Loading your account…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!user) return <section className="hatti-card auth-card"><p className="section-kicker">Sell on Hatti</p>
    <h1>Bring your harvest to Hatti.</h1><p>Register your farm and publish your products.</p>
    <div className="auth-actions"><Link className="btn hatti-primary-btn" to="/business/signup">Create a business account</Link>
      <Link className="btn hatti-add-btn" to="/business/login">Business login</Link></div></section>;
  if (own.loading) return <p role="status">Loading your business…</p>;
  if (own.error) return <section className="hatti-card cart-empty" role="alert"><p>{own.error}</p>
    <button className="btn hatti-add-btn" onClick={own.refresh}>Try again</button></section>;
  const products = catalog.products.filter(product => product.business_id === own.business?.id);
  return <>
    <section className="page-intro"><p className="section-kicker">Your business</p>
      <h1>{own.business?.name || "Grow your business with Hatti."}</h1><p>{own.business?.location || "Create a business profile and start listing your harvest."}</p></section>
    {!own.business ? <BusinessRegistration onCreated={own.refresh} /> : <>
      <p><Link to={`/farmers/${own.business.id}`}>View public business profile</Link></p>
      <ProductListingForm key={own.business.id} businessId={own.business.id} />
      <section className="content-section"><div className="section-heading"><h2>Your listings</h2></div>
        <CatalogStatus loading={catalog.loading} error={catalog.productError} empty={!products.length} label="products" retry={catalog.refresh} />
        <div className="row g-4">{products.map(product => <div className="col-12 col-lg-6" key={product.id}><ProductCard product={product} /><ManageProduct product={product} /></div>)}</div>
      </section>
    </>}
  </>;
}
