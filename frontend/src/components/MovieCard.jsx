
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovieTrailer } from '../services/api';
import TrailerModal from './TrailerModal';
import '../css/MovieCard.css'
import { useContext } from 'react';
import { MovieContext } from '../contexts/MovieContext';

function MovieCard({ movie }) {
    const navigate = useNavigate();
    const [trailerKey, setTrailerKey] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { addToFavorites, removeFromFavorites, isFavorite } = useContext(MovieContext);
    const favorite = isFavorite(movie.id);
    function onFavoriteClick(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isFavorite(movie.id)) {
            removeFromFavorites(movie.id);
        } else {
            addToFavorites(movie);
        }
    }
    //clicking the image, the trailer is played
    const handleImageClick = async () => {
        const key = await getMovieTrailer(movie.id);
        if (key) {
            setTrailerKey(key);
            setShowModal(true);
        } else {
            alert("No trailer available for this movie");
        }
    }

    //closing the traielr modal
    const handleCloseModal = () => {
        setShowModal(false);
        setTrailerKey(null);
    }

    return <div className="movie-card">
        <div className="movie-poster" onClick={handleImageClick} style={{ cursor: `pointer` }}>
            {/* <img src={movie.url} alt={movie.title} /> */}
            <img
                src={
                    movie.poster_path
                        ? `/tmdb-image/t/p/w500${movie.poster_path}`
                        : "/no-poster.png"
                }
                alt={movie.title}
                onError={(e) => { e.currentTarget.src = "/no-poster.png"; }}
            />
            <div className="movie-overlay">
                <button className={favorite ? "favorite-btn active" : "favorite-btn"} onClick={onFavoriteClick}>
                    {favorite ? "❤️" : "🤍"}
                </button>
            </div>
        </div>
        <div className="movie-info">
            <h3 onClick={() => navigate(`/movie/${movie.id}`)} style={{ cursor: 'pointer' }}>
                {movie.title}
            </h3>
            <p>{movie.release_date?.split('-')[0]}</p>
            <p>Rating: {movie.vote_average}/10</p>
            <p>Overview: {movie.overview}</p>
        </div>
        {showModal && (
            <TrailerModal youtubeKey={trailerKey} onClose={handleCloseModal} />
        )

        }
    </div>
}

export default MovieCard