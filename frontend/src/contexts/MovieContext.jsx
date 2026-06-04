import {createContext, useState, useContext, useEffect} from 'react';

export const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({children}) => {
    const [favorites, setFavorites] = useState([]);
    useEffect(() => {
        const storedFavs = localStorage.getItem("favorites");
        if(storedFavs) {
            setFavorites(JSON.parse(storedFavs));
        }
    }, []);
    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    const addToFavorites = (movie) => {
        setFavorites(prev =>[...prev, movie]);
    }
    const removeFromFavorites = (movieId) => {
        setFavorites(prev => prev.filter(movie => movie.id !== movieId));
    }
    const isFavorite = (movieId) => {
        return favorites.some(movie => movie.id === movieId);
    }

    return (
        <MovieContext.Provider value={{favorites, addToFavorites, removeFromFavorites, isFavorite}}>
            {children}
        </MovieContext.Provider>
    );
}