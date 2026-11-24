import { useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  BellRing,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound
} from "lucide-react";
import Button from "./ui/button.jsx";
import Input from "./ui/input.jsx";
import Label from "./ui/label.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "./ui/card.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isRegistering = mode === "register";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isRegistering) {
        await axios.post(`${API}/auth/register`, { name, email, password });
      }

      const response = await axios.post(`${API}/auth/login`, { email, password });
      onAuthenticated(response.data);
    } catch (requestError) {
      console.error("Authentication failed:", requestError);
      setError(
        requestError.response?.data?.message ||
        "We couldn't sign you in. Check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = () => {
    setMode(isRegistering ? "login" : "register");
    setError("");
  };

  return (
    <div className="auth-shell">
      <header className="auth-topbar">
        <a className="brand" href="/" aria-label="NotifyHub home">
          <span className="brand-mark"><BellRing size={19} /></span>
          <span>notify<span className="brand-accent">hub</span></span>
        </a>
        <div className="auth-top-note"><span /> Private &amp; secure</div>
      </header>

      <main className="auth-layout">
        <section className="auth-intro">
          <div className="auth-intro-content">
            <div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL INBOX</div>
            <h1>Good things<br />happen. <span>Stay in the know.</span></h1>
            <p>Sign in to catch every update, message, and moment — all in one calm, organized place.</p>
            <div className="auth-benefits">
              <div><span className="benefit-icon"><Check size={14} /></span> Real-time updates, as they happen</div>
              <div><span className="benefit-icon"><Check size={14} /></span> One simple place for everything</div>
              <div><span className="benefit-icon"><Check size={14} /></span> Your account, your notifications</div>
            </div>
          </div>
          <div className="auth-decoration" aria-hidden="true">
            <span className="auth-orbit orbit-one" />
            <span className="auth-orbit orbit-two" />
            <span className="auth-bell"><BellRing size={54} strokeWidth={1.35} /></span>
            <span className="auth-decoration-spark spark-one">✦</span>
            <span className="auth-decoration-spark spark-two">✧</span>
          </div>
          <p className="auth-copyright">© 2026 NotifyHub. A little more peace of mind.</p>
        </section>

        <div className="auth-form-wrap">
          <Card className="auth-card">
            <CardHeader className="auth-card-header">
              <div className="auth-mobile-mark"><BellRing size={19} /></div>
              <div className="auth-step-label">{isRegistering ? "GET STARTED" : "WELCOME BACK"}</div>
              <CardTitle>{isRegistering ? "Create your account" : "Sign in to NotifyHub"}</CardTitle>
              <CardDescription>
                {isRegistering
                  ? "It only takes a moment to get your inbox set up."
                  : "Your updates are waiting right where you left them."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="auth-form" onSubmit={handleSubmit}>
                {isRegistering && (
                  <div className="auth-field">
                    <Label htmlFor="auth-name">Your name</Label>
                    <div className="auth-input-wrap">
                      <UserRound size={17} aria-hidden="true" />
                      <Input
                        autoComplete="name"
                        autoFocus
                        id="auth-name"
                        name="name"
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Alex Morgan"
                        required
                        value={name}
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <Label htmlFor="auth-email">Email address</Label>
                  <div className="auth-input-wrap">
                    <Mail size={17} aria-hidden="true" />
                    <Input
                      autoComplete="email"
                      autoFocus={!isRegistering}
                      id="auth-email"
                      name="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="password-label-row">
                    <Label htmlFor="auth-password">Password</Label>
                    {isRegistering && <span className="password-hint">At least 6 characters</span>}
                  </div>
                  <div className="auth-input-wrap">
                    <LockKeyhole size={17} aria-hidden="true" />
                    <Input
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                      id="auth-password"
                      minLength={isRegistering ? 6 : undefined}
                      name="password"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="password-toggle"
                      onClick={() => setShowPassword((visible) => !visible)}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {error && <div className="auth-error" role="alert">{error}</div>}

                <Button className="auth-submit" disabled={submitting} type="submit">
                  <span>{submitting ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}</span>
                  {!submitting && <ArrowRight size={17} />}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="auth-card-footer">
              <span>{isRegistering ? "Already have an account?" : "New to NotifyHub?"}</span>
              <button className="auth-mode-toggle" onClick={changeMode} type="button">
                {isRegistering ? "Sign in" : "Create an account"}
              </button>
            </CardFooter>
          </Card>
          <p className="auth-terms">
            By continuing, you agree to keep your account details safe.
          </p>
        </div>
      </main>
    </div>
  );
}
