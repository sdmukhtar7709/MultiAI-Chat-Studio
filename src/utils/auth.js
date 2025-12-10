import { v4 as uuidv4 } from "uuid";

// Storage keys for localStorage
const USERS_KEY = "chatgen_users";
const SESSION_KEY = "chatgen_session";

/**
 * Read all registered users from localStorage
 * @returns {Array} Array of user objects
 */
function _readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save users array to localStorage
 * @param {Array} users - Array of user objects to save
 */
function _writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Register a new user
 * @param {Object} userData - User data { name, email, password }
 * @returns {Object} The created user object
 * @throws {Error} If user with email already exists
 */
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

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object|null} Session object if successful, null if failed
 */
export function loginUser(email, password) {
  const users = _readUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return null;

  const session = { token: uuidv4(), id: user.id, email: user.email, name: user.name };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

/**
 * Logout current user by removing session from localStorage
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Get current login session
 * @returns {Object|null} Session object or null if not logged in
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is currently authenticated
 * @returns {boolean} True if logged in, false otherwise
 */
export function isAuthenticated() {
  return Boolean(getCurrentSession());
}

/**
 * Get full user data for currently logged in user
 * @returns {Object|null} User object or null if not logged in
 */
export function getCurrentUser() {
  const session = getCurrentSession();
  if (!session) return null;
  const users = _readUsers();
  return users.find((u) => u.id === session.id) || null;
}
