import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedMovie,
  loadCustomMovies,
  loadMovieDetails,
  loadTrending,
  toggleMyList,
} from "../store/movies.slice.js";

export const useMovies = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.movies);

  // Load on first mount
  useEffect(() => {
    if (!state.movies.length && !state.loading) dispatch(loadTrending(1));
  }, [dispatch, state.movies.length, state.loading]);

  useEffect(() => {
    if (!state.customMovies.length) dispatch(loadCustomMovies());
  }, [dispatch, state.customMovies.length]);

  const allMovies = useMemo(
    () => [...state.customMovies, ...state.movies],
    [state.customMovies, state.movies]
  );

  const loadMore = useCallback(() => {
    if (!state.loading && !state.loadingMore && state.hasMore) {
      dispatch(loadTrending(state.page + 1));
    }
  }, [dispatch, state.loading, state.loadingMore, state.hasMore, state.page]);

  const fetchDetails = useCallback(
    (id, type) => dispatch(loadMovieDetails({ id, type })).unwrap(),
    [dispatch]
  );

  const clearDetails = useCallback(() => dispatch(clearSelectedMovie()), [dispatch]);

  const toggleList = useCallback((movie) => dispatch(toggleMyList(movie)), [dispatch]);

  const isInMyList = useCallback(
    (id) => state.myList.some((m) => m.id === id),
    [state.myList]
  );

  return {
    ...state,
    allMovies,
    loadMore,
    fetchDetails,
    clearDetails,
    toggleList,
    isInMyList,
  };
};
