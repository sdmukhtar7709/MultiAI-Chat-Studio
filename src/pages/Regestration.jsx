import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authStyles from "./Auth.module.css";
import { registerUser } from "../utils/auth";

export default function Regestration() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      registerUser({ name: name.trim(), email: email.trim(), password });
      navigate("/Login");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  }

  return (
    <div className={authStyles.container}>
      <span className={authStyles.glow} />
      <span className={authStyles.glow} />

      <section className={authStyles.card}>
        <h2 className={authStyles.title}>Launch your ChatMinds workspace</h2>
        <p className={authStyles.subtitle}>
          Invite your favorite models, save reusable instructions, and keep teammates in sync.
        </p>

        {error && <div className={authStyles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={authStyles.form}>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="name">
              Full name
            </label>
            <div className={authStyles.inputWrapper}>
              <span className={authStyles.inputIcon}>👤</span>
              <input
                id="name"
                className={authStyles.input}
                type="text"
                placeholder="muktar sayyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="email">
              Email
            </label>
            <div className={authStyles.inputWrapper}>
              <span className={authStyles.inputIcon}>@</span>
              <input
                id="email"
                className={authStyles.input}
                type="email"
                placeholder="you@space.com"
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
                autoComplete="new-password"
              />
            </div>
          </div>

          <button className={authStyles.primary} type="submit">
            Create account
          </button>
        </form>

        <p className={authStyles.secondaryLink}>
          Already have an account? <Link to="/Login">Sign in</Link>
        </p>

        <p className={authStyles.helper}>
          Onboarding takes less than a minute. We only store your sample data locally.
        </p>
      </section>
    </div>
  );
}
