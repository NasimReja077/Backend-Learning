import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiCamera, FiEdit2, FiSave, FiX, FiFilm, FiHeart, FiStar, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar.jsx";
import { useAuth } from "../../auth/auth.context.jsx";
import { getProfile, updateProfile, uploadAvatar } from "../../movies/api/user.api.js";
import "./Profile.scss";

const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscores only").optional(),
  bio: z.string().max(200, "Max 200 characters").optional(),
});

const StatCard = ({ icon, label, value }) => (
  <div className="stat-card">
    <span className="stat-icon">{icon}</span>
    <span className="stat-value">{value}</span>
    <span className="stat-label">{label}</span>
  </div>
);

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      reset({ username: data.user?.username || "", bio: data.user?.bio || "" });
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (vals) => {
    try {
      await updateProfile(vals);
      await refreshUser();
      await load();
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("avatar", file);
    setAvatarUploading(true);
    try {
      await uploadAvatar(form);
      await refreshUser();
      await load();
      toast.success("Avatar updated! 📸");
    } catch (e) {
      toast.error(e.response?.data?.message || "Upload failed");
    } finally { setAvatarUploading(false); }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="profile-center"><p>Loading profile…</p></div>
      </div>
    );
  }

  const u = profile?.user || user;
  const stats = profile?.stats || {};

  return (
    <div className="profile-page">
      <Navbar activeLink="profile" />

      <div className="profile-body">
        {/* Avatar & Identity */}
        <section className="profile-card animate-fadeUp">
          <div className="avatar-wrap">
            {u?.avatar?.url ? (
              <img src={u.avatar.url} alt={u.username} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {u?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <button
              className="avatar-edit-btn"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              title="Change avatar"
            >
              {avatarUploading ? <span className="spinner-sm" /> : <FiCamera />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-identity">
            <h1>{u?.username}</h1>
            <p className="profile-bio">{u?.bio || "No bio yet."}</p>
            <p className="profile-since">
              Member since {u?.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
            </p>
          </div>

          <button
            className="edit-toggle-btn"
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? <><FiX /> Cancel</> : <><FiEdit2 /> Edit Profile</>}
          </button>
        </section>

        {/* Stats */}
        <section className="profile-stats animate-fadeUp">
          <StatCard icon={<FiHeart />}  label="Favorites"   value={stats.favorites || 0} />
          <StatCard icon={<FiClock />}  label="Watched"     value={stats.watched   || 0} />
          <StatCard icon={<FiStar />}   label="Reviews"     value={stats.reviews   || 0} />
          <StatCard icon={<FiFilm />}   label="My List"     value={u ? "∞" : 0} />
        </section>

        {/* Edit Form */}
        {editing && (
          <section className="profile-edit-form animate-fadeUp">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="profile-form-group">
                <label>Username</label>
                <input className={`form-input ${errors.username ? "error" : ""}`} {...register("username")} />
                {errors.username && <p className="field-err">{errors.username.message}</p>}
              </div>
              <div className="profile-form-group">
                <label>Bio <span className="label-hint">(max 200 chars)</span></label>
                <textarea
                  className={`form-input ${errors.bio ? "error" : ""}`}
                  rows={3}
                  placeholder="Tell the world about yourself…"
                  {...register("bio")}
                />
                {errors.bio && <p className="field-err">{errors.bio.message}</p>}
              </div>
              <div className="profile-form-actions">
                <button className="btn btn-primary btn-md" disabled={isSubmitting}>
                  <FiSave /> {isSubmitting ? "Saving…" : "Save Changes"}
                </button>
                <button type="button" className="btn btn-ghost btn-md" onClick={() => setEditing(false)}>
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  );
};

export default Profile;
