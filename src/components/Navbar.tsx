import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/useAuth";
import Icon from "./Icon";
import logo from "../assets/HattiFarmersMarketLogo.png";

export default function Navbar() {
    const { count } = useCart();
    const { user, loading } = useAuth();
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    return (
        <header className="hatti-navbar">
            <a className="skip-link" href="#main-content">Skip to content</a>
            <Link className="hatti-wordmark" to="/" aria-label="Hatti home">
                <img className="hatti-logo" src={logo} alt="Hatti" />
            </Link>
            <form className="hatti-search" role="search" onSubmit={event => {
                event.preventDefault();
                navigate(query.trim() ? `/fresh-produce?q=${encodeURIComponent(query.trim())}` : "/fresh-produce");
            }}>
                <Icon name="search" />
                <input className="form-control" type="search" placeholder="Find something fresh…"
                    aria-label="Search produce and farms" value={query} onChange={event => setQuery(event.target.value)} />
                <button className="search-submit" type="submit" aria-label="Search"><Icon name="arrow" /></button>
            </form>
            <div className="navbar-location"><Icon name="pin" /><span><small>Your neighbourhood</small>Vancouver, BC</span></div>
            <div className="navbar-actions">
                {!loading && <Link className="account-link" to={user ? "/profile" : "/login"}>
                    <Icon name="user" /><span>{user ? "My account" : "Log in"}</span>
                </Link>}
                <Link className="btn hatti-cart-btn" to="/cart" aria-label={`Open cart, ${count} units`}>
                    <Icon name="basket" /><span className="cart-label">Basket</span><span className="cart-count">{count}</span>
                </Link>
            </div>
        </header>
    );
}
