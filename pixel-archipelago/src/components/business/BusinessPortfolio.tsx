import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { identity, socials, about } from "../../data/siteContent";
import {
  businessCopy,
  businessProjects,
  credentials,
  fieldTerms,
} from "../../data/businessContent";
import { useWorldStore } from "../../hooks/useWorldStore";
import { useModeStore } from "../../hooks/useModeStore";
import WordField from "./WordField";
import Cover from "./Covers";
import BusinessCaseStudy from "./BusinessCaseStudy";
import type { BusinessProject } from "../../data/businessContent";
import styles from "./BusinessPortfolio.module.css";

/** Placeholder badge mark — replaced the moment a real badge image is set. */
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

/** Dashed slots stand in for methods/tools until the array is filled. */
function MethodSlots() {
  return (
    <span className={styles.slots} aria-label="Methods and tools to be added">
      {[62, 48, 78, 40].map((w, i) => (
        <span key={i} className={styles.slot} style={{ width: `${w}px` }} />
      ))}
    </span>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 24 12" className={styles.ctaArrow} aria-hidden="true" focusable="false">
    <path d="M0 6h21M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

/** The four labelled slots every case study will fill. */
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
          {p.methods.length ? (
            <span className={styles.chips}>
              {p.methods.map((m) => (
                <span key={m} className={styles.chip}>
                  {m}
                </span>
              ))}
            </span>
          ) : (
            <MethodSlots />
          )}
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
        requestAnimationFrame(() =>
          window.scrollTo({ top: returnScroll.current, behavior: "instant" as ScrollBehavior }),
        );
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
      projectsRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [reducedMotion],
  );

  /* Restrained entrance: sections rise a little as they arrive. One observer,
     no library, and it simply does not run under reduced motion.
     Re-runs when the case-study view closes, because the homepage sections
     remount fresh (opacity 0) with nothing observing them — on that return
     they are simply shown, not re-animated. */
  useEffect(() => {
    const root = rootRef.current;
    // Case study open: its content has no [data-reveal] to watch.
    if (!root || openSlug) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    // Reveal outright on the return trip, under reduced motion, or with no
    // IntersectionObserver — anything but the first, scroll-driven entrance.
    if (
      hasOpenedCase.current ||
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      items.forEach((el) => el.classList.add(styles.revealed));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(styles.revealed);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowRule} aria-hidden="true" />
                {businessCopy.hero.eyebrow}
              </p>
              <h1 id="biz-hero-title" className={styles.headline}>
                {businessCopy.hero.headline}
              </h1>
              <div className={styles.lede}>
                <p>{businessCopy.hero.intro}</p>
                <p>{businessCopy.hero.intro2}</p>
              </div>
              <a href="#selected-projects" className={styles.cta} onClick={toProjects}>
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
                {businessCopy.projects.heading}
              </h2>
              <p className={styles.sectionNote}>{businessCopy.projects.note}</p>
            </div>

            {/* One placeholder below the next, separated by a hairline. The
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
                  {businessCopy.learning.heading}
                </h2>
              </div>
              <p className={styles.learnIntro}>{businessCopy.learning.intro}</p>
            </div>

            {/* The grid takes however many credentials the data holds — six
                placeholders now, any number later, no layout change needed. */}
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
                  <p className={`${styles.badgeTitle} ${c.image ? "" : styles.ph}`}>{c.title}</p>
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
                {businessCopy.closing.statement}
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
