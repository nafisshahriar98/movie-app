
  import Link from "next/link";
  import "../css/Navbar.css";

  function NavBar() {
      return (
          <nav className="navbar">
              <div className="navbar-brand">
                  <Link href="/">Movie App</Link>
              </div>
              <div className="navbar-links">
                  <Link href="/" className="nav-link">Home</Link>
                  <Link href="/favorites" className="nav-link">Favorites</Link>
              </div>
          </nav>
      );
  }

  export default NavBar;