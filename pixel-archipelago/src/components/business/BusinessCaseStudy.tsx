import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BusinessProject } from "../../data/businessContent";
import { businessCharts } from "../../data/businessCharts";
import { scrollToInstant } from "../../hooks/lenisInstance";
import BusinessChart from "./BusinessChart";
import styles from "./BusinessCaseStudy.module.css";

const NavArrow = () => (
  <svg viewBox="0 0 22 10" aria-hidden="true" focusable="false">
    <path d="M22 5H2M7 1L2 5l5 4" fill="none" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

interface Props {
  project: BusinessProject;
  siblings: BusinessProject[];
  onClose: () => void;
  onOpen: (slug: string) => void;
}

/**
 * Full write-up for one business project. Rendered inside BusinessPortfolio's
 * `.page` (so the `--biz-*` tokens are in scope) in place of the homepage
 * sections — business mode is not routed, so this is a state-driven view.
 */
export default function BusinessCaseStudy({ project, siblings, onClose, onOpen }: Props) {
  const c = project.caseStudy;
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Land at the top of the study and move focus into it. The jump goes
  // through Lenis, which would otherwise carry the old offset back on its
  // next frame and drop the reader mid-page.
  useEffect(() => {
    scrollToInstant(0);
    headingRef.current?.focus();

    /* This view replaces the whole homepage, so the document height changes
       by thousands of pixels. The chart triggers inside it are created
       against the OLD height and would sit at progress 0 forever — bars at
       zero, counters frozen on "0". Re-measure once this layout has settled.
       Two frames: one for the DOM, one for the style/layout pass. */
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [project.slug]);

  // Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const meta = [
    c.context,
    c.role,
    c.tools.length ? c.tools.join(", ") : null,
    c.dataPeriod ? `Data period: ${c.dataPeriod}` : null,
  ].filter((x): x is string => Boolean(x));

  const i = siblings.findIndex((p) => p.slug === project.slug);
  const next = siblings[(i + 1) % siblings.length];

  return (
    <article className={styles.wrap} aria-labelledby="biz-case-title">
      <div className={styles.shell}>
        <button type="button" className={styles.nav} onClick={onClose}>
          <NavArrow /> All projects
        </button>

        <header className={styles.head}>
          <p className={styles.kicker}>Case study · {project.index}</p>
          <h1 id="biz-case-title" className={styles.title} tabIndex={-1} ref={headingRef}>
            {project.title}
          </h1>
          <p className={styles.standfirst}>{project.standfirst}</p>
          <ul className={styles.meta}>
            {meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
            <li className={styles.metaProof}>{c.proof}</li>
          </ul>
        </header>

        {c.chart && <BusinessChart spec={businessCharts[c.chart]} />}

        <div className={styles.body}>
          {c.sections.map((s) => (
            <section key={s.heading} className={styles.section}>
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </div>

        {c.supportingCharts?.map((id) => (
          <BusinessChart key={id} spec={businessCharts[id]} />
        ))}

        {c.matrix && (
          <section className={styles.matrixWrap}>
            <h2>{c.matrix.title}</h2>
            <p className={styles.matrixStatus}>{c.matrix.status}</p>
            <div className={styles.tableScroll}>
              <table className={styles.matrix}>
                <thead>
                  <tr>
                    <th scope="col">Requirement</th>
                    <th scope="col">Evaluation approach</th>
                    <th scope="col">Proposed acceptance condition</th>
                  </tr>
                </thead>
                <tbody>
                  {c.matrix.rows.map((r) => (
                    <tr key={r.requirement}>
                      <th scope="row">{r.requirement}</th>
                      <td>{r.approach}</td>
                      <td>{r.condition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <nav className={styles.foot}>
          <button type="button" className={styles.nav} onClick={onClose}>
            <NavArrow /> All projects
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            onClick={() => onOpen(next.slug)}
          >
            Next: {next.title} <NavArrow />
          </button>
        </nav>
      </div>
    </article>
  );
}
