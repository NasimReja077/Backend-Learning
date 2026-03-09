import { createBrowserRouter } from "react-router-dom";
import { Protected, AdminProtected } from "./features/auth/components/Guards.jsx";
import { Login, Register } from "./features/auth/pages/AuthPages.jsx";
import Home from "./features/movies/pages/Home.jsx";
import Movies from "./features/movies/pages/Movies.jsx";
import MovieDetails from "./features/movies/pages/MovieDetails.jsx";
import { MyList } from "./features/movies/pages/MyList.jsx";
import WatchHistory from "./features/movies/pages/WatchHistory.jsx";
import Favorites from "./features/movies/pages/Favorites.jsx";
import GenreBrowse from "./features/genre/pages/GenreBrowse.jsx";
import Profile from "./features/profile/pages/Profile.jsx";
import AdminDashboard from "./features/admin/pages/AdminDashboard.jsx";

// Lazy‑style wrapper to keep imports readable
const guard = (el) => <Protected>{el}</Protected>;
const admin = (el) => <Protected><AdminProtected>{el}</AdminProtected></Protected>;

export const router = createBrowserRouter([
  { path: "/",             element: guard(<Home />) },
  { path: "/movies",       element: guard(<Movies />) },
  { path: "/movie/:id",    element: guard(<MovieDetails />) },
  { path: "/tv/:id",       element: guard(<MovieDetails />) },
  { path: "/my-list",      element: guard(<MyList />) },
  { path: "/watched",      element: guard(<WatchHistory />) },
  { path: "/favorites",    element: guard(<Favorites />) },
  { path: "/genre",        element: guard(<GenreBrowse />) },
  { path: "/genre/:genreId", element: guard(<GenreBrowse />) },
  { path: "/profile",      element: guard(<Profile />) },
  { path: "/admin",        element: admin(<AdminDashboard />) },
  { path: "/login",        element: <Login /> },
  { path: "/register",     element: <Register /> },
  { path: "*",             element: guard(<Home />) },
]);
