import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails, getMovieTrailer } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import TrailerModal from "../components/TrailerModal";
import WatchProviders from "../components/WatchProviders";
import CastSection from "../components/CastSection";
import "../css/MovieDetail.css";

function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trailerKey, setTrailerKey] = useState(null);
    const [showModal, setShowModal] = useState(false);


    //favorite button
    const { addToFavorites, removeFromFavorites, isFavorite } = useMovieContext();
    const favorite = movie ? isFavorite(movie.id) : false;

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getMovieDetails(id);
                setMovie(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleTrailer = async () => {
        const key = await getMovieTrailer(id);
        if (key) {
            setTrailerKey(key);
            setShowModal(true);
        } else {
            alert("No trailer available");
        }
    };

    const handleFavorite = () => {
        if (isFavorite(movie.id)) {
            removeFromFavorites(movie.id);
        } else {
            addToFavorites(movie)
        }
    };

    if (loading) return <div className="detail-loading">Loading...</div>;
    if (!movie) return <div className="detail-loading">Movie not found.</div>;

    //helper to format money
    const formatMoney = (amount) => {
        return amount > 0 ? `$${amount.toLocaleString()}` : "N/A";
    }

    //runtime: convert min to hour "2 hour 22 min"
    const formatRuntime = (mins) => {
        if (!mins) return "N/A"
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    }



    return (
        <div className="movie-detail">
            {/* Backdrop banner image */}
            {movie.backdrop_path && (
                <div className="detail-backdrop">
                    <img
                        src={`/tmdb-image/t/p/w1280${movie.backdrop_path}`}
                        alt={movie.title}
                    />
                    <div className="backdrop-overlay" />
                </div>
            )}

            {/* Main content */}
            <div className="detail-content">
                {/* Poster */}
                <div className="detail-poster">
                    <img
                        src={
                            movie.poster_path
                                ? `/tmdb-image/t/p/w500${movie.poster_path}`
                                : "/no-poster.png"
                        }
                        alt={movie.title}
                    />
                </div>
                {/* Info */}
                <div className="detail-info">
                    <h1>
                        {movie.title} <span className="detail-year">({movie.release_date?.split("-")[0]})</span>
                    </h1>
                    {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}

                    <div className="detail-meta">
                        <span>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                        <span>🕐 {formatRuntime(movie.runtime)}</span>
                        <span>🌍 {movie.original_language?.toUpperCase()}</span>
                        <span>📅 {movie.release_date}</span>
                        <span>📊 {movie.status}</span>
                    </div>
                    {/* Genres */}
                    <div className="detail-genres">
                        {movie.genres?.map(g => {
                            return <span key={g.id} className="genre-tag">{g.name}</span>
                        })}
                    </div>

                    <p className="detail-overview">{movie.overview}</p>

                    {/* Buttons */}
                    <div className="detail-buttons">
                        <button onClick={handleTrailer} className="btn-trailer">
                            ▶ Watch Trailer
                        </button>
                        <button onClick={handleFavorite} className={`btn-favorite ${favorite ? "active" : ""}`}>
                            {favorite ? "❤️ Saved" : "🤍 Add to Favorites"}
                        </button>
                    </div>
                    <WatchProviders movieId={id} />
                    <CastSection movieId={id} />
                </div>
            </div>
            {showModal && (
                <TrailerModal
                    youtubeKey={trailerKey}
                    onClose={() => { setShowModal(false); setTrailerKey(null); }}
                />
            )}
        </div>
    );
}

export default MovieDetail;