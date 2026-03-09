import { configureStore } from "@reduxjs/toolkit";
import moviesReducer from "../features/movies/store/movies.slice.js";

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
  },
});
