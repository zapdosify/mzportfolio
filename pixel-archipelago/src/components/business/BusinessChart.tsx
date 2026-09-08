import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWorldStore } from "../../hooks/useWorldStore";
import type { BarChart, BusinessChart as ChartSpec, StatPanel } from "../../data/businessCharts";
import styles from "./BusinessChart.module.css";

gsap.registerPlugin(ScrollTrigger);

/* Bars are drawn with a transform, never a width/height tween — scaleX/scaleY
   stay on the compositor, so a page holding four charts never thrashes layout
   while scrolling. The resting state in CSS is the FINAL state: if GSAP never
   runs (reduced motion, no JS, a failed chunk) the chart is already correct. */

function useReduced() {
  const storeRM = useWorldStore((s) => s.reducedMotion);
  return (
    storeRM ||
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  );
}

/** Rebuilds a count-up string in the exhibit's own format, so a mid-tween
 *  frame never shows more precision than the published figure. */
function makeFormatter(display: string) {
  const decimals = (display.match(/\.(\d+)/)?.[1] ?? "").length;
  const pct = display.includes("%");
  const grouped = display.includes(",");
  return (n: number) => {
    const body = grouped
      ? n.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : n.toFixed(decimals);
    return pct ? `${body}%` : body;
  };
}

/* ---------------- Column chart (hourly share) ---------------- */

function Columns({ spec }: { spec: BarChart }) {
  const ticks: number[] = [];
  for (let v = 0; v <= spec.max; v += spec.tick) ticks.push(v);

  return (
    <div className={styles.colChart}>
      <span className={styles.measureAxis}>{spec.measureAxis}</span>

      <div className={styles.colPlot}>
        {/* Gridlines and columns share this box, so a tick and a bar of the
            same value always land on the same pixel. */}
        <div className={styles.plotInner}>
          {ticks.map((t) => (
            <div key={t} className={styles.gridRow} style={{ bottom: `${(t / spec.max) * 100}%` }}>
              <span className={styles.tick}>{spec.tickFormat(t)}</span>
              <span className={styles.gridLine} aria-hidden="true" />
            </div>
          ))}

          <div className={styles.cols}>
            {spec.data.map((d) => (
              <div key={d.label} className={styles.col}>
                {d.accent && (
                  <span className={styles.colValue} data-barval="">
                    {d.display}
                  </span>
                )}
                <div
                  className={`${styles.colBar} ${d.accent ? styles.accent : ""}`}
                  style={{ height: `${(d.value / spec.max) * 100}%` }}
                  data-bar=""
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.colLabels} aria-hidden="true">
        {spec.data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
      {spec.categoryAxis && <span className={styles.catAxis}>{spec.categoryAxis}</span>}
    </div>
  );
}

/* ---------------- Row chart (city share, delay causes) ---------------- */

function Rows({ spec }: { spec: BarChart }) {
  const ticks: number[] = [];
  for (let v = 0; v <= spec.max; v += spec.tick) ticks.push(v);

  return (
    <div className={styles.rowChart}>
      <div className={styles.rows}>
        {spec.data.map((d) => (
          <div key={d.label} className={styles.row}>
            <span className={styles.rowLabel}>{d.label}</span>
            <div className={styles.rowTrack}>
              <div
                className={`${styles.rowBar} ${d.accent ? styles.accent : ""}`}
                style={{ width: `${(d.value / spec.max) * 100}%` }}
                data-bar=""
              />
              <span
                className={styles.rowValue}
                style={{ left: `${(d.value / spec.max) * 100}%` }}
                data-barval=""
              >
                {d.display}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.rowAxis} aria-hidden="true">
        <span className={styles.rowLabelSpacer} />
        <div className={styles.rowTicks}>
          {ticks.map((t) => (
            <span key={t} className={styles.rowTick} style={{ left: `${(t / spec.max) * 100}%` }}>
              {spec.tickFormat(t)}
            </span>
          ))}
        </div>
      </div>
      <span className={styles.catAxis}>{spec.measureAxis}</span>
    </div>
  );
}

/* ---------------- Stat panel (EVV validation) ---------------- */

function Stats({ spec, reduced }: { spec: StatPanel; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-stat]"));
    if (!nodes.length) return;

    /* The count is started BY the trigger rather than attached to it. A tween
       bound directly to a ScrollTrigger writes its start value into the DOM
       the moment it is built, so every panel below the fold would read "0"
       until it was scrolled to — and would stay at "0" for good if the
       trigger never fired. Started this way, the published figure is what
       stands until the animation actually begins. */
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        once: true,
        onEnter: () => {
          nodes.forEach((node, i) => {
            const target = Number(node.dataset.value);
            const fmt = makeFormatter(node.dataset.display ?? String(target));
            const proxy = { n: 0 };
            gsap.to(proxy, {
              n: target,
              duration: 1.1,
              delay: i * 0.08,
              ease: "power2.out",
              onUpdate: () => {
                node.textContent = fmt(proxy.n);
              },
              // Land exactly on the published string, never a rounded tween value.
              onComplete: () => {
                node.textContent = node.dataset.display ?? fmt(target);
              },
            });
          });
        },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div className={styles.stats} ref={ref}>
      {spec.stats.map((s) => (
        <div key={s.label} className={styles.stat}>
          <span
            className={styles.statValue}
            data-stat=""
            data-value={s.value}
            data-display={s.display}
          >
            {s.display}
          </span>
          <span className={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Shell ---------------- */

export default function BusinessChart({ spec }: { spec: ChartSpec }) {
  const reduced = useReduced();
  const ref = useRef<HTMLElement>(null);

  // Bars grow from their baseline as the figure arrives.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const bars = Array.from(el.querySelectorAll<HTMLElement>("[data-bar]"));
    if (!bars.length) return;

    const axis = spec.kind === "columns" ? "scaleY" : "scaleX";
    const values = el.querySelectorAll<HTMLElement>("[data-barval]");

    /* Same rule as the counters: the draw is started by the trigger, not
       bound to it, so a chart that is never scrolled to — or whose trigger
       mismeasures — is a finished chart rather than an empty frame. */
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 82%",
        once: true,
        onEnter: () => {
          gsap.from(bars, {
            [axis]: 0,
            duration: 0.72,
            ease: "power3.out",
            stagger: 0.05,
          });
          gsap.from(values, {
            opacity: 0,
            duration: 0.4,
            delay: 0.34,
            stagger: 0.05,
          });
        },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced, spec.kind]);

  return (
    <figure className={styles.figure} ref={ref}>
      <figcaption className={styles.head}>
        <h3 className={styles.title}>{spec.title}</h3>
        <p className={styles.subtitle}>{spec.subtitle}</p>
      </figcaption>

      {/* One accessible description stands in for the drawn marks; the bars
          themselves are decorative once the summary has been read. */}
      <div className={styles.plotArea} role="img" aria-label={spec.summary}>
        {spec.kind === "columns" && <Columns spec={spec} />}
        {spec.kind === "rows" && <Rows spec={spec} />}
        {spec.kind === "stats" && <Stats spec={spec} reduced={reduced} />}
      </div>

      {spec.kind === "stats" && <p className={styles.method}>{spec.method}</p>}
      {spec.kind !== "stats" && <p className={styles.caption}>{spec.caption}</p>}

      {spec.notes && spec.notes.length > 0 && (
        <ul className={styles.notes}>
          {spec.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
    </figure>
  );
}
