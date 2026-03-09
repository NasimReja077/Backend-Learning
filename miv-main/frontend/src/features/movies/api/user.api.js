import api from "../../../app/api.js";

// ─── Favorites ────────────────────────────────────────────────────────────────
export const getFavorites     = ()                    => api.get("/favorites").then(r => r.data.data);
export const addFavorite      = (movieId, movieData)  => api.post(`/favorites/${movieId}`, { movieData });
export const removeFavorite   = (movieId)             => api.delete(`/favorites/${movieId}`);
export const checkFavorite    = (movieId)             => api.get(`/favorites/check/${movieId}`).then(r => r.data.data);

// ─── History ──────────────────────────────────────────────────────────────────
export const getHistory       = ()                    => api.get("/history").then(r => r.data.data);
export const addHistory       = (movieId, movieData)  => api.post(`/history/${movieId}`, { movieData });
export const clearHistory     = ()                    => api.delete("/history");

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const getReviews       = (movieId, page = 1)   => api.get(`/reviews/movie/${movieId}?page=${page}`).then(r => r.data.data);
export const createReview     = (movieId, data)       => api.post(`/reviews/movie/${movieId}`, data).then(r => r.data.data);
export const updateReview     = (id, data)            => api.put(`/reviews/${id}`, data).then(r => r.data.data);
export const deleteReview     = (id)                  => api.delete(`/reviews/${id}`);
export const likeReview       = (id)                  => api.post(`/reviews/${id}/like`).then(r => r.data.data);
export const getMyReviews     = ()                    => api.get("/reviews/my").then(r => r.data.data);

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile       = ()                    => api.get("/profile").then(r => r.data.data);
export const updateProfile    = (data)                => api.put("/profile", data).then(r => r.data.data);
export const uploadAvatar     = (formData)            => api.post("/profile/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data.data);
export const getPublicProfile = (userId)              => api.get(`/profile/user/${userId}`).then(r => r.data.data);
