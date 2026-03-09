import axios from "axios";

const tmdb = axios.create({
  baseURL: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
  params: { api_key: process.env.TMDB_API_KEY },
  timeout: 8000,
});

export const getTrending = async (page = 1) => {
  const { data } = await tmdb.get("/trending/movie/week", { params: { page } });
  return data;
};

export const searchMulti = async (query, page = 1) => {
  const { data } = await tmdb.get("/search/multi", { params: { query, page } });
  return data;
};

export const getMovieDetails = async (id) => {
  const { data } = await tmdb.get(`/movie/${id}`, {
    params: { append_to_response: "videos,credits,similar" },
  });
  return data;
};

export const getTVDetails = async (id) => {
  const { data } = await tmdb.get(`/tv/${id}`, {
    params: { append_to_response: "videos,credits,similar" },
  });
  return data;
};

export const getGenres = async () => {
  const [movies, tv] = await Promise.all([
    tmdb.get("/genre/movie/list"),
    tmdb.get("/genre/tv/list"),
  ]);
  const combined = [
    ...movies.data.genres,
    ...tv.data.genres.filter(
      (g) => !movies.data.genres.some((m) => m.id === g.id)
    ),
  ];
  return combined;
};

export const getByGenre = async (genreId, page = 1) => {
  const { data } = await tmdb.get("/discover/movie", {
    params: { with_genres: genreId, sort_by: "popularity.desc", page },
  });
  return data;
};

export const getPopular = async (page = 1) => {
  const { data } = await tmdb.get("/movie/popular", { params: { page } });
  return data;
};

export const getTopRated = async (page = 1) => {
  const { data } = await tmdb.get("/movie/top_rated", { params: { page } });
  return data;
};
