import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import { getFavorites, removeFavorite } from "../api/user.api.js";
import "./Catalog.scss";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data.favorites || []);
    } catch {
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (movieId, e) => {
    e.stopPropagation();
    try {
      await removeFavorite(movieId);
      setFavorites((prev) => prev.filter((f) => String(f.movieId) !== String(movieId)));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove");
    }
  };

  return (
    <div className="catalog-page">
      <Navbar activeLink="my-list" />
      <div className="catalog-header">
        <p className="catalog-kicker">
          <FiHeart style={{ display: "inline", marginRight: "0.3rem" }} />
          Saved
        </p>
        <h1>My Favorites</h1>
        <p>Movies you've marked as favorites.</p>
      </div>

      {loading && <p className="catalog-state">Loading favorites…</p>}

      {!loading && favorites.length === 0 && (
        <div className="catalog-empty" style={{ margin: "1rem clamp(1rem, 3vw, 2.5rem)" }}>
          <h2>No favorites yet</h2>
          <p>Open any movie and click the ❤️ Favorite button to save it here.</p>
          <button className="btn btn-primary btn-md" onClick={() => navigate("/movies")}>
            Browse Movies
          </button>
        </div>
      )}

      {!loading && favorites.length > 0 && (
        <div className="catalog-grid">
          {favorites.map((fav) => {
            const movie = fav.movieData || {};
            const id = fav.movieId;
            const poster = movie.poster_path
              ? movie.poster_path.startsWith("http")
                ? movie.poster_path
                : `${TMDB_IMG}${movie.poster_path}`
              : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400";

            return (
              <article
                key={fav._id || id}
                className="catalog-card"
                style={{ cursor: "pointer", position: "relative" }}
                onClick={() => navigate(`/movie/${id}`)}
              >
                <button
                  className="fav-remove-btn"
                  onClick={(e) => handleRemove(id, e)}
                  title="Remove from favorites"
                >
                  <FiTrash2 />
                </button>
                <img
                  src={poster}
                  alt={movie.title || "Movie"}
                  style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400";
                  }}
                />
                <div className="catalog-meta">
                  <h3>{movie.title || "Untitled"}</h3>
                  <p>Added {new Date(fav.createdAt).toLocaleDateString()}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
