import { NavLink } from "react-router-dom";

const sidebarItems = [
  { name: "Home", path: "/" },
  { name: "Fresh Produce", path: "/fresh-produce" },
  { name: "Farmers", path: "/farmers" },
  { name: "Farmers' Markets", path: "/farmers-markets" },
  { name: "Deals", path: "/deals" },
  { name: "Previous Orders", path: "/previous-orders" },
  { name: "Profile", path: "/profile" },
];

function Sidebar() {
  return (
    <aside className="hatti-sidebar">
      <nav className="sidebar-nav" aria-label="Main sections">
        
        {sidebarItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-marker" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}

      </nav>
    </aside>
  );
}

export default Sidebar;