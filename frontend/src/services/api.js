const API_KEY = "de9c8afc4725cc9d8d6e01736341db71";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    const data = await response.json()
    return data.results
};

export const searchMovies = async (query) => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    const data = await response.json()
    return data.results;
};