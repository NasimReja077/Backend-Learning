import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiPlay, FiPlus, FiCheck, FiArrowLeft, FiClock, FiHeart } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import ReviewSection from "../../reviews/components/ReviewSection.jsx";
import { useMovies } from "../hooks/useMovies.js";
import { addHistory, addFavorite, removeFavorite, checkFavorite } from "../api/user.api.js";
import { getPosterUrl } from "../../components/MovieCard.jsx";
import "./MovieDetails.scss";

const TMDB_IMG = "https://image.tmdb.org/t/p/w1280";

export const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedMovie, detailsLoading, detailsError, fetchDetails, clearDetails, toggleList, isInMyList } = useMovies();
  const [trailerKey, setTrailerKey] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    if (id) fetchDetails(id, "movie");
    return () => clearDetails();
  }, [id]);

  useEffect(() => {
    if (!selectedMovie) return;
    checkFavorite(id)
      .then((d) => setIsFavorite(d?.isFavorite || false))
      .catch(() => {});

    // Track watch history
    addHistory(id, {
      title: selectedMovie.title || selectedMovie.name,
      poster_path: selectedMovie.poster_path,
    }).catch(() => {});
  }, [selectedMovie]);

  const handleToggleFavorite = async () => {
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(id, { title: selectedMovie?.title, poster_path: selectedMovie?.poster_path });
        setIsFavorite(true);
        toast.success("Added to favorites ❤️");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally { setFavLoading(false); }
  };

  if (detailsLoading) {
    return (
      <div className="details-page">
        <Navbar activeLink="movies" />
        <div className="details-center"><p>Loading movie details…</p></div>
      </div>
    );
  }

  if (detailsError || !selectedMovie) {
    return (
      <div className="details-page">
        <Navbar activeLink="movies" />
        <div className="details-center">
          <p>{detailsError || "Movie not found"}</p>
          <button className="btn btn-primary btn-md" onClick={() => navigate("/")}>Go Home</button>
        </div>
      </div>
    );
  }

  const m = selectedMovie;
  const isCustom = m.isCustom || false;
  const backdrop = isCustom
    ? (m.backdrop_path && !m.backdrop_path.startsWith("/") ? m.backdrop_path : null)
    : (m.backdrop_path ? `${TMDB_IMG}${m.backdrop_path}` : null);

  const trailer = m.videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube")
    || m.videos?.results?.[0];
  const customTrailer = isCustom && m.customData?.trailer;

  const handlePlay = () => {
    if (trailer) { setTrailerKey(trailer.key); return; }
    if (customTrailer) { window.open(customTrailer, "_blank"); return; }
    toast.error("Trailer not available for this movie.");
  };

  const inList = isInMyList(m.id);
  const releaseYear = m.release_date ? new Date(m.release_date).getFullYear() : "N/A";

  return (
    <div className="details-page">
      <Navbar activeLink="movies" />

      <section
        className="details-hero"
        style={{ backgroundImage: backdrop ? `url(${backdrop})` : "none" }}
      >
        <div className="details-overlay" />
        <div className="details-body">
          <div className="details-poster">
            <img src={getPosterUrl(m)} alt={m.title || m.name} />
          </div>

          <div className="details-info animate-fadeUp">
            {isCustom && <span className="custom-pill">Custom Movie</span>}
            <h1>{m.title || m.name || "Untitled"}</h1>
            {m.tagline && <p className="tagline">"{m.tagline}"</p>}

            <div className="meta-row">
              <span>{releaseYear}</span>
              {m.runtime > 0 && <span>{m.runtime} min</span>}
              {m.vote_average > 0 && <span>⭐ {m.vote_average.toFixed(1)}/10</span>}
              {m.status && <span className="status-pill">{m.status}</span>}
            </div>

            {m.genres?.length > 0 && (
              <div className="genre-chips">
                {m.genres.map((g) => <span key={g.id} className="genre-chip">{g.name}</span>)}
              </div>
            )}
            {isCustom && m.customData?.genre && (
              <div className="genre-chips"><span className="genre-chip">{m.customData.genre}</span></div>
            )}

            <div className="overview">
              <h3>Overview</h3>
              <p>{m.overview || "No overview available."}</p>
            </div>

            <div className="details-actions">
              <button
                className="btn btn-white btn-lg"
                onClick={handlePlay}
                disabled={!trailer && !customTrailer}
              >
                <FiPlay /> {trailer || customTrailer ? "Play Trailer" : "No Trailer"}
              </button>
              <button
                className={`btn btn-lg ${isFavorite ? "btn-danger" : "btn-outline"}`}
                onClick={handleToggleFavorite}
                disabled={favLoading}
              >
                <FiHeart /> {isFavorite ? "Unfavorite" : "Favorite"}
              </button>
              <button
                className={`btn btn-lg ${inList ? "btn-outline" : "btn-outline"}`}
                onClick={() => toggleList(m)}
              >
                {inList ? <><FiCheck /> In My List</> : <><FiPlus /> My List</>}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>
                <FiArrowLeft /> Back
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Extra Info */}
      <section className="details-extra">
        {m.production_companies?.length > 0 && (
          <div className="extra-block">
            <h3>Production</h3>
            <p>{m.production_companies.slice(0, 4).map((c) => c.name).join(", ")}</p>
          </div>
        )}
        {m.budget > 0 && (
          <div className="extra-block">
            <h3>Budget</h3>
            <p>${(m.budget / 1e6).toFixed(1)}M</p>
          </div>
        )}
        {m.revenue > 0 && (
          <div className="extra-block">
            <h3>Revenue</h3>
            <p>${(m.revenue / 1e6).toFixed(1)}M</p>
          </div>
        )}
        {m.spoken_languages?.length > 0 && (
          <div className="extra-block">
            <h3>Languages</h3>
            <p>{m.spoken_languages.map((l) => l.english_name || l.name).join(", ")}</p>
          </div>
        )}
      </section>

      {/* Videos */}
      {m.videos?.results?.length > 0 && (
        <section className="details-videos">
          <h3>Videos & Trailers</h3>
          <div className="video-grid">
            {m.videos.results.slice(0, 4).map((v) => (
              <div key={v.key} className="video-card">
                <iframe
                  src={`https://www.youtube.com/embed/${v.key}`}
                  title={v.name}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
                <p>{v.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Reviews Section (NEW FEATURE) ─── */}
      <ReviewSection movieId={id} movieTitle={m.title || m.name} />

      {/* Trailer Modal */}
      {trailerKey && (
        <div className="trailer-modal" onClick={() => setTrailerKey(null)}>
          <div className="trailer-modal-inner" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-close" onClick={() => setTrailerKey(null)}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
