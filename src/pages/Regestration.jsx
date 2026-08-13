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
      <section className={authStyles.card}>
        <div className={authStyles.header}>
          <div className={authStyles.brand}>
            <img className={authStyles.logo} src="/chatmindd.png" alt="ChatMinds" />
            <span className={authStyles.brandText}>ChatMinds</span>
          </div>
          <h2 className={authStyles.title}>Create your account</h2>
          <p className={authStyles.subtitle}>
            Set up your workspace and start chatting with your favorite AI models.
          </p>
        </div>

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
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

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
          Your data is stored locally for demo purposes.
        </p>
      </section>
    </div>
  );
}
