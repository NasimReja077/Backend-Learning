import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlay, FiInfo } from "react-icons/fi";
import Navbar from "../../components/Navbar.jsx";
import MovieCard, { getPosterUrl } from "../../components/MovieCard.jsx";
import { useMovies } from "../hooks/useMovies.js";
import "./Home.scss";

const TMDB_BACKDROP = "https://image.tmdb.org/t/p/original";

const getBackdrop = (m) => {
  if (!m) return null;
  if (m.isCustom && m.backdrop_path && !m.backdrop_path.startsWith("/")) return m.backdrop_path;
  if (m.backdrop_path) return `${TMDB_BACKDROP}${m.backdrop_path}`;
  return null;
};

const Home = () => {
  const navigate = useNavigate();
  const { allMovies, loading, error, fetchDetails } = useMovies();
  const [trailerKey, setTrailerKey] = useState(null);

  const hero    = allMovies[0];
  const trending = allMovies.slice(0, 10);
  const picks    = allMovies.slice(10, 14);
  const media    = allMovies.slice(14, 20);

  const handlePlay = async () => {
    if (!hero) return;
    if (hero.isCustom && hero.customData?.trailer) {
      window.open(hero.customData.trailer, "_blank");
      return;
    }
    try {
      const details = await fetchDetails(hero.id, hero.media_type);
      const trailer = details?.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      ) || details?.videos?.results?.[0];
      if (trailer) setTrailerKey(trailer.key);
      else navigate(`/movie/${hero.id}`);
    } catch {
      navigate(`/movie/${hero.id}`);
    }
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section
        className="hero"
        style={{
          backgroundImage: getBackdrop(hero)
            ? `url(${getBackdrop(hero)})`
            : "none",
        }}
      >
        <div className="hero-overlay" />
        <Navbar activeLink="home" />

        <div className="hero-body">
          <div className="hero-content">
            <p className="hero-kicker">🔥 TRENDING #1</p>
            <h1>{hero?.title || hero?.name || "Welcome to Flixora"}</h1>
            <p className="hero-overview">
              {(hero?.overview || "Discover the best movies and TV shows on Flixora.").slice(0, 200)}
              {(hero?.overview?.length || 0) > 200 ? "…" : ""}
            </p>
            <div className="hero-actions">
              <button className="btn btn-white btn-lg" onClick={handlePlay}>
                <FiPlay /> Play Trailer
              </button>
              <button
                className="btn btn-ghost btn-lg"
                onClick={() => hero && navigate(`/movie/${hero.id}`)}
              >
                <FiInfo /> More Info
              </button>
            </div>
          </div>

          <aside className="hero-panel">
            <h3>Now Streaming</h3>
            {hero && (
              <ul>
                <li><strong>Type</strong><span>{hero.media_type === "tv" ? "TV Show" : "Movie"}</span></li>
                {hero.vote_average > 0 && (
                  <li><strong>Rating</strong><span>⭐ {hero.vote_average.toFixed(1)}/10</span></li>
                )}
                {hero.release_date && (
                  <li><strong>Year</strong><span>{new Date(hero.release_date).getFullYear()}</span></li>
                )}
              </ul>
            )}
          </aside>
        </div>
        <div className="hero-fade" />
      </section>

      {/* Sections */}
      <div className="home-sections">
        {/* Trending row */}
        <section className="home-row">
          <div className="row-header">
            <div>
              <h2>Trending Now</h2>
              <p>Live from your backend movie service</p>
            </div>
            <button className="see-all" onClick={() => navigate("/movies")}>See all →</button>
          </div>
          {loading && <p className="state-text">Loading…</p>}
          {error && <p className="state-text error">{error}</p>}
          {!loading && (
            <div className="card-scroll">
              {trending.map((m, i) => (
                <div key={m.id} className="card-scroll-item">
                  <MovieCard movie={m} rank={i + 1} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Editor Picks */}
        <section className="home-row">
          <div className="row-header">
            <div>
              <h2>Editor's Picks</h2>
              <p>Handpicked for tonight</p>
            </div>
            <button className="see-all" onClick={() => navigate("/my-list")}>Explore →</button>
          </div>
          <div className="picks-grid">
            {picks.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>

        {/* Media Grid */}
        <section className="home-row">
          <div className="row-header">
            <div><h2>Images & Media</h2><p>Posters from live data</p></div>
          </div>
          <div className="media-grid">
            {media.map((m) => (
              <div
                key={m.id}
                className="media-cell"
                onClick={() => navigate(`/movie/${m.id}`)}
              >
                <img src={getPosterUrl(m)} alt={m.title || m.name} loading="lazy" />
                <span>{m.title || m.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {trailerKey && (
        <div className="trailer-modal" onClick={() => setTrailerKey(null)}>
          <div className="trailer-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setTrailerKey(null)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
