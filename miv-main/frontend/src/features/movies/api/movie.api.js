import api from "../../../app/api.js";

export const fetchTrending    = (page = 1)       => api.get(`/movies/trending?page=${page}`).then(r => r.data.data);
export const fetchPopular     = (page = 1)       => api.get(`/movies/popular?page=${page}`).then(r => r.data.data);
export const fetchTopRated    = (page = 1)       => api.get(`/movies/top-rated?page=${page}`).then(r => r.data.data);
export const fetchSearch      = (q, page = 1)    => api.get(`/movies/search?query=${encodeURIComponent(q)}&page=${page}`).then(r => r.data.data);
export const fetchMovieDetail = (id)             => api.get(`/movies/${id}`).then(r => r.data.data);
export const fetchTVDetail    = (id)             => api.get(`/movies/tv/${id}`).then(r => r.data.data);
export const fetchGenres      = ()               => api.get("/movies/genres").then(r => r.data.data);
export const fetchByGenre     = (gId, page = 1)  => api.get(`/movies/genre/${gId}?page=${page}`).then(r => r.data.data);
export const fetchCustom      = ()               => api.get("/movies/custom").then(r => r.data.data);
export const fetchCustomById  = (id)             => api.get(`/movies/custom/${id}`).then(r => r.data.data);
