
"use client";

import "../css/MovieCard.css";
import { useContext } from "react";
import { MovieContext } from "../contexts/MovieContext";

function MovieCard({ movie }) {
    const { addToFavorites, removeFromFavorites, isFavorite } = useContext(MovieContext);
    const favorite = isFavorite(movie.id);

    function onFavoriteClick(e) {
        e.preventDefault();
        if (isFavorite(movie.id)) {
            removeFromFavorites(movie.id);
        } else {
            addToFavorites(movie);
        }
    }

    return (
        <div className="movie-card">
            <div className="movie-poster">
                <img
                    src={
                        movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : "/no-poster.png"
                    }
                    alt={movie.title}
                    onError={(e) => { e.currentTarget.src = "/no-poster.png"; }}
                />
                <div className="movie-overlay">
                    <button
                        className={favorite ? "favorite-btn active" : "favorite-btn"}
                        onClick={onFavoriteClick}
                    >
                        {favorite ? "❤️" : "🤍"}
                    </button>
                </div>
            </div>
            <div className="movie-info">
                <h3>{movie.title}</h3>
                <p>{movie.release_date?.split("-")[0]}</p>
                <p>Rating: {movie.vote_average?.toFixed(1)}</p>
                <p className="movie-overview">{movie.overview}</p>
            </div>
        </div>
    );
}

export default MovieCard;