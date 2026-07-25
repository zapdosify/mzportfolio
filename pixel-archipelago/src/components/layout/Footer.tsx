import { footerFlourish, socials } from "../../data/siteContent";
import { useWorldStore } from "../../hooks/useWorldStore";
import styles from "./Footer.module.css";

export default function Footer() {
  const setContactOpen = useWorldStore((s) => s.setContactOpen);
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.flourish}>◆ {footerFlourish} ◆</span>
        <nav className={styles.links} aria-label="Social">
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={socials.deviantart} target="_blank" rel="noopener noreferrer">
            DeviantArt
          </a>
          <button type="button" className={styles.linkBtn} onClick={() => setContactOpen(true)}>
            Email
          </button>
        </nav>
      </div>
    </footer>
  );
}
