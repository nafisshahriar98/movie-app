"use client";

import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [searchResultsDropdown, setSearchResultsDropdown] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropDownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const popularMovies = await getPopularMovies();
        setMovies(popularMovies);
      } catch (err) {
        console.log(err);
        setError("Failed to load movies...");
      } finally {
        setLoading(false);
      }
    };
    loadPopularMovies();
  }, []);
  const handleSearchSuggestion = (movie) => {
    setSearchQuery(movie.title); //update search input with clicked suggestion
    setMovies([movie]); //update main grid to show only the clicked suggestion
    setDropdownVisible(false); //hide dropdown after selection
  }

  //Live search for dropdown suggestions
  useEffect(() => {
    const fetchSuggetions = async () => {
      if (!searchQuery.trim()) {
        setSearchResultsDropdown([]);
        setDropdownVisible(false);
        return;
      }
      try {
        const results = await searchMovies(searchQuery);
        setSearchResultsDropdown(results.slice(0, 5));  //limit to top 5 suggestions
        setDropdownVisible(true);
      } catch (err) {
        console.log(err);
        setSearchResultsDropdown([]);
        setDropdownVisible(false);
      }
    };
    const debounceTimeout = setTimeout(fetchSuggetions, 300);//debounce to avoid too many API calls

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  //on submit, update the main movie grid with search results
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search query.");
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults); //update main grid with search results
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to search movies...");
    } finally {
      setLoading(false);
      setDropdownVisible(false); // this hides dropdown after submit
    }
  };

  return (
    <div className="home">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies......"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => { if (searchResultsDropdown.length > 0) setDropdownVisible(true); }}
          onBlur={() => setTimeout(() => setDropdownVisible(false), 200)}
        />
        <button type="submit" className="search-button">Search</button>

        {dropDownVisible && searchResultsDropdown.length > 0 && (
          <ul className="search-dropdown">
            {searchResultsDropdown.map((movie) => (
              <li key={movie.id} onClick={() => handleSearchSuggestion(movie)}>
                {movie.title}
              </li>
            ))}
          </ul>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}