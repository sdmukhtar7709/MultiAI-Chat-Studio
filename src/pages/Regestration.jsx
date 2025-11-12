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
      <div className={authStyles.card}>
        <div className={authStyles.header}>
          <img src="/chat-bot.png" alt="logo" className={authStyles.logo} />
          <div className={authStyles.headerText}>
            <h3 className={authStyles.title}>Create your account</h3>
            <p className={authStyles.subtitle}>Start chatting with ChatMinds</p>
          </div>
        </div>

        {error && <div className={authStyles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={authStyles.form}>
          <div className={authStyles.formGroup}>
            <label className={authStyles.label} htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className={authStyles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          <div className={authStyles.row}>
            <button className={authStyles.primary} type="submit">
              Create account
            </button>
            <Link to="/Login" className={authStyles.linkButton}>
              Already have an account?
            </Link>
          </div>

          <p className={authStyles.helper}>
            
          </p>
        </form>
      </div>
    </div>
  );
}
