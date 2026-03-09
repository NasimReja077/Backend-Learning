import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import { fetchGenres, fetchByGenre } from "../../movies/api/movie.api.js";
import "./Genre.scss";

const GENRE_ICONS = {
  28: "💥", 12: "🏔️", 16: "🎨", 35: "😂", 80: "🔫", 99: "📰",
  18: "🎭", 10751: "👨‍👩‍👧", 14: "🧙", 36: "📜", 27: "👻",
  10402: "🎵", 9648: "🔍", 10749: "❤️", 878: "🚀", 53: "⚡",
  10752: "🎖️", 37: "🤠",
};

const GenreBrowse = () => {
  const navigate = useNavigate();
  const { genreId } = useParams();
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [genreLoading, setGenreLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // Load genres
  useEffect(() => {
    fetchGenres()
      .then((d) => { setGenres(d.genres || []); setGenreLoading(false); })
      .catch(() => setGenreLoading(false));
  }, []);

  // Load movies when genre changes
  useEffect(() => {
    if (!genreId) return;
    const genre = genres.find((g) => String(g.id) === genreId);
    setSelectedGenre(genre || null);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    fetchByGenre(genreId, 1)
      .then((d) => {
        setMovies(d.results || []);
        setHasMore((d.results || []).length >= 20);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [genreId, genres]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading && page > 1) {
          loadMoreMovies();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loading, page]);

  const loadMoreMovies = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const d = await fetchByGenre(genreId, nextPage);
      setMovies((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...(d.results || []).filter((m) => !ids.has(m.id))];
      });
      setPage(nextPage);
      setHasMore((d.results || []).length >= 20);
    } catch { setHasMore(false); }
    finally { setLoadingMore(false); }
  };

  const handleGenreSelect = (id) => navigate(`/genre/${id}`);

  return (
    <div className="genre-page">
      <Navbar activeLink="genre" />

      {!genreId ? (
        /* Genre Picker */
        <div className="genre-picker">
          <div className="genre-picker-header">
            <p className="catalog-kicker">Browse by</p>
            <h1>Genres</h1>
            <p>Pick a genre to explore movies</p>
          </div>
          {genreLoading ? (
            <p className="genre-state">Loading genres…</p>
          ) : (
            <div className="genre-grid">
              {genres.map((g) => (
                <button
                  key={g.id}
                  className="genre-tile"
                  onClick={() => handleGenreSelect(g.id)}
                >
                  <span className="genre-icon">{GENRE_ICONS[g.id] || "🎬"}</span>
                  <span className="genre-name">{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Genre Movies */
        <div className="genre-movies">
          <div className="genre-movies-header">
            <button className="back-btn" onClick={() => navigate("/genre")}>
              <FiChevronLeft /> All Genres
            </button>
            <div>
              <p className="catalog-kicker">
                {GENRE_ICONS[parseInt(genreId)] || "🎬"} Genre
              </p>
              <h1>{selectedGenre?.name || "Movies"}</h1>
            </div>
          </div>

          {loading && <p className="genre-state">Loading {selectedGenre?.name} movies…</p>}

          {!loading && (
            <div className="catalog-grid" style={{ padding: "0 clamp(1rem, 3vw, 2.5rem) 1rem" }}>
              {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          )}

          <div ref={sentinelRef} style={{ height: 1 }} />
          {loadingMore && <p className="genre-state">Loading more…</p>}
          {!hasMore && !loadingMore && !loading && movies.length > 0 && (
            <p className="genre-state muted">End of {selectedGenre?.name} movies.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GenreBrowse;
