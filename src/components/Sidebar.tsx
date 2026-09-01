const sidebarItems = [
  "Fresh Produce",
  "Farmers",
  "Farmers' Markets",
  "Deals",
  "Previous Orders",
  "Profile",
];

function Sidebar() {
  return (
    <aside className="hatti-sidebar">
      <nav className="sidebar-nav" aria-label="Main sections">
        {sidebarItems.map((item) => (
          <a
            className={item === "Fresh Produce" ? "sidebar-link active" : "sidebar-link"}
            href="#"
            key={item}
          >
            <span className="sidebar-marker" aria-hidden="true" />
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
