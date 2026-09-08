import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { categoryById, categoryByRoute } from "../data/categories";
import { projectsByCategory } from "../data/projects";
import { useWorldStore } from "../hooks/useWorldStore";
import { useInteriorMotion } from "../hooks/useInteriorMotion";
import SplitWords from "../components/motion/SplitWords";
import SectionHead from "../components/motion/SectionHead";
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
  /* No pointer tilt on the cards. ProjectCard already owns its own hover
     transform in CSS (a 3px lift on a 0.16s transition); a GSAP tilt on the
     same element makes two systems write `transform`, and the entrance
     stagger gets stranded mid-tween between them. The authored hover stays. */
  const { rootRef } = useInteriorMotion<HTMLDivElement>([category?.id]);

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

      <div className={`container ${s.page} ${s.hasBanner}`} ref={rootRef}>
      {/* Hero */}
      <header className={`${s.hero} ${s.heroBanner}`} data-hero="">
        <div className={s.heroText}>
          <p className={s.breadcrumb} data-hero-line="">WORLD / {category.title}</p>
          <h1 className={s.title} data-hero-title="">
            <SplitWords text={category.title} />
          </h1>
          {category.tagline && (
            <p className={s.tagline} data-hero-line="">
              {category.tagline}
            </p>
          )}
          <div className={s.metaRow} data-hero-line="">
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
        <SectionHead
          id="works-h"
          title="Selected Works"
          meta={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
        />
        <p
          className={s.tagline}
          style={{ marginBottom: "var(--space-8)", maxWidth: "60ch" }}
          data-reveal=""
        >
          {category.description}
        </p>
        <div className={`${grid.gallery} ${grid.grid}`} data-stagger="">
          {selected.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>

      {/* Related + Return */}
      {category.relatedCategoryIds && category.relatedCategoryIds.length > 0 && (
        <section className={s.section} aria-labelledby="related-h">
          <SectionHead id="related-h" title="Related Work" />
          <div className={s.related} data-stagger="">
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
        <Link to="/" className={s.returnBtn} data-magnetic="">← Return to World</Link>
      </div>
      </div>
    </>
  );
}
