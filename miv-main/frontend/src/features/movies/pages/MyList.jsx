import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import MovieCard from "../../components/MovieCard.jsx";
import { useMovies } from "../hooks/useMovies.js";
import "./Catalog.scss";

export const MyList = () => {
  const navigate = useNavigate();
  const { myList } = useMovies();

  return (
    <div className="catalog-page">
      <Navbar activeLink="my-list" />
      <div className="catalog-header">
        <p className="catalog-kicker">Saved Picks</p>
        <h1>My List</h1>
        <p>All your bookmarked titles in one place.</p>
      </div>

      {myList.length === 0 ? (
        <div className="catalog-empty" style={{ margin: "1rem clamp(1rem, 3vw, 2.5rem)" }}>
          <h2>Your list is empty</h2>
          <p>Open any movie and click "+ My List" to start building your collection.</p>
          <button className="btn btn-primary btn-md" onClick={() => navigate("/movies")}>Browse Movies</button>
        </div>
      ) : (
        <div className="catalog-grid">
          {myList.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      )}
    </div>
  );
};
