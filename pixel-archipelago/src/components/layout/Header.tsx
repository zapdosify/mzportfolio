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
          {/* Below 640px the label sheds "Return to" and reads "← World";
              below 430px Index sheds its word and is the glyph alone. Both
              keep their full names for assistive tech via aria-label. */}
          {!isLanding && (
            <Link to="/" className={styles.action} aria-label="Return to world">
              <span aria-hidden="true">←</span>{" "}
              <span className={styles.actionLong}>Return to </span>World
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
            aria-label="Open index"
          >
            <span className={styles.actionWord}>Index </span>
            <span aria-hidden="true">☰</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
