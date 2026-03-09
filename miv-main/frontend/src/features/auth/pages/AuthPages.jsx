import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../auth.context.jsx";
import "./auth.scss";

// ─── Schemas ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Min 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});

// ─── Field component ─────────────────────────────────────────────────────────
const Field = ({ label, error, ...inputProps }) => (
  <div className="auth-field">
    <input
      className={`form-input ${error ? "error" : ""}`}
      placeholder={label}
      {...inputProps}
    />
    {error && <p className="auth-field-error">{error}</p>}
  </div>
);

// ─── Login ────────────────────────────────────────────────────────────────────
export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      toast.success("Welcome back!");
      const from = location.state?.from || (res?.data?.user?.role === "admin" ? "/admin" : "/");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-backdrop" />
      <section className="auth-card animate-fadeUp">
        <h1 className="auth-title">Sign In</h1>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Field label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <button className="btn btn-primary btn-lg w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p className="auth-switch">
          New to Flixora?{" "}
          <Link to="/register" className="auth-link">Create account</Link>
        </p>
      </section>
    </main>
  );
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const {
    register, handleSubmit, formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Account created! Welcome to Flixora 🎬");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-backdrop" />
      <section className="auth-card animate-fadeUp">
        <h1 className="auth-title">Create Account</h1>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Username" error={errors.username?.message} {...register("username")} />
          <Field label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Field label="Password" type="password" error={errors.password?.message} {...register("password")} />
          <button className="btn btn-primary btn-lg w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Get Started"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </section>
    </main>
  );
};
