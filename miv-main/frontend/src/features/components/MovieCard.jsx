import { useNavigate } from "react-router-dom";
import { FiPlus, FiCheck, FiStar } from "react-icons/fi";
import { useMovies } from "../movies/hooks/useMovies.js";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

export const getPosterUrl = (movie) => {
  if (movie?.isCustom && movie.poster_path && !movie.poster_path.startsWith("/")) {
    return movie.poster_path;
  }
  if (movie?.poster_path) return `${TMDB_IMG}${movie.poster_path}`;
  if (movie?.backdrop_path) return `${TMDB_IMG}${movie.backdrop_path}`;
  return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
};

export const MovieCard = ({ movie, rank }) => {
  const navigate = useNavigate();
  const { toggleList, isInMyList } = useMovies();
  const inList = isInMyList(movie.id);

  const handleClick = () => {
    if (movie.media_type === "tv") navigate(`/tv/${movie.id}`);
    else navigate(`/movie/${movie.id}`);
  };

  return (
    <article className="movie-card" onClick={handleClick}>
      <div className="movie-card-poster">
        <img
          src={getPosterUrl(movie)}
          alt={movie.title || movie.name}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
          }}
        />
        {rank && <span className="rank-badge">#{rank}</span>}
        {movie.vote_average > 0 && (
          <span className="rating-badge">
            <FiStar /> {movie.vote_average.toFixed(1)}
          </span>
        )}
        {movie.isCustom && <span className="custom-badge">Custom</span>}
        <button
          className={`list-btn ${inList ? "in-list" : ""}`}
          onClick={(e) => { e.stopPropagation(); toggleList(movie); }}
          title={inList ? "Remove from My List" : "Add to My List"}
        >
          {inList ? <FiCheck /> : <FiPlus />}
        </button>
      </div>
      <div className="movie-card-info">
        <h3>{movie.title || movie.name || "Untitled"}</h3>
        <p>{movie.release_date ? new Date(movie.release_date).getFullYear() : "—"}</p>
      </div>
    </article>
  );
};

export default MovieCard;
