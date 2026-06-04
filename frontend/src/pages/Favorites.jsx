import '../css/Favorites.css'
import { useContext } from 'react';
import { MovieContext } from '../contexts/MovieContext';
import MovieCard from '../components/MovieCard';

function Favorite() {

    const { favorites } = useContext(MovieContext);
    if (favorites) {

        return (
            <div className="favorites">
                <h2>Your Favorite Movies</h2>
                <div className="movie-grid">
                    {favorites.map(movie => 
                    <MovieCard key={movie.id} movie={movie} />)}
                </div>
            </div>

        )
    }

    return <div className="favorites-empty">
        <h2>
            No favorite movies yet
        </h2>
        <p>start adding movies to your favorites</p>
    </div>
}

export default Favorite