const API_KEY = "de9c8afc4725cc9d8d6e01736341db71";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async (page = 1) => {
    const response = await
        fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    const data = await response.json()
    return { movies: data.results, totalPages: data.total_pages };
};

export const searchMovies = async (query, page = 1) => {
    const response = await
        fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
    }
    const data = await response.json()
    return { movies: data.results, totalPages: data.total_pages };
};

export const getMovieTrailer = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`Failed to fetch videos: ${response.status}`);
    const data = await response.json();
    const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
    return trailer ? trailer.key : null;
};

export const getMovieDetails = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`Failed to fetch details: ${response.status}`);
    return await response.json();
};
//where the movie is available
export const getWatchProviders = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`Failed to fetch watch providers: ${response.status}`);
    const data = await response.json();
    return data.results ?? null;
};
//cast and crew fetching
export const getMovieCredits = async (movieId) => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    if(!response.ok)throw new Error(`Failed to fetch credits: ${response.status}`);
    return await response.json();
};