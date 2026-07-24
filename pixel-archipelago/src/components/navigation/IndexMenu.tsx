import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWorldStore } from "../../hooks/useWorldStore";
import { categories } from "../../data/categories";
import { projects } from "../../data/projects";
import styles from "./IndexMenu.module.css";

export default function IndexMenu() {
  const open = useWorldStore((s) => s.indexOpen);
  const setOpen = useWorldStore((s) => s.setIndexOpen);
  const soundOn = useWorldStore((s) => s.soundOn);
  const toggleSound = useWorldStore((s) => s.toggleSound);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return projects
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.subtitle ?? "").toLowerCase().includes(q) ||
          (p.summary ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query]);

  if (!open) return null;

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Index">
      <button
        type="button"
        className={styles.scrim}
        aria-label="Close index"
        onClick={() => setOpen(false)}
      />
      <div className={styles.panel}>
        <div className={styles.head}>
          <span className={styles.title}>Index</span>
          <button type="button" className={styles.close} onClick={() => setOpen(false)}>
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>

        <label className={styles.searchWrap}>
          <span className="sr-only">Search projects</span>
          <input
            className={styles.search}
            type="search"
            placeholder="SEARCH PROJECTS…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </label>

        {results.length > 0 && (
          <ul className={styles.results}>
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => go(`/${p.categoryId}/${p.slug}`)}
                  className={styles.result}
                >
                  <span>{p.title}</span>
                  <span className={styles.resultCat}>{p.categoryId.replace(/-/g, " ")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <nav aria-label="All destinations">
          <ol className={styles.list}>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={c.route} className={styles.item} onClick={() => setOpen(false)}>
                  <span className={styles.num}>{String(c.index).padStart(2, "0")}</span>
                  <span className={styles.label}>{c.title}</span>
                  <span className={styles.arrow} aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.controls}>
          <Link to="/" className={styles.control} onClick={() => setOpen(false)}>
            Return to World
          </Link>
          <button type="button" className={styles.control} onClick={toggleSound}>
            Sound: {soundOn ? "On" : "Off"}
          </button>
        </div>
      </div>
    </div>
  );
}
