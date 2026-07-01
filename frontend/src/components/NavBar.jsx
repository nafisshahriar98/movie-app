import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import SearchBar from "./SearchBar";
import '../css/Navbar.css'

function NavBar() {

    const { user, isLoading, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <a href="/">Movie App</a>
            </div>

            <div className="navbar-links">
                <Link to="/" className="nav-link">Home</Link>

                {!isLoading && user && (
                    <>
                        <Link to="/favorites" className="nav-link">Favorites</Link>
                        <span className="nav-user">Hi, {user.username}</span>
                        <button onClick={handleLogout} className="nav-link nav-logout">
                            Logout
                        </button>
                    </>
                )}

                {!isLoading && !user && (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
                <button onClick={toggleTheme} className="nav-link theme-toggle">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                <SearchBar />
            </div>
        </nav>
    );
}

export default NavBar