import { useState } from "react";
import { getMovieTrailer } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import TrailerModal from "./TrailerModal";
import TorrentPlayer from "./TorrentPlayer";

function MovieActions({ movie, movieId }) {
    const [trailerKey, setTrailerKey] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showStream, setShowStream] = useState(false);

    const { addToFavorites, removeFromFavorites, isFavorite } = useMovieContext();
    const favorite = isFavorite(movie.id);

    const handleTrailer = async () => {
        const key = await getMovieTrailer(movieId);
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
            addToFavorites(movie);
        }
    };

    return (
        <>
            <div className="detail-buttons">
                <button onClick={handleTrailer} className="btn-trailer">
                    ▶ Watch Trailer
                </button>
                <button onClick={handleFavorite} className={`btn-favorite ${favorite ? "active" : ""}`}>
                    {favorite ? "❤️ Saved" : "🤍 Add to Favorites"}
                </button>
                <button onClick={() => setShowStream(true)} className="btn-stream">
                    🎬 Stream Movie
                </button>
            </div>

            {showStream && (
                <TorrentPlayer
                    imdbId={movie.imdb_id}
                    poster={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                />
            )}

            {showModal && (
                <TrailerModal
                    youtubeKey={trailerKey}
                    onClose={() => { setShowModal(false); setTrailerKey(null); }}
                />
            )}
        </>
    );
}

export default MovieActions;