/**
 * Credential marks — one line drawing per credential subject.
 *
 * These are NOT issuer logos. IBM's and CITI's marks are their trademarks and
 * are not ours to redraw; if official badge artwork is ever licensed, set
 * `image` on the credential and it wins over everything here (see the render
 * in BusinessPortfolio.tsx). What these draw instead is the *subject* of each
 * course — bars, a regression, a database, a spreadsheet — so the grid reads
 * as nine distinct things learned rather than nine identical placeholders.
 *
 * Drawn in the same vocabulary as Covers.tsx: thin `currentColor` strokes on a
 * 100x100 box, no fills except the few points that stand in for data, opacity
 * doing the tonal work. `.badgeArt` sets the colour, so these inherit ink.
 *
 * Every mark keeps the same r=38 medallion ring. That ring is what holds the
 * grid's rhythm across nine cells — without it the marks read as loose clipart.
 */

import type { ReactElement } from "react";

export type BadgeIconKind =
  | "bars"
  | "regression"
  | "database"
  | "code"
  | "dashboard"
  | "gridChart"
  | "spreadsheet"
  | "magnifier"
  | "shield";

/* Shared weights. Subject line-work sits at SUBJECT; the structure it hangs
   on (axes, gridlines, frames) sits at STRUCTURE, a step back in both weight
   and tone so the eye lands on the subject first. */
const SUBJECT = { strokeWidth: 1.35, opacity: 0.72 } as const;
const STRUCTURE = { strokeWidth: 0.9, opacity: 0.32 } as const;

function Ring() {
  return (
    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.28" />
  );
}

/* 1 · Data Visualization — four bars off a baseline. */
function Bars() {
  const bars = [
    { x: 34.5, h: 13 },
    { x: 43.5, h: 23 },
    { x: 52.5, h: 18 },
    { x: 61.5, h: 29 },
  ];
  return (
    <>
      {bars.map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={66 - b.h}
          width="6.5"
          height={b.h}
          fill="none"
          stroke="currentColor"
          {...SUBJECT}
        />
      ))}
      <path d="M32 66H68" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
    </>
  );
}

/* 2 · Data Analysis — a scatter with the line fitted through it. */
function Regression() {
  const pts = [
    [39, 57.5],
    [45, 55],
    [48.5, 49],
    [54, 48],
    [58, 43.5],
    [63.5, 41],
  ];
  return (
    <>
      <path d="M33 33V66H68" fill="none" stroke="currentColor" {...STRUCTURE} />
      <path d="M36 60L66 40" fill="none" stroke="currentColor" strokeLinecap="round" {...SUBJECT} />
      {pts.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.9" fill="currentColor" opacity="0.55" />
      ))}
    </>
  );
}

/* 3 · SQL — the database cylinder, banded. */
function Database() {
  return (
    <>
      <ellipse cx="50" cy="38" rx="15" ry="5.2" fill="none" stroke="currentColor" {...SUBJECT} />
      <path d="M35 38v24M65 38v24" fill="none" stroke="currentColor" {...SUBJECT} />
      <path d="M35 62a15 5.2 0 0 0 30 0" fill="none" stroke="currentColor" {...SUBJECT} />
      <path
        d="M35 46.5a15 5.2 0 0 0 30 0M35 54.5a15 5.2 0 0 0 30 0"
        fill="none"
        stroke="currentColor"
        {...STRUCTURE}
      />
    </>
  );
}

/* 4 · R programming — angle brackets around a slash. */
function Code() {
  return (
    <>
      <path
        d="M42 38L32 50l10 12M58 38l10 12-10 12"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...SUBJECT}
      />
      <path d="M54 35L46 65" fill="none" stroke="currentColor" strokeLinecap="round" {...STRUCTURE} />
    </>
  );
}

/* 5 · Dashboard essentials — a panel layout under a title bar. */
function Dashboard() {
  return (
    <>
      <rect x="32" y="34" width="36" height="32" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
      <path d="M32 42.5H68" fill="none" stroke="currentColor" {...STRUCTURE} />
      <rect x="36" y="46.5" width="13" height="15" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
      <rect x="53" y="46.5" width="11" height="6" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
      <rect x="53" y="55.5" width="11" height="6" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.45" />
    </>
  );
}

/* 6 · Excel + Cognos — a series plotted over the sheet it came from. */
function GridChart() {
  return (
    <>
      <rect x="32" y="34" width="36" height="32" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
      <path d="M44 34v32M56 34v32M32 44.7h36M32 55.3h36" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.24" />
      <path
        d="M35 60l9-10 9 4 12-15"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...SUBJECT}
      />
      <circle cx="65" cy="39" r="1.9" fill="currentColor" opacity="0.6" />
    </>
  );
}

/* 7 · Excel basics — the sheet itself, header row picked out. */
function Spreadsheet() {
  return (
    <>
      <rect x="32" y="34" width="36" height="32" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.1" opacity="0.55" />
      <rect x="32" y="34" width="36" height="8.5" fill="currentColor" opacity="0.12" />
      <path d="M32 42.5H68" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <path
        d="M32 50.3h36M32 58.1h36M44 42.5v23.5M56 42.5v23.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.26"
      />
    </>
  );
}

/* 8 · Introduction to Data Analytics — a closer look at a series. */
function Magnifier() {
  return (
    <>
      <circle cx="46" cy="46" r="13" fill="none" stroke="currentColor" {...SUBJECT} />
      <path d="M55.4 55.4L66 66" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity="0.72" />
      <path
        d="M40 50l4-4.5 4 2 4-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </>
  );
}

/* 9 · CITI human-subjects research — the shield of a review approval. */
function Shield() {
  return (
    <>
      <path
        d="M50 32l15 5v13c0 8-7 14-15 17-8-3-15-9-15-17V37z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
        opacity="0.6"
      />
      <path
        d="M43 49.5l5 5 10-11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.78"
      />
    </>
  );
}

/* Fallback for a credential added later with no icon chosen yet — the same
   abstract mark the grid used before these existed. */
function Abstract() {
  return (
    <>
      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="3 6" opacity="0.3" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" opacity="0.22" />
    </>
  );
}

const MARKS: Record<BadgeIconKind, () => ReactElement> = {
  bars: Bars,
  regression: Regression,
  database: Database,
  code: Code,
  dashboard: Dashboard,
  gridChart: GridChart,
  spreadsheet: Spreadsheet,
  magnifier: Magnifier,
  shield: Shield,
};

export default function BadgeIcon({ kind, className }: { kind?: BadgeIconKind; className?: string }) {
  const Mark = kind ? MARKS[kind] : Abstract;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <Ring />
      <Mark />
    </svg>
  );
}
