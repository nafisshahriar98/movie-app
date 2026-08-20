import { useState, useEffect } from "react";
import { getPopularSeries, searchSeries } from "../services/api";
import SkeletonCard from "../components/SkeletonCard";
import "../css/SkeletonCard.css";
import "../css/Home.css";

function Series() {
  const [searchQuery, setSearchQuery] = useState("");
  const [series, setSeries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const data = searchQuery.trim()
          ? await searchSeries(searchQuery, 1)
          : await getPopularSeries(1);

        setSeries(data.series);
        setPage(1);
        setHasMore(1 < data.totalPages);
      } catch (err) {
        setError("Failed to search series...");
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const loadMoreSeries = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = searchQuery.trim()
        ? await searchSeries(searchQuery, nextPage)
        : await getPopularSeries(nextPage);
      setSeries((prevSeries) => [...prevSeries, ...data.series]);
      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);
    } catch (err) {
      setError("Failed to load more series...");
    } finally {
      setLoadingMore(false);
    }
  };
  if (loading) {
    return (
      <div className="home">
        <h1>Loading Series...</h1>

        <div className="movies-grid">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="search-form">
        <input
          type="text"
          placeholder="Search for series..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <h1>Popular Series</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="movies-grid">
        {series.map((item) => (
          <div key={item.id} className="movie-card">
            <div className="movie-poster">
              <img
                src={
                  item.poster_path
                    ? `/tmdb-image/t/p/w500${item.poster_path}`
                    : "/no-poster.png"
                }
                alt={item.name}
              />
            </div>

            <div className="movie-info">
              <h3>{item.name}</h3>
              <p>{item.first_air_date?.split("-")[0]}</p>
              <p>Rating: {item.vote_average}/10</p>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button className="load-more-btn" onClick={loadMoreSeries}>
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
export default Series;
