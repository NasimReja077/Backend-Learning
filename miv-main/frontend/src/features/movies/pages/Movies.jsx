import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import { useMovies } from "../hooks/useMovies.js";
import "./Catalog.scss";

const Movies = () => {
  const navigate = useNavigate();
  const { allMovies, loading, loadingMore, hasMore, error, loadMore } = useMovies();
  const sentinelRef = useRef(null);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1, rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="catalog-page">
      <Navbar activeLink="movies" />

      <div className="catalog-header">
        <p className="catalog-kicker">Full Catalog</p>
        <h1>Movies</h1>
        <p>Browse trending titles from our live feed.</p>
      </div>

      {loading && <p className="catalog-state">Loading…</p>}
      {error && !loading && <p className="catalog-state error">{error}</p>}

      {!loading && (
        <div className="catalog-grid">
          {allMovies.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loadingMore && <p className="catalog-state">Loading more…</p>}
      {!hasMore && !loadingMore && !loading && (
        <p className="catalog-state muted">You've reached the end.</p>
      )}
    </div>
  );
};

export default Movies;
