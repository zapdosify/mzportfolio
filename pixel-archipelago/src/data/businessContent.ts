/**
 * Business Analytics portfolio — ALL editable content lives here.
 *
 * Nothing in this file is a claim about completed work. Every project and
 * credential below is a labelled *placeholder*; replace the fields and the
 * layout adapts on its own. See the notes above each block for exactly what
 * to change.
 */

/* ------------------------------------------------------------------ *
 * 1 · Page copy
 * ------------------------------------------------------------------ */

export const businessCopy = {
  /** Shown under the name in the header while this mode is active. */
  subtitle: "Business Analytics Portfolio",

  hero: {
    eyebrow: "MSc Business Analytics · Master of Design",
    headline: "Turning complexity into clear decisions.",
    intro:
      "I'm Mohammed Zaabi Noor. I hold a master's degree in design and a Master of Science in Business Analytics — two disciplines that ask the same question from opposite ends: what is actually going on here, and what should we do about it?",
    intro2:
      "I work in the space between the model and the message. Analysis that no one can act on is unfinished; a story that the numbers don't support is decoration. My interest is in the point where the two meet.",
    cta: "Explore selected projects",
  },

  projects: {
    eyebrow: "Selected projects",
    heading: "Three studies, in preparation.",
    note: "Case studies are being written. Each entry below holds the structure they will follow.",
  },

  learning: {
    // The H2 is "Continuous learning" (as briefed); the eyebrow must not
    // simply repeat it back.
    eyebrow: "Credentials",
    heading: "Continuous learning",
    intro:
      "A running record of coursework taken alongside the degree. Each slot carries the badge as issued — original artwork, original proportions — with the course title, the institution, the completion date, and a link to verify it.",
    note: "Credentials to be added.",
  },

  closing: {
    eyebrow: "Closing",
    statement: "Analysis decides what is true. Design decides what is understood.",
    body:
      "A model that nobody trusts changes nothing, and a decision that isn't understood doesn't survive the room it was made in. Both disciplines are in service of the same thing: giving people a clear enough picture to act on.",
    contactLead: "Open to analytics and strategy roles, and to conversations that don't have a job attached.",
  },
};

/* ------------------------------------------------------------------ *
 * 2 · The animated background word field
 *
 * Decorative thematic vocabulary — the terminology of the field, not a
 * claim of expertise. Add or remove freely; the composition redistributes
 * itself around whatever list it is given.
 * ------------------------------------------------------------------ */

export const fieldTerms: string[] = [
  "Strategy",
  "Business Intelligence",
  "Forecasting",
  "Customer Insights",
  "Decision Science",
  "Process Optimization",
  "Predictive Analytics",
  "Market Research",
  "Risk Analysis",
  "Performance Measurement",
  "Data Visualization",
  "Value Creation",
];

/* ------------------------------------------------------------------ *
 * 3 · Selected projects
 *
 * TO ADD A REAL PROJECT: replace `status` with null, write `title`,
 * `question`, `summary` and `outcome` as ordinary sentences, list
 * `methods` (the dashed placeholder slots disappear as soon as the array
 * has entries), and set `href` to the case-study route or URL — the link
 * activates itself once `href` is no longer null.
 *
 * `cover` picks one of the abstract SVG covers in
 * components/business/Covers.tsx ("contour" | "orbit" | "drift").
 * Swap it for `image: "/media/…"` later if you'd rather use artwork.
 * ------------------------------------------------------------------ */

export interface BusinessProject {
  id: string;
  /** "01" · "02" — the large index numeral on the card */
  index: string;
  /** Placeholder chip. Set to null once the case study is real. */
  status: string | null;
  title: string;
  /** One line describing what the card slot is for, shown while empty. */
  standfirst: string;
  question: string;
  summary: string;
  /** Empty renders dashed slots; entries render as chips. */
  methods: string[];
  outcome: string;
  /** null keeps the link inert and labelled "Details coming soon". */
  href: string | null;
  cover: "contour" | "orbit" | "drift";
  /** Optional real cover image; overrides `cover` when set. */
  image?: string;
}

export const businessProjects: BusinessProject[] = [
  {
    id: "project-01",
    index: "01",
    status: "Details coming soon",
    title: "Project placeholder",
    standfirst: "The feature case study will open this section.",
    question: "The decision this project set out to inform will be stated here.",
    summary:
      "A short account of the work: where the data came from, how the question was framed, and what was built to answer it.",
    methods: [],
    outcome: "The insight that changed what happened next.",
    href: null,
    cover: "contour",
  },
  {
    id: "project-02",
    index: "02",
    status: "Details coming soon",
    title: "Project placeholder",
    standfirst: "A second study, held at half width.",
    question: "The question behind the analysis.",
    summary: "The approach, the data, and the shape of the answer.",
    methods: [],
    outcome: "What it made possible.",
    href: null,
    cover: "orbit",
  },
  {
    id: "project-03",
    index: "03",
    status: "Details coming soon",
    title: "Project placeholder",
    standfirst: "A third study, paired with the second.",
    question: "The question behind the analysis.",
    summary: "The approach, the data, and the shape of the answer.",
    methods: [],
    outcome: "What it made possible.",
    href: null,
    cover: "drift",
  },
];

/* ------------------------------------------------------------------ *
 * 4 · Learning & credentials
 *
 * TO ADD A COURSERA BADGE: set `image` to the badge file you drop into
 * public/media/badges/ (it is drawn uncropped, at its own proportions),
 * fill in `title`, `issuer` and `date`, and set `href` to the Coursera
 * verification URL. The grid grows to fit however many entries exist —
 * add a tenth, a twentieth, nothing else needs changing.
 * ------------------------------------------------------------------ */

export interface Credential {
  id: string;
  /** Badge artwork, drawn at its original aspect ratio. */
  image?: string;
  title: string;
  issuer: string;
  date: string;
  /** null keeps the verify link inert. */
  href: string | null;
}

export const credentials: Credential[] = [
  { id: "c1", title: "Course title", issuer: "Issuing institution", date: "Completion date", href: null },
  { id: "c2", title: "Course title", issuer: "Issuing institution", date: "Completion date", href: null },
  { id: "c3", title: "Course title", issuer: "Issuing institution", date: "Completion date", href: null },
  { id: "c4", title: "Course title", issuer: "Issuing institution", date: "Completion date", href: null },
  { id: "c5", title: "Course title", issuer: "Issuing institution", date: "Completion date", href: null },
  { id: "c6", title: "Course title", issuer: "Issuing institution", date: "Completion date", href: null },
];
