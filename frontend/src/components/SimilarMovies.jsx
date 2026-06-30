import { useState, useEffect } from "react";
import { getSimilarMovies } from "../services/api";
import MovieCard from "./MovieCard";

function SimilarMovies({ movieId }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSimilarMovies(movieId)
            .then(data => setMovies(data.slice(0, 12)))
            .finally(() => setLoading(false));
    }, [movieId]);

    if (loading) return <p className="similar-loading">Loading recommendations...</p>;
    if (movies.length === 0) return null;

    return (
        <div className="similar-movies">
            <h2 className="similar-title"> You Might Also Like</h2>
            <div className="similar-grid">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    )
}
export default SimilarMovies;