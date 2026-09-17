import { Link, useParams } from "react-router";
import { categoryById } from "../data/categories";
import { projectBySlug, projectById } from "../data/projects";
import Gallery from "../components/gallery/Gallery";
import AmbientVideo from "../components/media/AmbientVideo";
import LoopVideo from "../components/media/LoopVideo";
import VideoEmbed from "../components/media/VideoEmbed";
import StoryScroll from "../components/story/StoryScroll";
import BookScroll from "../components/story/BookScroll";
import ExhibitScroll from "../components/exhibit/ExhibitScroll";
import PlayableGame from "../components/media/PlayableGame";
import GameCaseStudy from "../components/game/GameCaseStudy";
import { manifestoLinks } from "../data/manifestoBook";
import { useInteriorMotion } from "../hooks/useInteriorMotion";
import SplitWords from "../components/motion/SplitWords";
import SectionHead from "../components/motion/SectionHead";
import NotFound from "./NotFound";
import s from "../styles/interior.module.css";

export default function ProjectDetail() {
  const { categoryId, slug } = useParams();
  const project = projectBySlug(categoryId ?? "", slug ?? "");
  const category = categoryById(categoryId ?? "");
  const { rootRef } = useInteriorMotion<HTMLElement>([project?.id]);

  if (!project || !category) return <NotFound />;

  const heading = project.heading ?? { title: project.title, subtitle: project.subtitle };

  const meta: { label: string; value: string }[] = [];
  if (project.details) {
    meta.push(...project.details);
  } else {
    if (project.year) meta.push({ label: "Year", value: project.year });
    if (project.client) meta.push({ label: "Client", value: project.client });
    if (project.context) meta.push({ label: "Context", value: project.context });
    if (project.role) meta.push({ label: "Role", value: project.role });
    if (project.collaborators?.length)
      meta.push({ label: "Collaborators", value: project.collaborators.join(", ") });
    if (project.tools?.length) meta.push({ label: "Tools", value: project.tools.join(" · ") });
  }

  return (
    <article className={`container ${s.page}`} ref={rootRef}>
      <header className={s.hero} style={{ marginBottom: "var(--space-16)" }} data-hero="">
        <div className={s.heroText}>
          <p className={s.breadcrumb} data-hero-line="">
            <Link to={category.route}>WORLD / {category.title}</Link> / {heading.title}
          </p>
          <h1 className={s.title} data-hero-title="">
            <SplitWords text={heading.title} />
          </h1>
          {heading.subtitle && (
            <p className={s.tagline} data-hero-line="">
              {heading.subtitle}
            </p>
          )}
          {project.summary && (
            <p
              className={s.tagline}
              style={{ fontSize: "var(--fs-16)", color: "var(--text-secondary)" }}
              data-hero-line=""
            >
              {project.summary}
            </p>
          )}
          {meta.length > 0 && (
            <div className={s.metaRow} data-hero-line="">
              {meta.map((m) => (
                <div key={m.label} className={s.metaItem}>
                  <span className={s.metaLabel}>{m.label}</span>
                  <span className={s.metaValue}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* A looping title sequence takes the art slot when one exists;
            otherwise the still cover image does. */}
        {project.heroVideo ? (
          <div className={`${s.heroArt} ${s.heroArtVideo}`} data-hero-art="">
            <LoopVideo video={project.heroVideo} />
          </div>
        ) : (
          project.coverImage && (
            <div className={s.heroArt} data-hero-art="">
              <img src={project.coverImage} alt={`${project.title} cover`} />
            </div>
          )
        )}
      </header>

      {/* Looping title sequence, directly under the hero */}
      {project.ambientVideo && <AmbientVideo video={project.ambientVideo} />}

      {/* A game, playable right here, then its case study. The study replaces
          the gallery: every image is already a block inside it. */}
      {project.play && <PlayableGame game={project.play} />}
      {project.gameCaseStudy && <GameCaseStudy study={project.gameCaseStudy} />}

      {project.imageryPending && (
        <p className={s.note} style={{ marginBottom: "var(--space-12)" }}>
          Project imagery for this case is being sourced — the original page was text-led. The
          written case study is complete below.
        </p>
      )}

      {/* Body / write-up */}
      {project.body && project.body.length > 0 && (
        <section className={s.section} aria-labelledby="about-h">
          <SectionHead id="about-h" title="Overview" />
          <div className={s.prose} data-reveal="">
            {project.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* Sub-projects (e.g. Exhibition Design) */}
      {project.subProjects?.map((sub, i) => (
        <section className={s.section} key={i} aria-label={sub.title}>
          <SectionHead title={sub.title} meta={String(i + 1).padStart(2, "0")} />
          <div className={s.prose} data-reveal="">
            {sub.body.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
          </div>
        </section>
      ))}

      {/* Process */}
      {project.process && project.process.length > 0 && (
        <section className={s.section} aria-labelledby="process-h">
          <SectionHead id="process-h" title="Process" />
          <ol className={s.process} data-stagger="">
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

      {/* Externally hosted films (YouTube, click-to-load) */}
      {project.embeds && project.embeds.length > 0 && (
        <section className={s.section} aria-labelledby="film-h">
          <SectionHead
            id="film-h"
            title="Film"
            meta={`${project.embeds.length} film${project.embeds.length === 1 ? "" : "s"}`}
          />
          <div className={s.embedStack} data-stagger="">
            {project.embeds.map((e) => (
              <VideoEmbed key={e.id} embed={e} />
            ))}
          </div>
        </section>
      )}

      {/* Progressive story (publication illustrations + the speech) */}
      {project.story && project.story.length > 0 && (
        <section className={s.section} aria-labelledby="story-h">
          <SectionHead
            id="story-h"
            title="The Publication"
            meta={
              project.storySpreads?.length
                ? `${project.storySpreads.length} spreads · ${project.story.length} chapters`
                : `${project.story.length} chapters`
            }
          />
          <StoryScroll beats={project.story} spreads={project.storySpreads} />
        </section>
      )}

      {/* Videos */}
      {project.videos && project.videos.length > 0 && (
        <section className={s.section} aria-labelledby="video-h">
          <SectionHead
            id="video-h"
            title="Motion"
            meta={`${project.videos.length} film${project.videos.length === 1 ? "" : "s"}`}
          />
          <Gallery items={project.videos} variant="cinema" />
        </section>
      )}

      {/* A printed book, set as real text. Replaces the gallery entirely — the
          artwork spreads and chapter loops are blocks inside it. */}
      {project.book && project.book.length > 0 && (
        <section className={s.section} aria-labelledby="book-h">
          <SectionHead id="book-h" title="The Book" meta="Read in full" />
          <BookScroll blocks={project.book} links={manifestoLinks} />
        </section>
      )}

      {/* A spatial project walked through as a scroll. Like the book, it
          replaces the gallery — every asset is already a scene inside it. */}
      {project.exhibit && project.exhibit.length > 0 && (
        <section className={s.section} aria-labelledby="exhibit-h">
          <SectionHead id="exhibit-h" title="The Exhibition" meta="Walk through" />
          <ExhibitScroll scenes={project.exhibit} />
        </section>
      )}

      {/* Gallery */}
      {!project.book && !project.exhibit && !project.gameCaseStudy && project.gallery && project.gallery.length > 0 && (
        <section className={s.section} aria-labelledby="gallery-h">
          <SectionHead
            id="gallery-h"
            title="Gallery"
            meta={`${project.gallery.length} images`}
          />
          <Gallery
            items={project.gallery}
            variant={
              project.galleryVariant ?? (category.id === "poster-design" ? "posters" : "grid")
            }
          />
        </section>
      )}

      {/* Credits */}
      {project.credits && project.credits.length > 0 && (
        <section className={s.section} aria-labelledby="credits-h">
          <SectionHead id="credits-h" title="Credits" />
          <div className={s.prose} data-reveal="">
            {project.credits.map((c, i) => (
              <p key={i}>{c}</p>
            ))}
          </div>
        </section>
      )}

      {/* External links */}
      {project.externalLinks && project.externalLinks.length > 0 && (
        <section className={s.section} aria-labelledby="links-h">
          <SectionHead id="links-h" title="Links" />
          <div className={s.related} data-stagger="">
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
          <SectionHead id="related-h" title="Related Projects" />
          <div className={s.related} data-stagger="">
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
        {/* On a game page the heroine can walk here and use these too. */}
        <Link
          to={category.route}
          className={s.returnBtn}
          data-magnetic=""
          data-ilva-interact={project.play ? `Back to ${category.title}` : undefined}
        >
          ← Back to {category.title}
        </Link>
        <Link
          to="/"
          className={s.returnBtn}
          data-magnetic=""
          data-ilva-interact={project.play ? "Return to world" : undefined}
        >
          Return to World
        </Link>
      </div>
    </article>
  );
}
