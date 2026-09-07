import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { categoryById, categoryByRoute } from "../data/categories";
import { projectsByCategory } from "../data/projects";
import { useWorldStore } from "../hooks/useWorldStore";
import { useHeroReveal } from "../hooks/useHeroReveal";
import { useStaggerReveal } from "../hooks/useStaggerReveal";
import ProjectCard from "../components/project/ProjectCard";
import CategoryBanner from "../components/layout/CategoryBanner";
import NotFound from "./NotFound";
import s from "../styles/interior.module.css";
import grid from "../components/gallery/Gallery.module.css";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const category = categoryById(categoryId ?? "") ?? categoryByRoute(`/${categoryId}`);
  const markExplored = useWorldStore((st) => st.markExplored);
  const setLastCategory = useWorldStore((st) => st.setLastCategory);
  const heroRef = useHeroReveal([category?.id]);
  const worksRef = useStaggerReveal<HTMLDivElement>([category?.id]);

  useEffect(() => {
    if (category) {
      markExplored(category.id);
      setLastCategory(category.id);
    }
  }, [category, markExplored, setLastCategory]);

  if (!category) return <NotFound />;
  if (category.kind === "page") {
    // About/Contact have dedicated routes; guard just in case.
    return <NotFound />;
  }

  // Every project sits under Selected Works — there is no archive here.
  // Featured ones lead, the rest follow in their original order.
  const projects = projectsByCategory(category.id);
  const selected = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];

  return (
    <>
      {/* Landmark art as a full-bleed parallax banner behind the page head */}
      <CategoryBanner src={category.landmarkImage} />

      <div className={`container ${s.page} ${s.hasBanner}`}>
      {/* Hero */}
      <header className={`${s.hero} ${s.heroBanner}`}>
        <div className={s.heroText} ref={heroRef}>
          <p className={s.breadcrumb}>WORLD / {category.title}</p>
          <h1 className={s.title}>{category.title}</h1>
          {category.tagline && <p className={s.tagline}>{category.tagline}</p>}
          <div className={s.metaRow}>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Projects</span>
              <span className={s.metaValue}>{projects.length}</span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Island</span>
              <span className={s.metaValue}>№ {String(category.index).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Selected Works */}
      <section className={s.section} aria-labelledby="works-h">
        <div className={s.sectionHead}>
          <h2 id="works-h" className={s.sectionTitle}>Selected Works</h2>
          <span className={s.sectionMeta}>{projects.length} project{projects.length === 1 ? "" : "s"}</span>
        </div>
        <p className={s.tagline} style={{ marginBottom: "var(--space-8)", maxWidth: "60ch" }}>
          {category.description}
        </p>
        <div className={`${grid.gallery} ${grid.grid}`} ref={worksRef}>
          {selected.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      {/* Related + Return */}
      {category.relatedCategoryIds && category.relatedCategoryIds.length > 0 && (
        <section className={s.section} aria-labelledby="related-h">
          <div className={s.sectionHead}>
            <h2 id="related-h" className={s.sectionTitle}>Related Work</h2>
          </div>
          <div className={s.related}>
            {category.relatedCategoryIds.map((rid) => {
              const rc = categoryById(rid);
              if (!rc) return null;
              return (
                <Link key={rid} to={rc.route} className={s.chip}>
                  {rc.title} →
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className={s.returnStrip}>
        <Link to="/" className={s.returnBtn}>← Return to World</Link>
      </div>
      </div>
    </>
  );
}
