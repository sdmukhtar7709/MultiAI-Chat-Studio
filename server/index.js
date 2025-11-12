import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Simple in-memory user store (demo only)
const users = new Map(); // username -> { id, username, passwordHash }

const JWT_SECRET = process.env.AUTH_JWT_SECRET || "dev_secret_key";
const PORT = process.env.PORT || 4001;

const app = express();
app.use(cors());
app.use(express.json());

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Register: { username, password }
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const key = username.toLowerCase();
  if (users.has(key)) return res.status(409).json({ error: "user_exists" });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  users.set(key, { id, username, passwordHash: hash });

  const token = signToken({ id, username });
  return res.json({ token, user: { id, username } });
});

// Login: { username, password }
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password required" });
  const key = username.toLowerCase();
  const user = users.get(key);
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = signToken({ id: user.id, username: user.username });
  return res.json({ token, user: { id: user.id, username: user.username } });
});

// Protected route to get current user from Authorization: Bearer <token>
app.get("/api/me", (req, res) => {
  const auth = req.headers.authorization || "";
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ error: "no_token" });
  const payload = verifyToken(parts[1]);
  if (!payload) return res.status(401).json({ error: "invalid_token" });
  return res.json({ user: { id: payload.id, username: payload.username } });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
