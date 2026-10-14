import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import type { IconName } from "./Icon";

const items: { name: string; path: string; icon: IconName }[] = [
  { name: "Discover", path: "/", icon: "home" },
  { name: "Fresh produce", path: "/fresh-produce", icon: "leaf" },
  { name: "Our farmers", path: "/farmers", icon: "farm" },
  { name: "Farmers’ markets", path: "/farmers-markets", icon: "market" },
  { name: "Seasonal deals", path: "/deals", icon: "tag" },
  { name: "Your basket", path: "/cart", icon: "basket" },
  { name: "Previous orders", path: "/previous-orders", icon: "orders" },
  { name: "Your profile", path: "/profile", icon: "user" },
];

export default function Sidebar() {
  return <aside className="hatti-sidebar">
    <p className="sidebar-label">Explore your market</p>
    <nav className="sidebar-nav" aria-label="Main sections">
      {items.map((item, index) => <NavLink key={item.path} to={item.path} end={item.path === "/"}
        className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}${index === 5 ? " sidebar-account-start" : ""}`}>
        <Icon name={item.icon} /><span>{item.name}</span>
      </NavLink>)}
    </nav>
    <div className="sidebar-note">
      <Icon name="leaf" />
      <h2>Small farms.<br />Big difference.</h2>
      <p>A little local love goes a long way.</p>
      <NavLink to="/farmers">Meet the growers <Icon name="arrow" /></NavLink>
    </div>
    <p className="sidebar-footer">Rooted in community.</p>
  </aside>;
}
