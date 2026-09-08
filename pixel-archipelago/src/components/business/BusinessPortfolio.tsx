import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { identity, socials, about } from "../../data/siteContent";
import {
  businessCopy,
  businessProjects,
  credentials,
  fieldTerms,
} from "../../data/businessContent";
import { useWorldStore } from "../../hooks/useWorldStore";
import { useModeStore } from "../../hooks/useModeStore";
import { useLenis } from "../../hooks/useLenis";
import { scrollToInstant, smoothScrollTo } from "../../hooks/lenisInstance";
import { useMagnetic } from "../../hooks/useMagnetic";
import WordField from "./WordField";
import Cover from "./Covers";
import SplitWords from "./SplitWords";
import BusinessCaseStudy from "./BusinessCaseStudy";
import type { BusinessProject } from "../../data/businessContent";
import styles from "./BusinessPortfolio.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Abstract badge mark — drawn until an entry sets a real badge image. */
function BadgeMark() {
  return (
    <svg viewBox="0 0 100 100" className={styles.badgeMark} aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.35" />
      <circle
        cx="50"
        cy="50"
        r="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeDasharray="3 6"
        opacity="0.3"
      />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" opacity="0.22" />
    </svg>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 24 12" className={styles.ctaArrow} aria-hidden="true" focusable="false">
    <path d="M0 6h21M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** The four labelled fields shown on every project card. */
function ProjectFields({ p }: { p: BusinessProject }) {
  return (
    <dl className={styles.fields}>
      <div className={styles.field}>
        <dt>Business question</dt>
        <dd className={styles.ph}>{p.question}</dd>
      </div>
      <div className={styles.field}>
        <dt>Summary</dt>
        <dd className={styles.ph}>{p.summary}</dd>
      </div>
      <div className={styles.field}>
        <dt>Methods &amp; tools</dt>
        <dd>
          <span className={styles.chips}>
            {p.methods.map((m) => (
              <span key={m} className={styles.chip}>
                {m}
              </span>
            ))}
          </span>
        </dd>
      </div>
      <div className={styles.field}>
        <dt>Key insight</dt>
        <dd className={styles.ph}>{p.outcome}</dd>
      </div>
    </dl>
  );
}

function ProjectCover({ p, feature }: { p: BusinessProject; feature?: boolean }) {
  return (
    <div className={`${styles.cover} ${feature ? styles.coverFeature : ""}`}>
      {/* The art is oversized inside a clipped frame so it can drift against
          the scroll without ever exposing an edge. */}
      <div className={styles.coverInner} data-parallax="">
        {p.image ? (
          <img
            src={p.image}
            alt=""
            className={styles.coverImg}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Cover kind={p.cover} className={styles.coverSvg} />
        )}
      </div>
      <span className={styles.coverIndex} aria-hidden="true">
        {p.index}
      </span>
    </div>
  );
}

function CaseLink({
  p,
  onOpen,
}: {
  p: BusinessProject;
  onOpen: (slug: string) => void;
}) {
  if (p.caseStudy?.sections.length) {
    return (
      <button type="button" className={styles.caseLink} onClick={() => onOpen(p.slug)}>
        Read the case study
        <Arrow />
      </button>
    );
  }
  if (p.href) {
    return (
      <a className={styles.caseLink} href={p.href}>
        Read the case study
        <Arrow />
      </a>
    );
  }
  return (
    <span className={styles.caseLinkOff} aria-disabled="true">
      Details coming soon
    </span>
  );
}

export default function BusinessPortfolio() {
  const storeRM = useWorldStore((s) => s.reducedMotion);
  const mode = useModeStore((s) => s.mode);
  const target = useModeStore((s) => s.target);
  const switching = useModeStore((s) => s.switching);

  const reducedMotion = useMemo(
    () =>
      storeRM ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    [storeRM],
  );

  const [fieldPaused, setFieldPaused] = useState(false);
  const projectsRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /* The site's only smooth-scroll engine, alive exactly as long as business
     mode is. It covers the case-study view too — that is the same document
     scroll, so handing it back to the browser mid-mode would be felt. */
  useLenis(mode === "business", reducedMotion);

  const ctaRef = useMagnetic<HTMLAnchorElement>(reducedMotion);

  /* Case-study reader. Business mode is not routed, so this is a state view
     shown in place of the homepage. A history entry is pushed (URL kept
     identical) so the browser Back button closes it, and the homepage
     scroll position is restored on the way out. */
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const returnScroll = useRef(0);
  const openProject = openSlug
    ? businessProjects.find((p) => p.slug === openSlug) ?? null
    : null;

  /* Set from the click handler (not an effect, so StrictMode can't muddle it).
     Once a study has been opened, the homepage sections remount on the way
     back and are simply shown, not re-animated. */
  const hasOpenedCase = useRef(false);

  const openCase = useCallback((slug: string) => {
    hasOpenedCase.current = true;
    returnScroll.current = window.scrollY;
    setOpenSlug(slug);
    try {
      history.pushState({ ...history.state, bizCase: slug }, "");
    } catch {
      /* history unavailable — the in-page view still works */
    }
  }, []);

  const closeCase = useCallback(() => {
    if (typeof history !== "undefined" && history.state?.bizCase) {
      history.back(); // -> popstate -> setOpenSlug(null)
    } else {
      setOpenSlug(null);
    }
  }, []);

  useEffect(() => {
    const onPop = () => {
      const slug =
        (history.state && (history.state as { bizCase?: string }).bizCase) || null;
      setOpenSlug(slug);
      if (!slug) {
        requestAnimationFrame(() => scrollToInstant(returnScroll.current));
      }
    };
    // A reload with a study open keeps its history entry; restore that view so
    // the page and the Back button stay in agreement.
    if ((history.state as { bizCase?: string })?.bizCase) onPop();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Leaving business mode with a study open: drop it (and its history entry).
  useEffect(() => {
    if (mode !== "business" && openSlug) closeCase();
  }, [mode, openSlug, closeCase]);

  /* The slight positional half of the mode transition lives here, on the
     content, rather than on a wrapper: a transform on an ancestor would
     re-anchor the fixed header and the mode switch, and those must not move. */
  const shift =
    switching && mode === target
      ? styles.enterUp
      : switching && mode !== target
        ? styles.leaveUp
        : "";

  const toProjects = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      // Routed through Lenis: a native smooth scroll and the engine's own
      // loop would otherwise animate the same document at once.
      if (projectsRef.current) smoothScrollTo(projectsRef.current, reducedMotion);
    },
    [reducedMotion],
  );

  /* Choreography.
     Every tween is a `from`, so the DOM's resting state IS the finished page
     — if this effect never runs the site still reads, just without motion.
     The entrance is skipped on the return trip from a case study (the
     sections are already in place and replaying them reads as a glitch),
     but the parallax is not: it is a continuous effect, not an entrance. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || openSlug || reducedMotion) return;
    const skipEntrance = hasOpenedCase.current;

    const ctx = gsap.context(() => {
      if (!skipEntrance) {
        /* The hero is one composed sequence rather than five independent
           tweens, so the beats land in a deliberate order. Nothing here
           gates readability — the text and CTA are usable throughout. */
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from("[data-hero-rule]", { scaleX: 0, duration: 0.6 })
          .from("[data-hero-eyebrow]", { opacity: 0, y: 12, duration: 0.5 }, "-=0.42")
          .from(
            "[data-hero-title] [data-word]",
            { yPercent: 110, duration: 0.82, stagger: 0.055 },
            "-=0.28",
          )
          .from(
            "[data-hero-lede] > p",
            { opacity: 0, y: 18, duration: 0.6, stagger: 0.1 },
            "-=0.5",
          )
          .from("[data-hero-cta]", { opacity: 0, y: 14, duration: 0.5 }, "-=0.36");

        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          const words = el.querySelectorAll<HTMLElement>("[data-word]");
          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          });
          if (words.length) {
            // Lift the words out of their masks; the block itself only fades,
            // so the two gestures read as one arrival rather than two.
            tl.from(el, { opacity: 0, duration: 0.45 }).from(
              words,
              { yPercent: 110, duration: 0.72, stagger: 0.04 },
              0,
            );
          } else {
            tl.from(el, { opacity: 0, y: 22, duration: 0.72 });
          }
        });
      }

      /* Covers drift against the scroll. Bounded to ±6% and scrubbed, so it
         tracks the wheel exactly instead of easing along behind it. */
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      /* Reading progress for a page that is one long scroll. */
      gsap.fromTo(
        "[data-progress]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        },
      );
    }, root);

    // The case-study view changes the document height by thousands of pixels;
    // triggers measured against the old height would all fire at the wrong
    // place. Re-measure once layout has settled.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    // Webfont swap reflows every heading on the page, which moves each
    // trigger's start. Without this a reveal can be armed for a position the
    // element no longer occupies, and its text never arrives.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, [reducedMotion, openSlug]);

  return (
    <div ref={rootRef} className={styles.page}>
      {/* Identity — held at the same inset and scale as the design world
          nameplate, so the crossfade reads as one header changing typeface
          rather than two headers swapping places. */}
      <header className={styles.bizHeader}>
        <span className={styles.bizName}>{identity.name}</span>
        <span className={styles.bizRole}>{businessCopy.subtitle}</span>
      </header>

      {/* Reading progress. Decorative — the scrollbar remains the real
          affordance — so it is hidden from assistive technology. */}
      {!reducedMotion && (
        <div className={styles.progressTrack} aria-hidden="true">
          <span className={styles.progressBar} data-progress="" />
        </div>
      )}

      {openProject ? (
        <main id="main" tabIndex={-1} className={styles.main}>
          <BusinessCaseStudy
            project={openProject}
            siblings={businessProjects}
            onClose={closeCase}
            onOpen={openCase}
          />
        </main>
      ) : (
      <main id="main" tabIndex={-1} className={`${styles.main} ${shift}`}>
        {/* ---------------- Hero ---------------- */}
        <section className={styles.hero} aria-labelledby="biz-hero-title">
          <WordField terms={fieldTerms} reducedMotion={reducedMotion} paused={fieldPaused} />

          <div className={`${styles.shell} ${styles.heroShell}`}>
            <div className={styles.heroText}>
              <p className={styles.eyebrow} data-hero-eyebrow="">
                <span
                  className={styles.eyebrowRule}
                  aria-hidden="true"
                  data-hero-rule=""
                />
                {businessCopy.hero.eyebrow}
              </p>
              <h1 id="biz-hero-title" className={styles.headline} data-hero-title="">
                <SplitWords text={businessCopy.hero.headline} />
              </h1>
              <div className={styles.lede} data-hero-lede="">
                <p>{businessCopy.hero.intro}</p>
                <p>{businessCopy.hero.intro2}</p>
              </div>
              <a
                href="#selected-projects"
                className={styles.cta}
                onClick={toProjects}
                ref={ctaRef}
                data-hero-cta=""
              >
                {businessCopy.hero.cta}
                <Arrow />
              </a>
            </div>
          </div>

          {!reducedMotion && (
            <button
              type="button"
              className={styles.pause}
              aria-pressed={fieldPaused}
              onClick={() => setFieldPaused((v) => !v)}
            >
              <svg viewBox="0 0 12 12" className={styles.pauseIcon} aria-hidden="true" focusable="false">
                {fieldPaused ? (
                  <path d="M3 2l7 4-7 4z" fill="currentColor" />
                ) : (
                  <>
                    <rect x="3" y="2" width="2.4" height="8" fill="currentColor" />
                    <rect x="6.8" y="2" width="2.4" height="8" fill="currentColor" />
                  </>
                )}
              </svg>
              {fieldPaused ? "Play motion" : "Pause motion"}
            </button>
          )}
        </section>

        {/* ---------------- Selected projects ---------------- */}
        <section
          id="selected-projects"
          ref={projectsRef}
          className={styles.section}
          aria-labelledby="biz-projects-title"
        >
          <div className={styles.shell}>
            <div className={styles.sectionHead} data-reveal="">
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowRule} aria-hidden="true" />
                {businessCopy.projects.eyebrow}
              </p>
              <h2 id="biz-projects-title" className={styles.sectionTitle}>
                <SplitWords text={businessCopy.projects.heading} />
              </h2>
              <p className={styles.sectionNote}>{businessCopy.projects.note}</p>
            </div>

            {/* One project below the next, separated by a hairline. The
                first is given more weight through its column split, its cover
                ratio and its title size — not by breaking the rhythm. */}
            <div className={styles.projectList}>
              {businessProjects.map((p, i) => (
                <article
                  key={p.id}
                  className={`${styles.row} ${i === 0 ? styles.rowFeature : ""}`}
                  data-reveal=""
                >
                  <ProjectCover p={p} feature={i === 0} />
                  <div className={styles.rowBody}>
                    {p.status && <span className={styles.status}>{p.status}</span>}
                    <h3 className={i === 0 ? styles.featureTitle : styles.cardTitle}>
                      {p.title}
                    </h3>
                    <p className={styles.standfirst}>{p.standfirst}</p>
                    <ProjectFields p={p} />
                    <CaseLink p={p} onOpen={openCase} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Continuous learning ---------------- */}
        <section className={styles.section} aria-labelledby="biz-learning-title">
          <div className={styles.shell}>
            <div className={`${styles.sectionHead} ${styles.learnHead}`} data-reveal="">
              <div>
                <p className={styles.eyebrow}>
                  <span className={styles.eyebrowRule} aria-hidden="true" />
                  {businessCopy.learning.eyebrow}
                </p>
                <h2 id="biz-learning-title" className={styles.sectionTitle}>
                  <SplitWords text={businessCopy.learning.heading} />
                </h2>
              </div>
              <p className={styles.learnIntro}>{businessCopy.learning.intro}</p>
            </div>

            {/* The grid takes however many credentials the data holds —
                any number, no layout change needed. */}
            <ul className={styles.badges} data-reveal="">
              {credentials.map((c) => (
                <li key={c.id} className={styles.badge}>
                  <div className={styles.badgeArt}>
                    {c.image ? (
                      /* Drawn uncropped, at whatever proportions the issuer used. */
                      <img
                        src={c.image}
                        alt=""
                        className={styles.badgeImg}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <BadgeMark />
                    )}
                  </div>
                  <p
                    className={`${styles.badgeTitle} ${
                      c.image || c.href ? "" : styles.ph
                    }`}
                  >
                    {c.title}
                  </p>
                  <p className={styles.badgeMeta}>{c.issuer}</p>
                  <p className={styles.badgeMeta}>{c.date}</p>
                  {c.href ? (
                    <a
                      className={styles.verify}
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Verify
                    </a>
                  ) : (
                    <span className={styles.verifyOff} aria-disabled="true">
                      Verification link
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className={styles.sectionNote}>{businessCopy.learning.note}</p>
          </div>
        </section>

        {/* ---------------- Closing ---------------- */}
        <section
          className={`${styles.section} ${styles.closing}`}
          aria-labelledby="biz-closing-title"
        >
          <div className={styles.shell}>
            <div data-reveal="">
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowRule} aria-hidden="true" />
                {businessCopy.closing.eyebrow}
              </p>
              <h2 id="biz-closing-title" className={styles.statement}>
                <SplitWords text={businessCopy.closing.statement} />
              </h2>
              <p className={styles.closingBody}>{businessCopy.closing.body}</p>
            </div>

            <div className={styles.contact} data-reveal="">
              <p className={styles.contactLead}>{businessCopy.closing.contactLead}</p>
              <dl className={styles.contactList}>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${socials.email}`} className={styles.contactLink}>
                      {socials.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>LinkedIn</dt>
                  <dd>
                    <a
                      href={socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.contactLink}
                    >
                      linkedin.com/in/mzaabi
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Based in</dt>
                  <dd>{about.location}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <footer className={styles.bizFooter}>
          <div className={styles.shell}>
            <span>{identity.name}</span>
            <span>{businessCopy.subtitle}</span>
          </div>
        </footer>
      </main>
      )}
    </div>
  );
}
