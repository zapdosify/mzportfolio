import { Link, useLocation } from "react-router";
import { useWorldStore } from "../../hooks/useWorldStore";
import { identity } from "../../data/siteContent";
import { categoryByRoute } from "../../data/categories";
import styles from "./Header.module.css";

export default function Header() {
  const location = useLocation();
  const setIndexOpen = useWorldStore((s) => s.setIndexOpen);
  const isLanding = location.pathname === "/";

  const seg = "/" + (location.pathname.split("/")[1] ?? "");
  const category = categoryByRoute(seg);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.identity} aria-label="Home — Mohammed Zaabi Noor">
          <span className={styles.name}>{identity.name}</span>
          <span className={styles.role}>{identity.role}</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {!isLanding && (
            <Link to="/" className={styles.action}>
              <span aria-hidden="true">←</span> Return to World
            </Link>
          )}
          {category && (
            <span className={styles.breadcrumb} aria-hidden="true">
              WORLD / {category.title}
            </span>
          )}
          <button
            type="button"
            className={styles.action}
            onClick={() => setIndexOpen(true)}
          >
            Index <span aria-hidden="true">☰</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
