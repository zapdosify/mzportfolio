/**
 * Business Analytics portfolio — verified chart data.
 *
 * These are the four exhibits from the Phase 2 content package
 * (`Anayltics Portfolio-Package/phase-2/assets/*.png`), rebuilt as native
 * data so they can draw on scroll, stay sharp at any density, and carry a
 * real accessible description instead of an image alt string.
 *
 * PROVENANCE — every value below traces to the verified exhibit:
 *
 * - `cityShare`, `delayCauses`, `evvValidation` are printed as data labels on
 *   the source charts AND restated in `businessContent.ts`. Two independent
 *   sources agree, so they are exact.
 * - `hourlyShare` prints only its peak (12.3% at 19:00). The other ten bars
 *   were transcribed from the source PNG against its 2% gridlines. The
 *   transcription sums to 99.95%, which confirms hours 10–20 are the complete
 *   set and the readings are accurate to the chart's own precision. The 19:00
 *   bar uses the printed 12.3%, not a reading.
 *
 * The `caption` and `notes` on each chart are quoted from the source exhibit.
 * Several are more precise than the case-study prose (the EVV note that the
 * ten missing client IDs *may overlap* the amount exceptions, for one) and
 * they are the reason these charts can be shown without overclaiming.
 * Do not drop them, and do not soften them.
 */

export interface ChartDatum {
  /** Category label as printed on the source exhibit. */
  label: string;
  value: number;
  /** Pre-formatted data label, so rounding never drifts from the exhibit. */
  display: string;
  /** One series member carries the accent; the rest stay neutral. */
  accent?: boolean;
}

export interface BarChart {
  kind: "columns" | "rows";
  title: string;
  subtitle: string;
  /** Axis title for the measured dimension. */
  measureAxis: string;
  /** Axis title for the category dimension (columns only). */
  categoryAxis?: string;
  /** Upper bound of the measured scale, matching the source exhibit. */
  max: number;
  /** Gridline interval in measure units. */
  tick: number;
  /** Formats a gridline value for display. */
  tickFormat: (v: number) => string;
  data: ChartDatum[];
  caption: string;
  notes?: string[];
  /** Sentence read by assistive tech in place of the drawn chart. */
  summary: string;
}

export interface StatPanel {
  kind: "stats";
  title: string;
  subtitle: string;
  stats: { value: number; display: string; label: string }[];
  method: string;
  notes: string[];
  summary: string;
}

export type BusinessChart = BarChart | StatPanel;

/* ------------------------------------------------------------------ *
 * 01 · Supermarket — hourly share of transaction value
 * ------------------------------------------------------------------ */

export const hourlyShare: BarChart = {
  kind: "columns",
  title: "Evening transactions lead the sales mix",
  subtitle: "Supermarket sales · 1,000 transactions · January–March 2019",
  measureAxis: "Share of transaction value, including tax",
  categoryAxis: "Transaction hour (24-hour clock)",
  max: 14,
  tick: 2,
  tickFormat: (v) => `${v}%`,
  data: [
    { label: "10", value: 9.75, display: "9.8%" },
    { label: "11", value: 9.4, display: "9.4%" },
    { label: "12", value: 8.05, display: "8.1%" },
    { label: "13", value: 10.75, display: "10.8%" },
    { label: "14", value: 9.55, display: "9.6%" },
    { label: "15", value: 9.65, display: "9.7%" },
    { label: "16", value: 7.8, display: "7.8%" },
    { label: "17", value: 7.55, display: "7.6%" },
    { label: "18", value: 8.05, display: "8.1%" },
    { label: "19", value: 12.3, display: "12.3%", accent: true },
    { label: "20", value: 7.1, display: "7.1%" },
  ],
  caption:
    "The 19:00 hour accounts for 12.3% of observed value. Campaign uplift has not been tested.",
  summary:
    "Column chart of hourly share of supermarket transaction value across hours 10 to 20. The 19:00 hour is highest at 12.3%; 13:00 follows at 10.8%; the remaining hours sit between 7.1% and 9.8%.",
};

/* ------------------------------------------------------------------ *
 * 02 · Supermarket — share of transaction value by city
 * ------------------------------------------------------------------ */

export const cityShare: BarChart = {
  kind: "rows",
  title: "Sales are distributed across all three cities",
  subtitle:
    "Supermarket sales · Share of transaction value including tax · January–March 2019",
  measureAxis: "Share of observed transaction value",
  max: 40,
  tick: 5,
  tickFormat: (v) => `${v}%`,
  data: [
    { label: "Naypyitaw", value: 34.2, display: "34.2%", accent: true },
    { label: "Yangon", value: 32.9, display: "32.9%" },
    { label: "Mandalay", value: 32.9, display: "32.9%" },
  ],
  caption:
    "The leading city contributes 34.2%. City totals alone do not establish promotional return.",
  summary:
    "Bar chart of share of transaction value by city. Naypyitaw leads at 34.2%; Yangon and Mandalay each contribute 32.9%. The mix is close to even.",
};

/* ------------------------------------------------------------------ *
 * 03 · EVV — validation summary (a stat panel, not a plotted chart)
 * ------------------------------------------------------------------ */

export const evvValidation: StatPanel = {
  kind: "stats",
  title: "126 records need an arithmetic review",
  subtitle: "EVV classroom dataset · Portfolio validation · 20,671 records",
  stats: [
    { value: 20671, display: "20,671", label: "Records checked" },
    { value: 126, display: "126", label: "Amount exceptions" },
    { value: 0.61, display: "0.61%", label: "Exception share" },
  ],
  method:
    "Check: units × rate compared with the recorded amount using decimal arithmetic.",
  notes: [
    "Ten records also lack client IDs; this is a separate check and may overlap the exceptions.",
    "Arithmetic exceptions require business-rule review. They are not confirmed billing errors.",
  ],
  summary:
    "Validation summary: 20,671 records checked, 126 amount exceptions, an exception share of 0.61%.",
};

/* ------------------------------------------------------------------ *
 * 04 · Airline — recorded delay minutes by cause
 * ------------------------------------------------------------------ */

export const delayCauses: BarChart = {
  kind: "rows",
  title: "Late aircraft accounts for the most recorded minutes",
  subtitle: "Airline delays · Selected delayed departures from 2008 · Recorded cause totals",
  measureAxis: "Recorded delay minutes (millions)",
  max: 35,
  tick: 5,
  tickFormat: (v) => `${v}`,
  data: [
    { label: "Late aircraft", value: 31.56, display: "31.56M", accent: true },
    { label: "Carrier", value: 23.93, display: "23.93M" },
    { label: "National aviation system", value: 18.74, display: "18.74M" },
    { label: "Weather", value: 4.62, display: "4.62M" },
    { label: "Security", value: 0.11, display: "0.11M" },
  ],
  caption:
    "Missing values are excluded from each sum; each cause field is missing on 689,270 rows.",
  notes: ["These are cause-minute totals, not flight counts or overall airline delay rates."],
  summary:
    "Bar chart of recorded delay minutes by cause, in millions. Late aircraft is largest at 31.56M, followed by carrier at 23.93M and national aviation system at 18.74M. Weather is 4.62M and security 0.11M.",
};

/* ------------------------------------------------------------------ *
 * Registry — case studies reference charts by id.
 * ------------------------------------------------------------------ */

export const businessCharts = {
  "hourly-share": hourlyShare,
  "city-share": cityShare,
  "evv-validation": evvValidation,
  "delay-causes": delayCauses,
} satisfies Record<string, BusinessChart>;

export type BusinessChartId = keyof typeof businessCharts;
