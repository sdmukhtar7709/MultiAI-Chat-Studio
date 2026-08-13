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
      <section className={authStyles.card}>
        <div className={authStyles.header}>
          <div className={authStyles.brand}>
            <img className={authStyles.logo} src="/chatmindd.png" alt="ChatMinds" />
            <span className={authStyles.brandText}>ChatMinds</span>
          </div>
          <h2 className={authStyles.title}>Sign in</h2>
          <p className={authStyles.subtitle}>
            Enter your details to access your workspace.
          </p>
        </div>

        {error && <div className={authStyles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={authStyles.form}>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="email">
              Email address
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
            Sign in
          </button>
        </form>

        <p className={authStyles.secondaryLink}>
          Don&apos;t have an account? <Link to="/Regestration">Create one</Link>
        </p>

      </section>
    </div>
  );
}
