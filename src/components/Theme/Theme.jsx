import { useEffect, useState } from "react";
import styles from "./Theme.module.css";

export function Theme() {
  // Persisted theme; default to dark unless user chose light previously
  const [isLight, setIsLight] = useState(() => {
    try {
      return localStorage.getItem("theme") === "light";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const scheme = isLight ? "light" : "dark";
    // Reflect to CSS color-scheme for light-dark() colors
    try {
      document.documentElement.style.colorScheme = scheme;
    } catch {}
    // Keep meta tag in sync for UA widgets
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute("content", scheme);
    // Persist
    try {
      localStorage.setItem("theme", scheme);
    } catch {}
  }, [isLight]);

  return (
    <div className={styles.Theme}>
      <label className={styles.Switch} aria-label="Toggle light theme">
        <input
          className={styles.Input}
          type="checkbox"
          checked={isLight}
          onChange={(e) => setIsLight(e.target.checked)}
        />
        <span className={styles.Track} data-checked={isLight} />
      </label>
    </div>
  );
}
