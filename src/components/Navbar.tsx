interface navProp {
  func: (s: string) => void;
}

function Navbar() {

  
  return (
    <nav className="navbar hatti-navbar sticky-top">
      <div className="container-fluid gap-3">
        <a className="navbar-brand hatti-wordmark" href="#">
          <img className="hatti-logo" src="src\assets\hattilogo.png" />
        </a>

        <form className="hatti-search flex-grow-1" role="search">
          <input
            className="form-control"
            type="search"
            placeholder="Search produce, farmers, and markets..."
            aria-label="Search produce, farmers, and markets"
          />
        </form>

        <div className="navbar-location d-none d-md-flex">
          <span className="location-dot" aria-hidden="true" />
          Vancouver, BC
        </div>

        <button
          className="btn hatti-cart-btn"
          type="button"
          aria-label="Open cart"
          onClick={() => console.log("Cart button clicked")}
        >
          🧺
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
