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
      <div className={authStyles.card}>
        <div className={authStyles.header}>
          <img src="/chat-bot.png" alt="logo" className={authStyles.logo} />
          <div className={authStyles.headerText}>
            <h3 className={authStyles.title}>Welcome back</h3>
            <p className={authStyles.subtitle}>Sign in to continue to ChatMinds</p>
          </div>
        </div>

        {error && <div className={authStyles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={authStyles.form}>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={authStyles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={authStyles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className={authStyles.row}>
            <button className={authStyles.primary} type="submit">
              Sign in
            </button>
            <Link to="/Regestration" className={authStyles.linkButton}>
              Create an account
            </Link>
          </div>

          <p className={authStyles.helper}>
            By signing in you agree to our terms. This demo stores credentials
            locally for testing only.
          </p>
        </form>
      </div>
    </div>
  );
}
