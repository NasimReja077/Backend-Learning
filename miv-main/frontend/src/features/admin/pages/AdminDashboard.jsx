import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiUsers, FiFilm, FiShield, FiSlash, FiTrash2, FiEdit2, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import { useAuth } from "../../auth/auth.context.jsx";
import api from "../../../app/api.js";
import "./Admin.scss";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  trailer: z.string().optional(),
  genre: z.string().optional(),
  category: z.string().optional(),
  poster: z.string().optional(),
});

const TABS = ["users", "movies"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [movieSearch, setMovieSearch] = useState("");

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: { title: "", description: "", releaseDate: "", trailer: "", genre: "", category: "", poster: "" },
  });

  const posterUrl = watch("poster");

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, m] = await Promise.all([
        api.get("/admin/users").then(r => r.data.data.users),
        api.get("/admin/movies").then(r => r.data.data.movies),
      ]);
      setUsers(u); setMovies(m);
    } catch { toast.error("Failed to load admin data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return users.filter(u => u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }, [users, userSearch]);

  const filteredMovies = useMemo(() => {
    const q = movieSearch.toLowerCase();
    return movies.filter(m => m.title?.toLowerCase().includes(q));
  }, [movies, movieSearch]);

  const handleBan = async (id) => {
    try {
      const res = await api.patch(`/admin/users/${id}/ban`);
      toast.success(res.data.message);
      loadData();
    } catch { toast.error("Failed"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.delete(`/admin/users/${id}`); toast.success("User deleted"); loadData(); }
    catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try { await api.delete(`/admin/movies/${id}`); toast.success("Movie deleted"); loadData(); }
    catch { toast.error("Failed"); }
  };

  const handleEditMovie = (m) => {
    setEditId(m._id);
    Object.entries({ title: m.title, description: m.description, releaseDate: m.releaseDate, trailer: m.trailer, genre: m.genre, category: m.category, poster: m.poster }).forEach(([k, v]) => setValue(k, v || ""));
    setTab("movies");
  };

  const onMovieSubmit = async (vals) => {
    try {
      if (editId) {
        await api.put(`/admin/movies/${editId}`, vals);
        toast.success("Movie updated!");
        setEditId(null);
      } else {
        await api.post("/admin/movies", vals);
        toast.success("Movie created! 🎬");
      }
      reset();
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const stats = [
    { icon: <FiUsers />, label: "Total Users", value: users.length },
    { icon: <FiShield />, label: "Admins", value: users.filter(u => u.role === "admin").length },
    { icon: <FiFilm />, label: "Custom Movies", value: movies.length },
    { icon: <FiSlash />, label: "Banned Users", value: users.filter(u => u.isBanned).length },
  ];

  return (
    <div className="admin-page">
      <Navbar />
      <div className="admin-body">
        <header className="admin-top">
          <div>
            <p className="admin-kicker">Admin Console</p>
            <h1>Welcome, {user?.username}</h1>
          </div>
          <button className="btn btn-ghost btn-md" onClick={() => navigate("/")}>← Home</button>
        </header>

        <div className="admin-stats">
          {stats.map((s) => (
            <div key={s.label} className="admin-stat">
              <span className="stat-icon">{s.icon}</span>
              <div><p className="stat-val">{s.value}</p><p className="stat-lbl">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <section className="admin-panel">
            <div className="panel-toolbar">
              <h2>Manage Users</h2>
              <input className="form-input" placeholder="Search users…" value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ maxWidth: 280 }} />
            </div>
            {loading ? <p>Loading…</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>{u.username}</td><td>{u.email}</td><td>{u.role}</td>
                        <td><span className={`status-badge ${u.isBanned ? "banned" : "active"}`}>{u.isBanned ? "Banned" : "Active"}</span></td>
                        <td className="actions">
                          <button className="btn btn-sm btn-outline" onClick={() => handleBan(u._id)}>{u.isBanned ? "Unban" : "Ban"}</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(u._id)}><FiTrash2 /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "movies" && (
          <section className="admin-panel">
            <h2>{editId ? "Edit Movie" : "Create Movie"}</h2>
            <form className="movie-form" onSubmit={handleSubmit(onMovieSubmit)}>
              <div className="movie-form-grid">
                <div className="movie-form-fields">
                  <div className="form-group"><label>Title *</label><input className={`form-input ${errors.title ? "error" : ""}`} placeholder="Movie title" {...register("title")} />{errors.title && <p className="field-err">{errors.title.message}</p>}</div>
                  <div className="form-row-2">
                    <div className="form-group"><label>Release Date</label><input className="form-input" placeholder="2024-01-15" {...register("releaseDate")} /></div>
                    <div className="form-group"><label>Genre</label><input className="form-input" placeholder="Action, Drama…" {...register("genre")} /></div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group"><label>Category</label><input className="form-input" placeholder="Hollywood, Bollywood…" {...register("category")} /></div>
                    <div className="form-group"><label>Trailer URL</label><input className="form-input" placeholder="YouTube link" {...register("trailer")} /></div>
                  </div>
                  <div className="form-group"><label>Poster URL</label><input className="form-input" placeholder="https://…" {...register("poster")} /></div>
                  <div className="form-group"><label>Description</label><textarea className="form-input" rows={4} placeholder="Movie description…" {...register("description")} /></div>
                </div>
                <div className="poster-preview-col">
                  <label>Poster Preview</label>
                  <div className="poster-preview">
                    {posterUrl ? <img src={posterUrl} alt="Poster" /> : <div className="poster-empty">🎬<p>No poster URL</p></div>}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary btn-md" disabled={isSubmitting}>{isSubmitting ? "Saving…" : editId ? "Update Movie" : "Create Movie"}</button>
                {editId && <button type="button" className="btn btn-ghost btn-md" onClick={() => { setEditId(null); reset(); }}>Cancel</button>}
              </div>
            </form>

            <div className="panel-toolbar" style={{ marginTop: "2rem" }}>
              <h3>All Custom Movies ({movies.length})</h3>
              <input className="form-input" placeholder="Search movies…" value={movieSearch} onChange={e => setMovieSearch(e.target.value)} style={{ maxWidth: 280 }} />
            </div>
            {loading ? <p>Loading…</p> : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Genre</th><th>Category</th><th>Release</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredMovies.map(m => (
                      <tr key={m._id}>
                        <td>{m.title}</td><td>{m.genre || "—"}</td><td>{m.category || "—"}</td><td>{m.releaseDate || "—"}</td>
                        <td className="actions">
                          <button className="btn btn-sm btn-outline" onClick={() => handleEditMovie(m)}><FiEdit2 /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteMovie(m._id)}><FiTrash2 /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
