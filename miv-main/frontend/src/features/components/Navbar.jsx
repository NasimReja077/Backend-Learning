import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiUser, FiLogOut,
  FiHome, FiFilm, FiBookmark, FiClock, FiTag, FiShield,
} from "react-icons/fi";
import { useAuth } from "../auth/auth.context.jsx";
import { fetchSearch } from "../movies/api/movie.api.js";
import "./Navbar.scss";

const TMDB_IMG = "https://image.tmdb.org/t/p/w92";

export const Navbar = ({ activeLink = "home" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const timer = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search (500ms)
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setShowDrop(false); return; }

    clearTimeout(timer.current);
    setSearching(true);

    timer.current = setTimeout(async () => {
      try {
        const data = await fetchSearch(query);
        const items = (data.results || []).slice(0, 8);
        setResults(items);
        setShowDrop(items.length > 0);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 500);

    return () => clearTimeout(timer.current);
  }, [query]);

  const handleResultClick = (item) => {
    navigate(item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`);
    setQuery("");
    setShowDrop(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getPoster = (item) =>
    item.poster_path
      ? `${TMDB_IMG}${item.poster_path}`
      : "https://via.placeholder.com/46x69?text=No+Image";

  const navLinks = [
    { key: "home",        icon: <FiHome />,     label: "Home",       to: "/" },
    { key: "movies",      icon: <FiFilm />,     label: "Movies",     to: "/movies" },
    { key: "genre",       icon: <FiTag />,      label: "Genres",     to: "/genre" },
    { key: "my-list",     icon: <FiBookmark />, label: "My List",    to: "/my-list" },
    { key: "watch-later", icon: <FiClock />,    label: "Watched",    to: "/watched" },
    ...(user?.role === "admin"
      ? [{ key: "admin", icon: <FiShield />, label: "Admin", to: "/admin" }]
      : []),
  ];

  return (
    <header className="navbar">
      <button className="navbar-brand" onClick={() => navigate("/")}>FLIXORA</button>

      <nav className="navbar-links" aria-label="Main navigation">
        {navLinks.map((l) => (
          <button
            key={l.key}
            className={`nav-link ${activeLink === l.key ? "active" : ""}`}
            onClick={() => navigate(l.to)}
          >
            {l.icon}
            <span>{l.label}</span>
          </button>
        ))}
      </nav>

      {/* Search */}
      <div className="navbar-search" ref={containerRef}>
        <div className="search-input-wrap">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search movies, TV shows…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowDrop(true)}
          />
          {searching && <span className="search-spinner" />}
          {query && (
            <button className="search-clear" onClick={() => { setQuery(""); setShowDrop(false); }}>
              <FiX />
            </button>
          )}
        </div>

        {showDrop && (
          <div className="search-dropdown">
            {results.map((item) => (
              <div
                key={item.id}
                className="search-result"
                onClick={() => handleResultClick(item)}
              >
                <img src={getPoster(item)} alt={item.title || item.name} />
                <div>
                  <h4>{item.title || item.name}</h4>
                  <p>
                    {item.media_type === "tv" ? "TV Show" : "Movie"}
                    {item.vote_average ? ` • ⭐ ${item.vote_average.toFixed(1)}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User area */}
      <div className="navbar-user">
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt={user.username}
            className="user-avatar"
            onClick={() => navigate("/profile")}
          />
        ) : (
          <button className="user-icon-btn" onClick={() => navigate("/profile")}>
            <FiUser />
          </button>
        )}
        <span className="username" onClick={() => navigate("/profile")}>
          {user?.username}
        </span>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
