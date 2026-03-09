import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import MovieCard, { getPosterUrl } from "../../components/MovieCard.jsx";
import { getHistory, clearHistory } from "../api/user.api.js";
import "./Catalog.scss";

const WatchHistory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(data.history || []);
    } catch { toast.error("Failed to load watch history"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClear = async () => {
    if (!window.confirm("Clear your entire watch history?")) return;
    try {
      await clearHistory();
      setItems([]);
      toast.success("Watch history cleared");
    } catch { toast.error("Failed to clear history"); }
  };

  return (
    <div className="catalog-page">
      <Navbar activeLink="watch-later" />
      <div className="catalog-header">
        <p className="catalog-kicker">Your Activity</p>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1>Watch History</h1>
            <p>Movies you've recently viewed.</p>
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ marginBottom: "0.5rem" }}>
              <FiTrash2 /> Clear All
            </button>
          )}
        </div>
      </div>

      {loading && <p className="catalog-state">Loading history…</p>}

      {!loading && items.length === 0 && (
        <div className="catalog-empty" style={{ margin: "1rem clamp(1rem, 3vw, 2.5rem)" }}>
          <h2>No watch history yet</h2>
          <p>Visit a movie page to start tracking your history.</p>
          <button className="btn btn-primary btn-md" onClick={() => navigate("/movies")}>Browse Movies</button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="catalog-grid">
          {items.map((item) => {
            const movie = item.movieData || {};
            const id = item.movieId;
            return (
              <article
                key={item._id || id}
                className="catalog-history-card"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/movie/${id}`)}
              >
                <div style={{ position: "relative", aspectRatio: "2/3", overflow: "hidden", borderRadius: "0.5rem 0.5rem 0 0" }}>
                  <img
                    src={
                      movie.poster_path && !movie.poster_path.startsWith("/")
                        ? movie.poster_path
                        : movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400"
                    }
                    alt={movie.title || "Movie"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "0.6rem 0.75rem 0.8rem" }}>
                  <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700 }}>
                    {movie.title || "Untitled"}
                  </h3>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#888" }}>
                    Watched {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
