import { useEffect } from "react";
import { Link } from "react-router";
import { about, identity } from "../data/siteContent";
import { categoryById } from "../data/categories";
import { useWorldStore } from "../hooks/useWorldStore";
import { useInteriorMotion } from "../hooks/useInteriorMotion";
import SplitWords from "../components/motion/SplitWords";
import SectionHead from "../components/motion/SectionHead";
import CategoryBanner from "../components/layout/CategoryBanner";
import s from "../styles/interior.module.css";

export default function About() {
  const markExplored = useWorldStore((st) => st.markExplored);
  const category = categoryById("about");
  const { rootRef } = useInteriorMotion<HTMLDivElement>();
  useEffect(() => {
    markExplored("about");
  }, [markExplored]);

  return (
    <>
      {category && <CategoryBanner src={category.landmarkImage} />}

      <div className={`container ${s.page} ${s.hasBanner}`} ref={rootRef}>
      {/* Hero: avatar + intro — the avatar stays; it is the person, not the island */}
      <header className={s.hero} style={{ marginBottom: "var(--space-16)" }} data-hero="">
        <div className={s.heroText}>
          <p className={s.breadcrumb} data-hero-line="">WORLD / About</p>
          <h1 className={s.title} data-hero-title="">
            <SplitWords text="About" />
          </h1>
          <p className={s.tagline} data-hero-line="">{about.bio}</p>
          <div className={s.metaRow} data-hero-line="">
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Based in</span>
              <span className={s.metaValue}>{about.location}</span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Email</span>
              <span className={s.metaValue}>mznoor@asu.edu</span>
            </div>
          </div>
          {about.resumeFile && (
            <p style={{ marginTop: "var(--space-6)" }} data-hero-line="">
              <a href={about.resumeFile} download className={s.returnBtn} data-magnetic="">
                Download résumé ↓
              </a>
            </p>
          )}
        </div>

        <div className={s.portrait} data-hero-art="">
          <img
            src={about.portraitImage}
            alt="Pixel-art avatar of Mohammed Zaabi Noor: a figure in a suit wearing an astronaut helmet, against a starfield"
            className={s.portraitImg}
          />
        </div>
      </header>

      {/* Introduction */}
      <section className={s.section}>
        <SectionHead title="Introduction" />
        <div className={s.prose} data-reveal="">
          <p>{identity.intro}</p>
        </div>
      </section>

      {/* Experience timeline */}
      <section className={s.section} aria-labelledby="exp-h">
        <SectionHead id="exp-h" title="Experience" meta={`${about.experience.length} roles`} />
        <ol className={s.timeline} data-stagger="">
          {about.experience.map((e) => (
            <li key={e.role + e.period} className={s.titem}>
              <span className={`${s.tNode} ${e.current ? s.tNodeNow : ""}`} aria-hidden="true" />
              <p className={s.tPeriod}>{e.period}</p>
              <h3 className={s.tRole}>{e.role}</h3>
              <p className={s.tOrg}>
                {e.org} <span className={s.tLoc}>· {e.location}</span>
              </p>
              <ul className={s.tPoints}>
                {e.points.map((pt, i) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {/* Education timeline */}
      <section className={s.section} aria-labelledby="edu-h">
        <SectionHead id="edu-h" title="Education" meta={String(about.education.length)} />
        <ol className={s.timeline} data-stagger="">
          {about.education.map((ed) => (
            <li key={ed.school} className={s.titem}>
              <span className={s.tNode} aria-hidden="true" />
              <p className={s.tPeriod}>{ed.period}</p>
              <h3 className={s.tRole}>{ed.school}</h3>
              <p className={s.tOrg}>{ed.degree}</p>
              {ed.note && <p className={s.tLoc} style={{ marginTop: "var(--space-2)" }}>{ed.note}</p>}
            </li>
          ))}
        </ol>
      </section>

      {/* Capabilities + Technical skills */}
      <div className={s.aboutCols}>
        <section className={s.section} style={{ marginBottom: 0 }}>
          <SectionHead title="Design Services" />
          <ul className={s.tagList} data-stagger="">
            {about.services.map((sv) => (
              <li key={sv} className={s.tag}>{sv}</li>
            ))}
          </ul>
        </section>

        <section className={s.section} style={{ marginBottom: 0 }}>
          <SectionHead title="Technical Skills" />
          <ul style={{ listStyle: "none", display: "grid", gap: "var(--space-4)" }}>
            {about.skills.map((sk) => (
              <li key={sk.group}>
                <p className={s.tLoc}>{sk.group}</p>
                <p style={{ color: "var(--text-secondary)", fontSize: "var(--fs-14)", marginTop: 2 }}>{sk.items}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recognition — award card links out to the DMU article */}
      <section className={s.section} style={{ marginTop: "var(--space-24)" }} aria-labelledby="rec-h">
        <SectionHead id="rec-h" title="Recognition" />
        <ul style={{ listStyle: "none", display: "grid", gap: "var(--space-4)" }}>
          {about.publicity.map((p) => {
            const inner = (
              <>
                <span className={s.awardYear}>{p.year}</span>
                <div>
                  <h3 className={s.processTitle}>
                    {p.title} {p.href && <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>↗</span>}
                  </h3>
                  <p className={s.processDesc}>{p.detail}</p>
                </div>
              </>
            );
            return p.href ? (
              <li key={p.year}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.processStep} ${s.awardLink}`}
                  style={{ gridTemplateColumns: "auto 1fr", display: "grid" }}
                  aria-label={`${p.title} — opens the De Montfort University article in a new tab`}
                >
                  {inner}
                </a>
              </li>
            ) : (
              <li key={p.year} className={s.processStep} style={{ gridTemplateColumns: "auto 1fr", display: "grid" }}>
                {inner}
              </li>
            );
          })}
        </ul>
      </section>

      <div className={s.returnStrip}>
        <Link to="/contact" className={s.returnBtn} data-magnetic="">Get in touch →</Link>
        <Link to="/" className={s.returnBtn} data-magnetic="">Return to World</Link>
      </div>
      </div>
    </>
  );
}
