import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categories, categoryById } from "../../data/categories";
import { identity } from "../../data/siteContent";
import { useWorldStore } from "../../hooks/useWorldStore";
import OrbLayer from "../../world/OrbLayer";
import Intro, { INTRO_SEEN_KEY } from "./Intro";
import styles from "./Landing.module.css";

// Plate positions (% of the world layer). X = measured centre of each island;
// Y = label row. The world layer is the same 1672×941 frame as the islands art.
const PLATE_X: Record<string, number> = {
  "app-design": 49.0, "website-design": 30.3, "visual-artwork": 67.1,
  "manifesto-design": 83.4, "exhibition-design": 19.9, "poster-design": 38.2,
  "animation": 58.9, "documentary": 76.9, "renders": 24.1, "3d-lettering": 35.8,
  "t-mobile": 63.8, "about": 77.3, "contact": 49.8,
};
const PLATE_Y: Record<string, number> = {
  "app-design": 30.9, "website-design": 30.9, "visual-artwork": 30.9,
  "manifesto-design": 34.7, "exhibition-design": 51.3, "poster-design": 51.6,
  "animation": 51.9, "documentary": 54.1, "renders": 73.6, "3d-lettering": 73.6,
  "t-mobile": 76.1, "about": 76.9, "contact": 94.4,
};

// Parallax depth: background barely moves, world layer moves a little more.
const F_BG = 0.16;
const F_WORLD = 0.5;
const MAX_PX = 26;

const fx = (f: number, extra: React.CSSProperties = {}): React.CSSProperties =>
  ({ ...extra, ["--f"]: f } as React.CSSProperties);

export default function Landing() {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [orbId, setOrbId] = useState<string | null>(null);
  const explored = useWorldStore((s) => s.explored);
  const orbPos = useWorldStore((s) => s.orb);
  const setOrb = useWorldStore((s) => s.setOrb);
  const indexOpen = useWorldStore((s) => s.indexOpen);
  const setIndexOpen = useWorldStore((s) => s.setIndexOpen);
  const storeRM = useWorldStore((s) => s.reducedMotion);
  const navigate = useNavigate();
  const stageRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLImageElement>(null);
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false); // guards against double navigation
  // Full-island colour burst fired by clicking the centre orb.
  const [burstId, setBurstId] = useState(0); // bumping the key restarts cleanly
  const [burstOn, setBurstOn] = useState(false);
  const burstTimer = useRef<number | null>(null);

  const reducedMotion = useMemo(
    () =>
      storeRM ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    [storeRM],
  );

  /**
   * First-load intro. `intro` = the overlay is playing and the landing is held
   * back; `settle` = the overlay is lifting and the scene assembles; `done` =
   * ordinary landing, no classes, no lingering animation.
   *
   * Gated on sessionStorage so it plays once per tab, not on every return to
   * `/`. Read lazily in the initialiser (not an effect) so the landing is never
   * painted un-hidden for a frame before the overlay covers it.
   */
  const introFirstRun = () => {
    if (typeof window === "undefined") return false;
    try {
      return !sessionStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      return false; // private mode / storage disabled — just show the page
    }
  };
  const [introPhase, setIntroPhase] = useState<"intro" | "settle" | "done">(() =>
    introFirstRun() ? "intro" : "done",
  );
  // Tracked separately from the phase: the overlay has to stay mounted through
  // its own crossfade after the landing has already been released.
  const [introMounted, setIntroMounted] = useState(introFirstRun);

  // Marked as soon as it starts, so navigating away mid-intro doesn't replay it.
  useEffect(() => {
    if (introPhase !== "intro") return;
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      /* nothing to do — worst case it plays again next mount */
    }
  }, [introPhase]);

  const activeId = hoverId ?? orbId;
  const activeCat = activeId ? categoryById(activeId) : null;

  // Single navigation entry point: plays a brief warp transition, then routes.
  // The leavingRef latch means repeated clicks can't fire a second navigation.
  const go = useCallback(
    (route: string) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      if (reducedMotion) {
        navigate(route);
        return;
      }
      setLeaving(true);
      // Navigate once the warp overlay has settled to solid black (650ms
      // animation; by ~620ms the residual bloom is imperceptible), so the
      // route swap happens invisibly and the new page fades up from black.
      window.setTimeout(() => navigate(route), 620);
    },
    [navigate, reducedMotion],
  );
  const enter = (id: string) => go(categoryById(id)!.route);

  // Clicking the centre orb floods every island with colour: a pulse expands
  // from the orb, holds full colour for 5s, then fades back to mono. Bumping
  // burstId remounts the (keyed) burst layers so repeated clicks restart the
  // animation cleanly — no stacked timers, pulses, or layers.
  const triggerBurst = useCallback(() => {
    if (burstTimer.current) window.clearTimeout(burstTimer.current);
    setBurstId((n) => n + 1);
    setBurstOn(true);
    // expand(2.4s, skipped under reduced motion) + hold(5s) + fade(1.5s)
    const total = reducedMotion ? 5000 + 1500 : 2400 + 5000 + 1500;
    burstTimer.current = window.setTimeout(() => {
      setBurstOn(false);
      burstTimer.current = null;
    }, total);
  }, [reducedMotion]);

  // Clean up the burst timer if the component unmounts mid-animation.
  useEffect(
    () => () => {
      if (burstTimer.current) window.clearTimeout(burstTimer.current);
    },
    [],
  );

  // Pointer-driven parallax (eased). HUD is outside the stage, so it never moves.
  useEffect(() => {
    if (reducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * -2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * -2;
    };
    const loop = () => {
      cur.x += (target.x - cur.x) * 0.06;
      cur.y += (target.y - cur.y) * 0.06;
      stage.style.setProperty("--mx", `${(cur.x * MAX_PX).toFixed(2)}px`);
      stage.style.setProperty("--my", `${(cur.y * MAX_PX).toFixed(2)}px`);
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  return (
    <section
      className={`${styles.world} ${
        introPhase === "intro"
          ? styles.introHidden
          : introPhase === "settle"
            ? styles.introSettle
            : ""
      }`}
      aria-label="Pixel Archipelago — explore the portfolio"
    >
      <div
        className={`${styles.stage} ${leaving ? styles.stageLeaving : ""}`}
        ref={stageRef}
      >
        {/* L0 background void + stars (minimal parallax) */}
        <div className={`${styles.layer} ${styles.parallax}`} style={fx(F_BG)} aria-hidden="true">
          <img src="/images/landing/background.png" alt="" className={`${styles.fill} ${styles.bg} pixelated`} />
        </div>

        {/* L1 world layer: transparent islands + DOM nameplates (more parallax) */}
        <div className={`${styles.worldLayer} ${styles.parallax}`} style={fx(F_WORLD)}>
          <img
            src="/images/landing/islands.png"
            alt=""
            className={`${styles.islandsImg} pixelated`}
            aria-hidden="true"
          />

          {/* Coloured twin of the islands, revealed in a feathered circle around
              the orb. Masked twice: the orb radius AND the islands' own alpha,
              so colour never spills onto the background. Same box + parallax as
              the mono islands, so the two stay pixel-aligned. */}
          <img
            ref={revealRef}
            src="/images/landing/Colored_Archipelago.png"
            alt=""
            className={`${styles.colorReveal} pixelated`}
            aria-hidden="true"
          />

          {/* Full-island colour burst: a second coloured twin revealed by an
              expanding radial mask from the orb centre, plus a visible pulse
              ring. Keyed so each click remounts and restarts cleanly. Shares
              the box + parallax of the mono islands → stays pixel-aligned. */}
          {burstOn && (
            <>
              <img
                key={`burst-${burstId}`}
                src="/images/landing/Colored_Archipelago.png"
                alt=""
                aria-hidden="true"
                className={`${styles.colorBurst} ${
                  reducedMotion ? styles.colorBurstReduced : styles.colorBurstAnim
                } pixelated`}
              />
              {!reducedMotion && (
                <span key={`pulse-${burstId}`} className={styles.pulse} aria-hidden="true" />
              )}
            </>
          )}

          {/* Soft pulsing yellow orb at the centre of the archipelago.
              Clickable/keyboard-activatable — fires the colour burst. */}
          <button
            type="button"
            className={styles.centerOrb}
            style={{ left: "49.5%", top: "50.4%" }}
            onClick={triggerBurst}
            aria-label="Illuminate the archipelago in colour"
            /* the intro measures this to land its particles and its radial
               light on the real orb, rather than on an assumed centre */
            data-orb-target=""
          >
            <span className={styles.orbEmit} aria-hidden="true" />
            <span className={styles.orbEmit2} aria-hidden="true" />
            <span className={styles.orbGlow} aria-hidden="true" />
            <span className={styles.orbCore} aria-hidden="true" />
          </button>

          <ul className={styles.plates}>
            {categories.map((c, i) => {
              const y = PLATE_Y[c.id];
              if (y == null) return null;
              const on = activeId === c.id;
              return (
                <li
                  key={c.id}
                  className={styles.plateItem}
                  style={
                    {
                      left: `${PLATE_X[c.id] ?? c.worldPosition.x}%`,
                      top: `${y}%`,
                      // stagger index for the intro's settle cascade
                      "--i": i,
                    } as React.CSSProperties
                  }
                >
                  <Link
                    to={c.route}
                    className={`${styles.plate} ${on ? styles.plateOn : ""}`}
                    onMouseEnter={() => setHoverId(c.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(c.id)}
                    onBlur={() => setHoverId(null)}
                    onClick={(e) => {
                      // Intercept so the warp transition plays; Enter on a link
                      // fires a click, so this covers keyboard Enter too.
                      e.preventDefault();
                      go(c.route);
                    }}
                    onKeyDown={(e) => {
                      // Links don't activate on Space by default — add it.
                      if (e.key === " ") {
                        e.preventDefault();
                        go(c.route);
                      }
                    }}
                    aria-label={`${c.title} — ${c.description}`}
                  >
                    <span className={styles.plateLabel}>{c.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cursor-following orb navigator (fixed to stage, not parallaxed) */}
        <OrbLayer
          categories={categories}
          initial={orbPos}
          reducedMotion={reducedMotion}
          paused={indexOpen}
          onProximity={setOrbId}
          onEnter={enter}
          onMoveEnd={(p) => setOrb(p.x, p.y)}
          revealRef={revealRef}
        />
      </div>

      {/* ---------- Fixed HUD (no parallax) ---------- */}
      <div className={styles.hud}>
        {/* Title (top-left) */}
        <div className={styles.titleBlock}>
          <h1 className={styles.name}>{identity.name}</h1>
          <p className={styles.role}>Design Portfolio</p>
          <span className={styles.rule} aria-hidden="true" />
          <p className={styles.explore} aria-hidden="true">
            <span className={styles.exploreMark}>⊹</span> Move to Explore
          </p>
        </div>

        {/* Index (top-right) */}
        <button type="button" className={styles.indexBtn} onClick={() => setIndexOpen(true)}>
          Index <span aria-hidden="true" className={styles.indexGlyph}>☰</span>
        </button>

        {/* World map (bottom-left) */}
        <div className={styles.worldMap} aria-hidden="true">
          <span className={styles.mapTitle}>World Map</span>
          <svg viewBox="0 0 100 60" className={styles.mapSvg} preserveAspectRatio="xMidYMid meet">
            <rect x="1" y="1" width="98" height="58" rx="2" className={styles.mapFrame} />
            {categories.map((c) => (
              <rect
                key={c.id}
                x={c.worldPosition.x * 0.9 + 3 - 1.1}
                y={c.worldPosition.y * 0.55 + 4 - 1.1}
                width="2.2"
                height="2.2"
                className={activeId === c.id ? styles.mapDotOn : styles.mapDot}
              />
            ))}
          </svg>
        </div>

        {/* Status legend (bottom-right) */}
        <ul className={styles.legend} aria-hidden="true">
          <li>
            <svg viewBox="0 0 16 16" className={styles.legendIcon}><circle cx="8" cy="8" r="3" fill="currentColor" /><g stroke="currentColor" strokeWidth="1"><line x1="8" y1="1" x2="8" y2="4" /><line x1="8" y1="12" x2="8" y2="15" /><line x1="1" y1="8" x2="4" y2="8" /><line x1="12" y1="8" x2="15" y2="8" /></g></svg>
            You are here
          </li>
          <li>
            <svg viewBox="0 0 16 16" className={styles.legendIcon}><rect x="5" y="5" width="6" height="6" transform="rotate(45 8 8)" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
            Available
          </li>
          <li>
            <svg viewBox="0 0 16 16" className={styles.legendIcon}><g stroke="currentColor" strokeWidth="1.4"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></g></svg>
            Locked
          </li>
        </ul>
      </div>

      {/* Live H1 already provided above; extra instructions for screen readers */}
      <p className="sr-only">
        Move the orb with the mouse, arrow keys, or WASD, and press Enter to open the nearest
        island. You can also select any category nameplate directly.
      </p>

      {/* Bottom prompt: shown when a nameplate is hovered/focused OR the orb is
          near an island. (Replaces the old above-plate tooltip that obscured
          the islands.) */}
      {activeCat && (
        <button type="button" className={styles.enterPrompt} onClick={() => enter(activeCat.id)}>
          <span className={styles.enterTitle}>{activeCat.title}</span>
          <span className={styles.enterDesc}>{activeCat.description}</span>
          <span className={styles.enterKey}>
            {explored.includes(activeCat.id) ? "Revisit" : "Enter"} <kbd>⏎</kbd>
          </span>
        </button>
      )}

      {/* Accessible destination list (keyboard-reachable) */}
      <nav className={styles.srNav} aria-label="All destinations">
        <h2 className="sr-only">Portfolio destinations</h2>
        <ol>
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                to={c.route}
                onClick={(e) => {
                  e.preventDefault();
                  go(c.route);
                }}
                onKeyDown={(e) => {
                  if (e.key === " ") {
                    e.preventDefault();
                    go(c.route);
                  }
                }}
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      {/* Warp transition into the selected category (skipped for reduced motion) */}
      {leaving && <div className={styles.warp} aria-hidden="true" />}

      {/* First-load intro. Mounted last so it sits above the HUD, and removed
          entirely once it has handed off — nothing of it survives the reveal.
          Under reduced motion there is no staged settle to run, so the reveal
          goes straight to `done`. */}
      {introMounted && (
        <Intro
          reducedMotion={reducedMotion}
          onReveal={() => setIntroPhase(reducedMotion ? "done" : "settle")}
          onDone={() => {
            setIntroPhase("done");
            setIntroMounted(false);
          }}
        />
      )}
    </section>
  );
}
