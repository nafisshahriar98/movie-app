import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetails } from "../services/api";
import WatchProviders from "../components/WatchProviders";
import CastSection from "../components/CastSection";
import MovieMeta from "../components/MovieMeta";
import MovieActions from "../components/MovieActions";
import SimilarMovies from "../components/SimilarMovies";
import "../css/MovieDetail.css";

function MovieDetail() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="detail-loading">Loading...</div>;
    if (!movie) return <div className="detail-loading">Movie not found.</div>;

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

                    {/* Details of the Movie */}
                    <MovieMeta movie={movie} />

                    {/* Genres */}
                    <div className="detail-genres">
                        {movie.genres?.map(g => {
                            return <span key={g.id} className="genre-tag">{g.name}</span>
                        })}
                    </div>

                    <p className="detail-overview">{movie.overview}</p>

                    <MovieActions movie={movie} movieId={id} />
                    <WatchProviders movieId={id} />
                    <CastSection movieId={id} />
                    <SimilarMovies movieId={id} />
                </div>
            </div>
        </div>
    );
}

export default MovieDetail;