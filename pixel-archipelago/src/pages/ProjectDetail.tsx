import { Link, useParams } from "react-router-dom";
import { categoryById } from "../data/categories";
import { projectBySlug, projectById } from "../data/projects";
import Gallery from "../components/gallery/Gallery";
import { useHeroReveal } from "../hooks/useHeroReveal";
import NotFound from "./NotFound";
import s from "../styles/interior.module.css";

export default function ProjectDetail() {
  const { categoryId, slug } = useParams();
  const project = projectBySlug(categoryId ?? "", slug ?? "");
  const category = categoryById(categoryId ?? "");
  const heroRef = useHeroReveal([project?.id]);

  if (!project || !category) return <NotFound />;

  const meta: { label: string; value: string }[] = [];
  if (project.year) meta.push({ label: "Year", value: project.year });
  if (project.client) meta.push({ label: "Client", value: project.client });
  if (project.context) meta.push({ label: "Context", value: project.context });
  if (project.role) meta.push({ label: "Role", value: project.role });
  if (project.collaborators?.length)
    meta.push({ label: "Collaborators", value: project.collaborators.join(", ") });
  if (project.tools?.length) meta.push({ label: "Tools", value: project.tools.join(" · ") });

  return (
    <article className={`container ${s.page}`}>
      <header className={s.hero} style={{ marginBottom: "var(--space-16)" }}>
        <div className={s.heroText} ref={heroRef}>
          <p className={s.breadcrumb}>
            <Link to={category.route}>WORLD / {category.title}</Link> / {project.title}
          </p>
          <h1 className={s.title}>{project.title}</h1>
          {project.subtitle && <p className={s.tagline}>{project.subtitle}</p>}
          {project.summary && (
            <p className={s.tagline} style={{ fontSize: "var(--fs-16)", color: "var(--text-secondary)" }}>
              {project.summary}
            </p>
          )}
          {meta.length > 0 && (
            <div className={s.metaRow}>
              {meta.map((m) => (
                <div key={m.label} className={s.metaItem}>
                  <span className={s.metaLabel}>{m.label}</span>
                  <span className={s.metaValue}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {project.coverImage && (
          <div className={s.heroArt}>
            <img src={project.coverImage} alt={`${project.title} cover`} />
          </div>
        )}
      </header>

      {project.imageryPending && (
        <p className={s.note} style={{ marginBottom: "var(--space-12)" }}>
          Project imagery for this case is being sourced — the original page was text-led. The
          written case study is complete below.
        </p>
      )}

      {/* Body / write-up */}
      {project.body && project.body.length > 0 && (
        <section className={s.section} aria-labelledby="about-h">
          <div className={s.sectionHead}>
            <h2 id="about-h" className={s.sectionTitle}>Overview</h2>
          </div>
          <div className={s.prose}>
            {project.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* Sub-projects (e.g. Exhibition Design) */}
      {project.subProjects?.map((sub, i) => (
        <section className={s.section} key={i} aria-label={sub.title}>
          <div className={s.sectionHead}>
            <h2 className={s.sectionTitle}>{sub.title}</h2>
            <span className={s.sectionMeta}>{String(i + 1).padStart(2, "0")}</span>
          </div>
          <div className={s.prose}>
            {sub.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {/* Process */}
      {project.process && project.process.length > 0 && (
        <section className={s.section} aria-labelledby="process-h">
          <div className={s.sectionHead}>
            <h2 id="process-h" className={s.sectionTitle}>Process</h2>
          </div>
          <ol className={s.process}>
            {project.process.map((stage, i) => (
              <li key={i} className={s.processStep}>
                <span className={s.processNum} aria-hidden="true" />
                <div>
                  <h3 className={s.processTitle}>{stage.title}</h3>
                  {stage.description && <p className={s.processDesc}>{stage.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Videos */}
      {project.videos && project.videos.length > 0 && (
        <section className={s.section} aria-labelledby="video-h">
          <div className={s.sectionHead}>
            <h2 id="video-h" className={s.sectionTitle}>Motion</h2>
            <span className={s.sectionMeta}>{project.videos.length} film{project.videos.length === 1 ? "" : "s"}</span>
          </div>
          <Gallery items={project.videos} variant="cinema" />
        </section>
      )}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section className={s.section} aria-labelledby="gallery-h">
          <div className={s.sectionHead}>
            <h2 id="gallery-h" className={s.sectionTitle}>Gallery</h2>
            <span className={s.sectionMeta}>{project.gallery.length} images</span>
          </div>
          <Gallery
            items={project.gallery}
            variant={category.id === "poster-design" ? "posters" : "grid"}
          />
        </section>
      )}

      {/* Credits */}
      {project.credits && project.credits.length > 0 && (
        <section className={s.section} aria-labelledby="credits-h">
          <div className={s.sectionHead}>
            <h2 id="credits-h" className={s.sectionTitle}>Credits</h2>
          </div>
          <div className={s.prose}>
            {project.credits.map((c, i) => (
              <p key={i}>{c}</p>
            ))}
          </div>
        </section>
      )}

      {/* External links */}
      {project.externalLinks && project.externalLinks.length > 0 && (
        <section className={s.section} aria-labelledby="links-h">
          <div className={s.sectionHead}>
            <h2 id="links-h" className={s.sectionTitle}>Links</h2>
          </div>
          <div className={s.related}>
            {project.externalLinks.map((l, i) =>
              l.href ? (
                <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" className={s.chip}>
                  {l.label} ↗
                </a>
              ) : (
                <span key={i} className={s.chip} title={l.note} style={{ opacity: 0.6 }}>
                  {l.label} — unavailable
                </span>
              ),
            )}
          </div>
        </section>
      )}

      {/* Related projects */}
      {project.relatedProjectIds && project.relatedProjectIds.length > 0 && (
        <section className={s.section} aria-labelledby="related-h">
          <div className={s.sectionHead}>
            <h2 id="related-h" className={s.sectionTitle}>Related Projects</h2>
          </div>
          <div className={s.related}>
            {project.relatedProjectIds.map((rid) => {
              const rp = projectById(rid);
              if (!rp) return null;
              return (
                <Link key={rid} to={`/${rp.categoryId}/${rp.slug}`} className={s.chip}>
                  {rp.title} →
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className={s.returnStrip}>
        <Link to={category.route} className={s.returnBtn}>← Back to {category.title}</Link>
        <Link to="/" className={s.returnBtn}>Return to World</Link>
      </div>
    </article>
  );
}
