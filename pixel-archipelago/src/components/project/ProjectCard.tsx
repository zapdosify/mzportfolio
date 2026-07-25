import { Link } from "react-router-dom";
import type { Project } from "../../data/types";
import styles from "./ProjectCard.module.css";

export default function ProjectCard({ project }: { project: Project }) {
  const cover =
    project.cardImage ??
    project.coverImage ??
    project.gallery?.[0]?.src ??
    project.videos?.[0]?.poster;
  const contain = project.cardImageFit === "contain";
  return (
    <Link to={`/${project.categoryId}/${project.slug}`} className={styles.card}>
      <div className={`${styles.thumb} ${contain ? styles.thumbContain : ""}`}>
        {cover ? (
          <img src={cover} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">◇</div>
        )}
      </div>
      <div className={styles.meta}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{project.title}</span>
          {project.year && <span className={styles.year}>{project.year}</span>}
        </div>
        {project.subtitle && <span className={styles.subtitle}>{project.subtitle}</span>}
        {project.role && <span className={styles.role}>{project.role}</span>}
        <span className={styles.enter} aria-hidden="true">View →</span>
      </div>
    </Link>
  );
}
