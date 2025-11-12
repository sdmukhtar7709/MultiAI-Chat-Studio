import { v4 as uuidv4 } from "uuid";

const USERS_KEY = "chatgen_users";
const SESSION_KEY = "chatgen_session";

function _readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function _writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser({ name, email, password }) {
  const users = _readUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("User already exists");
  }
  const user = { id: uuidv4(), name, email, password };
  users.push(user);
  _writeUsers(users);
  return user;
}

export function loginUser(email, password) {
  const users = _readUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return null;

  const session = { token: uuidv4(), id: user.id, email: user.email, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getCurrentSession());
}

export function getCurrentUser() {
  const session = getCurrentSession();
  if (!session) return null;
  const users = _readUsers();
  return users.find((u) => u.id === session.id) || null;
}
