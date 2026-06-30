function MovieMeta({ movie }) {

    const formatRuntime = (mins) => {
        if (!mins) return "N/A";
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const formatMoney = (amount) => {
        return amount > 0 ? `$${amount.toLocaleString()}` : "N/A";
    };

    return (
        <div className="movie-meta-section">
            <div className="detail-meta">
                <span>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                <span>🕐 {formatRuntime(movie.runtime)}</span>
                <span>🌍 {movie.original_language?.toUpperCase()}</span>
                <span>📅 {movie.release_date}</span>
                <span>📊 {movie.status}</span>
            </div>

            <div className="detail-financials">
                <span>💰 Budget: {formatMoney(movie.budget)}</span>
                <span>🎯 Revenue: {formatMoney(movie.revenue)}</span>
            </div>
        </div>
    );
}

export default MovieMeta;