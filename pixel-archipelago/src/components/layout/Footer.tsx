import { footerFlourish, socials } from "../../data/siteContent";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.flourish}>◆ {footerFlourish} ◆</span>
        <nav className={styles.links} aria-label="Social">
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href={socials.deviantart} target="_blank" rel="noopener noreferrer">
            DeviantArt
          </a>
          <a href={`mailto:${socials.email}`}>Email</a>
        </nav>
      </div>
    </footer>
  );
}
