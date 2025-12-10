import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authStyles from "./Auth.module.css";
import { loginUser } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const session = loginUser(email.trim(), password);
    if (!session) {
      setError("Invalid email or password");
      return;
    }
    navigate("/");
  }

  return (
    <div className={authStyles.container}>
      <span className={authStyles.glow} />
      <span className={authStyles.glow} />

      <section className={authStyles.card}>
        <h2 className={authStyles.title}>Sign in to Your Account</h2>
        <p className={authStyles.subtitle}>
          Enter your login details to access your dashboard.
        </p>

        {error && <div className={authStyles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={authStyles.form}>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="email">
              Email Address
            </label>
            <div className={authStyles.inputWrapper}>
              <span className={authStyles.inputIcon}>@</span>
              <input
                id="email"
                className={authStyles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="password">
              Password
            </label>
            <div className={authStyles.inputWrapper}>
              <span className={authStyles.inputIcon}>🔒</span>
              <input
                id="password"
                className={authStyles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className={authStyles.actions}>
            <label className={authStyles.remember}>
              <input type="checkbox" defaultChecked />
              Remember me
            </label>
            <button type="button" className={authStyles.ghostButton}>
              Forgot password?
            </button>
          </div>

          <button className={authStyles.primary} type="submit">
            Login
          </button>
        </form>

        <p className={authStyles.secondaryLink}>
          Don&apos;t have an account? <Link to="/Regestration">Register</Link>
        </p>

        <p className={authStyles.helper}>
          Demo mode: Your credentials are saved locally and can be reset anytime.
        </p>
      </section>
    </div>
  );
}
