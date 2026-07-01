import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../services/api";
import "../css/SearchBar.css";

function SearchBar() {
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggetions] = useState([]);
    const searchRef = useRef(null);

    // fetch suggestions as user types
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggetions([]);
            return;
        }
        const timeout = setTimeout(async () => {
            const { movies } = await searchMovies(searchQuery);
            setSuggetions(movies.slice(0, 6));
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Close while clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
                setSearchQuery("");
                setSuggetions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSuggestionClick = (movie) => {
        navigate(`/movie/${movie.id}`);
        setShowSearch(false);
        setSearchQuery("");
        setSuggetions([]);
    };

    return (
        <div className="search-bar" ref={searchRef}>
            <button
                className="search-icon-btn"
                onClick={() => setShowSearch(!showSearch)}
            >
                🔍
            </button>
            {showSearch && (
                <div className="search-popup">
                    <input
                        autoFocus
                        type="text"
                        className="nav-search-input"
                        placeholder="Search movies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {suggestions.length > 0 && (
                        <ul className="nav-suggestions">
                            {suggestions.map((movie) => (
                                <li
                                    key={movie.id}
                                    onClick={() => handleSuggestionClick(movie)}
                                    className="nav-suggestion-item"
                                >
                                    <img
                                        src={
                                            movie.poster_path
                                                ? `/tmdb-image/t/p/w92${movie.poster_path}`
                                                : "/no-poster.png"
                                        }
                                        alt={movie.title}
                                        className="suggestion-poster"
                                    />
                                    <div className="suggestion-info">
                                        <span className="suggestion-title">{movie.title}</span>
                                        <span className="suggestion-year">({movie.release_date?.split("-")[0]})</span>
                                    </div>
                                    <div className="suggestion-rating">
                                        ⭐ {movie.vote_average}/10
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}

export default SearchBar;