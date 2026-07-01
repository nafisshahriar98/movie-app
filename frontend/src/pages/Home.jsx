import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import MovieCard from "../components/MovieCard"
import SkeletonCard from "../components/SkeletonCard";
import "../css/SkeletonCard.css";
import '../css/Home.css'


function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // load popular movies on initial render
    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const { movies: results, totalPages } = await getPopularMovies(1);
                setMovies(results);
                setHasMore(1 < totalPages);
            } catch (err) {
                setError("Failed to load movies...");
            } finally {
                setLoading(false);
            }
        };
        loadPopularMovies();
    }, []);

    // live search — updates grid as user types
    useEffect(() => {
        if (!searchQuery.trim()) {
            getPopularMovies(1).then(({ movies: results, totalPages }) => {
                setMovies(results);
                setPage(1);
                setHasMore(1 < totalPages);
            });
            return;
        }
        const timeout = setTimeout(async () => {
            setLoading(true);
            const { movies: results, totalPages } = await searchMovies(searchQuery, 1);
            setMovies(results);
            setPage(1);
            setHasMore(1 < totalPages);
            setLoading(false);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        try {
            const { movies: result, totalPages } = searchQuery.trim()
                ? await searchMovies(searchQuery, nextPage)
                : await getPopularMovies(nextPage);
            setMovies(prev => [...prev, ...result]);
            setPage(nextPage);
            setHasMore(nextPage < totalPages);
        } catch (err) {
            setError("Failed to load more movies...");
        }
    };

    return (
        <div className="home">
            <div className="search-form">
                <input
                    type="text"
                    placeholder="Search for movies..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="movies-grid">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            ) : (
                <div className="movies-grid">
                    {movies.map(movie => (
                        <MovieCard movie={movie} key={movie.id} />
                    ))}
                </div>
            )}

            {hasMore && !loading && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                    Load More
                </button>
            )}
        </div>
    );
}

export default Home;
