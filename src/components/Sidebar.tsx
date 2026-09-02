import { useState } from "react";

const sidebarItems = [
  "Home",
  "Fresh Produce",
  "Farmers",
  "Farmers' Markets",
  "Deals",
  "Previous Orders",
  "Profile",
];

interface Sideprop {
  func: (s: string) => void;
}

function Sidebar(d: Sideprop) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thefunc = d.func;

  return (
    <aside className="hatti-sidebar">
      <nav className="sidebar-nav" aria-label="Main sections">
        {sidebarItems.map((item, index) => (
          <button
            className={
              index === selectedIndex ? "sidebar-link active" : "sidebar-link"
            }
            key={item}
            onClick={() => {
              setSelectedIndex(index);
              thefunc(item);
            }}
          >
            <span className="sidebar-marker" aria-hidden="true" />
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
