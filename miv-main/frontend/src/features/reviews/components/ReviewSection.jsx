import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiThumbsUp, FiTrash2, FiEdit2, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/auth.context.jsx";
import { getReviews, createReview, updateReview, deleteReview, likeReview } from "../../movies/api/user.api.js";
import "./ReviewSection.scss";

const schema = z.object({
  rating: z.number({ coerce: true }).min(1).max(10),
  content: z.string().min(10, "Write at least 10 characters").max(1000),
  spoiler: z.boolean().optional(),
});

const StarPicker = ({ value, onChange }) => (
  <div className="star-picker">
    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        type="button"
        className={`star-btn ${n <= value ? "filled" : ""}`}
        onClick={() => onChange(n)}
      >
        ★
      </button>
    ))}
    <span className="star-label">{value || "—"}/10</span>
  </div>
);

const ReviewSection = ({ movieId, movieTitle }) => {
  const { user } = useAuth();
  const [data, setData] = useState({ reviews: [], avgRating: 0, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [showSpoilers, setShowSpoilers] = useState({});

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, content: "", spoiler: false },
  });

  const rating = watch("rating");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getReviews(movieId);
      setData(res);
    } catch { /* empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [movieId]);

  const onSubmit = async (vals) => {
    try {
      if (editId) {
        await updateReview(editId, vals);
        toast.success("Review updated!");
        setEditId(null);
      } else {
        await createReview(movieId, { ...vals, movieTitle });
        toast.success("Review posted! 🎬");
      }
      reset({ rating: 0, content: "", spoiler: false });
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save review");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteReview(id);
      toast.success("Review deleted");
      await load();
    } catch { toast.error("Failed to delete"); }
  };

  const handleLike = async (id) => {
    try {
      await likeReview(id);
      await load();
    } catch { toast.error("Failed"); }
  };

  const handleEdit = (review) => {
    setEditId(review._id);
    setValue("rating", review.rating);
    setValue("content", review.content);
    setValue("spoiler", review.spoiler || false);
  };

  return (
    <section className="review-section">
      <div className="review-header">
        <h2>Reviews & Ratings</h2>
        {data.pagination.total > 0 && (
          <div className="avg-rating">
            <span className="avg-score">{data.avgRating}</span>
            <span className="avg-label">/ 10  ({data.pagination.total} reviews)</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      {user ? (
        <div className="review-form-wrap">
          <h3>{editId ? "Edit your review" : "Write a review"}</h3>
          <form className="review-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-row">
              <label>Rating</label>
              <StarPicker value={rating} onChange={(v) => setValue("rating", v)} />
              {errors.rating && <p className="field-err">Pick a rating (1-10)</p>}
            </div>
            <div className="form-row">
              <label>Your Review</label>
              <textarea
                className={`form-input ${errors.content ? "error" : ""}`}
                rows={4}
                placeholder="Share your thoughts about this movie…"
                {...register("content")}
              />
              {errors.content && <p className="field-err">{errors.content.message}</p>}
            </div>
            <div className="form-row form-row-check">
              <input type="checkbox" id="spoiler" {...register("spoiler")} />
              <label htmlFor="spoiler">Contains spoilers</label>
            </div>
            <div className="review-form-actions">
              <button className="btn btn-primary btn-md" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : editId ? "Update Review" : "Post Review"}
              </button>
              {editId && (
                <button type="button" className="btn btn-ghost btn-md" onClick={() => { setEditId(null); reset(); }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <p className="review-login-prompt">
          <a href="/login">Sign in</a> to write a review.
        </p>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="review-state">Loading reviews…</p>
      ) : data.reviews.length === 0 ? (
        <p className="review-state">No reviews yet. Be the first!</p>
      ) : (
        <div className="review-list">
          {data.reviews.map((r) => {
            const spoilerHidden = r.spoiler && !showSpoilers[r._id];
            return (
              <article key={r._id} className="review-card">
                <div className="review-top">
                  <div className="reviewer-info">
                    {r.user?.avatar?.url ? (
                      <img src={r.user.avatar.url} alt={r.user.username} className="reviewer-avatar" />
                    ) : (
                      <div className="reviewer-avatar-placeholder">
                        {r.user?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <span className="reviewer-name">{r.user?.username || "Anonymous"}</span>
                      <span className="review-date">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="review-score">
                    <span className="score-value">{r.rating}</span>
                    <span className="score-total">/10</span>
                  </div>
                </div>

                {r.spoiler && (
                  <div className="spoiler-warning">
                    <FiAlertTriangle />
                    <span>Spoiler warning</span>
                    <button onClick={() => setShowSpoilers((s) => ({ ...s, [r._id]: !s[r._id] }))}>
                      {spoilerHidden ? "Show" : "Hide"}
                    </button>
                  </div>
                )}

                {!spoilerHidden && <p className="review-content">{r.content}</p>}

                <div className="review-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleLike(r._id)}
                    title="Like this review"
                  >
                    <FiThumbsUp /> {r.likes?.length || 0}
                  </button>
                  {user && user.id === r.user?._id && (
                    <>
                      <button className="action-btn" onClick={() => handleEdit(r)}><FiEdit2 /> Edit</button>
                      <button className="action-btn danger" onClick={() => handleDelete(r._id)}><FiTrash2 /> Delete</button>
                    </>
                  )}
                  {user?.role === "admin" && user.id !== r.user?._id && (
                    <button className="action-btn danger" onClick={() => handleDelete(r._id)}><FiTrash2 /> Remove</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
