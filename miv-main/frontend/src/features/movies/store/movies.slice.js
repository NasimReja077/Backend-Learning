import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  fetchTrending, fetchCustom, fetchCustomById,
  fetchMovieDetail, fetchTVDetail,
} from "../api/movie.api.js";

const readMyList = () => {
  try { return JSON.parse(localStorage.getItem("flixora-my-list") || "[]"); }
  catch { return []; }
};
const writeMyList = (list) => {
  try { localStorage.setItem("flixora-my-list", JSON.stringify(list)); }
  catch { /* ignore */ }
};

// ─── Thunks ──────────────────────────────────────────────────────────────────
export const loadTrending = createAsyncThunk("movies/loadTrending", async (page = 1) => {
  const data = await fetchTrending(page);
  return { page, results: data.results || [] };
});

export const loadCustomMovies = createAsyncThunk("movies/loadCustom", async () => {
  const data = await fetchCustom();
  return data.movies || [];
});

export const loadMovieDetails = createAsyncThunk("movies/loadDetails", async ({ id, type }, { getState }) => {
  const state = getState().movies;
  const isCustom = state.customMovies.some((m) => m.id === id || m._id === id);
  if (isCustom) {
    const data = await fetchCustomById(id);
    return transformCustom(data.movie);
  }
  if (type === "tv") return fetchTVDetail(id);
  return fetchMovieDetail(id);
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const transformCustom = (m) => ({
  id: m._id,
  title: m.title,
  overview: m.description || "",
  poster_path: m.poster || null,
  backdrop_path: m.poster || null,
  release_date: m.releaseDate || "",
  vote_average: 0,
  genre_ids: [],
  media_type: "movie",
  isCustom: true,
  customData: { trailer: m.trailer, genre: m.genre, category: m.category },
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const moviesSlice = createSlice({
  name: "movies",
  initialState: {
    movies: [],
    customMovies: [],
    selectedMovie: null,
    myList: readMyList(),
    page: 1,
    hasMore: true,
    loading: false,
    loadingMore: false,
    error: null,
    detailsLoading: false,
    detailsError: null,
  },
  reducers: {
    clearSelectedMovie: (s) => { s.selectedMovie = null; },
    toggleMyList: (s, { payload: movie }) => {
      if (!movie?.id) return;
      const idx = s.myList.findIndex((m) => m.id === movie.id);
      if (idx >= 0) s.myList.splice(idx, 1);
      else s.myList.unshift(movie);
      writeMyList(s.myList);
    },
  },
  extraReducers: (b) => {
    b
      .addCase(loadTrending.pending, (s, a) => {
        (a.meta.arg || 1) > 1 ? (s.loadingMore = true) : (s.loading = true);
        s.error = null;
      })
      .addCase(loadTrending.fulfilled, (s, { payload: { page, results } }) => {
        if (page > 1) {
          const ids = new Set(s.movies.map((m) => m.id));
          s.movies.push(...results.filter((m) => !ids.has(m.id)));
        } else {
          s.movies = results;
        }
        s.page = page;
        s.hasMore = results.length >= 20;
        s.loading = s.loadingMore = false;
      })
      .addCase(loadTrending.rejected, (s, a) => {
        s.error = a.error.message;
        s.loading = s.loadingMore = false;
      })
      .addCase(loadCustomMovies.fulfilled, (s, { payload }) => {
        s.customMovies = payload.map(transformCustom);
      })
      .addCase(loadMovieDetails.pending,   (s) => { s.detailsLoading = true; s.detailsError = null; })
      .addCase(loadMovieDetails.fulfilled, (s, { payload }) => { s.selectedMovie = payload; s.detailsLoading = false; })
      .addCase(loadMovieDetails.rejected,  (s, a) => { s.detailsError = a.error.message; s.detailsLoading = false; });
  },
});

export const { clearSelectedMovie, toggleMyList } = moviesSlice.actions;
export default moviesSlice.reducer;
