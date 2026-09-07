/**
 * Business Analytics portfolio — ALL editable content lives here.
 *
 * The four project entries are the case studies from the Phase 2 content
 * package (`Anayltics Portfolio-Package/phase-2/`). Every claim below is
 * taken verbatim from that package, which is deliberate about separating
 * original academic work from metrics recalculated during portfolio
 * preparation.
 *
 * Card fields (`question`, `summary`, `methods`, `outcome`) feed the project
 * rows; the `caseStudy` block on each project carries the full write-up for
 * the case-study view.
 */

/* ------------------------------------------------------------------ *
 * 1 · Page copy
 * ------------------------------------------------------------------ */

export const businessCopy = {
  /** Shown under the name in the header while this mode is active. */
  subtitle: "Business Analytics Portfolio",

  hero: {
    eyebrow: "Master of Science in Business Analytics · Master of Design",
    headline: "Turning complexity into clear decisions.",
    intro:
      "I'm Mohammed Zaabi Noor. I hold a master's degree in design and a Master of Science in Business Analytics — two disciplines that ask the same question from opposite ends: what is actually going on here, and what should we do about it?",
    intro2:
      "I work in the space between the model and the message. Analysis that no one can act on is unfinished; a story that the numbers don't support is decoration. My interest is in the point where the two meet.",
    cta: "Explore selected projects",
  },

  projects: {
    eyebrow: "Selected projects",
    heading: "Four studies: the question, the evidence, the decision it supports.",
    note: "Academic work — commercial patterns, billing validation, airline operations, and quality planning. Supporting metrics recalculated during portfolio preparation are labelled as such in each case study.",
  },

  learning: {
    // The H2 is "Continuous learning" (as briefed); the eyebrow must not
    // simply repeat it back.
    eyebrow: "Credentials",
    heading: "Continuous learning",
    intro:
      "Coursework completed alongside the degree — the course title, the institution, the completion date, and a link to verify each one.",
    note: "Every credential links to its issuer's official verification record.",
  },

  closing: {
    eyebrow: "Closing",
    statement: "Analysis decides what is true. Design decides what is understood.",
    body:
      "A model that nobody trusts changes nothing, and a decision that isn't understood doesn't survive the room it was made in. Both disciplines are in service of the same thing: giving people a clear enough picture to act on.",
    contactLead: "Open to analytics and strategy roles.",
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
 * The card renders `question`, `summary`, `methods` (chips) and `outcome`
 * ("Key insight"). `caseStudy` carries the full write-up for the detail
 * view: metadata, a hero chart, the ordered sections, any supporting
 * images, and — for the AI project — a proposed evaluation matrix.
 *
 * `caseStudy.reviewNotes` are INTERNAL. They are notes for correcting the
 * original Tableau workbooks before any live dashboard link is enabled;
 * they must never appear in the visitor-facing interface.
 *
 * `cover` picks one of the abstract SVG covers in Covers.tsx
 * ("contour" | "orbit" | "drift"); set `image` to show artwork instead.
 * ------------------------------------------------------------------ */

export interface CaseSection {
  heading: string;
  body: string;
}

export interface EvalMatrixRow {
  requirement: string;
  approach: string;
  condition: string;
}

export interface EvalMatrix {
  title: string;
  status: string;
  rows: EvalMatrixRow[];
}

export interface CaseImage {
  src: string;
  alt: string;
}

export interface CaseStudy {
  /** Line 2 of the metadata: "Individual academic project" etc. */
  context: string;
  /** The personal contribution, distinct from a team responsibility. */
  role: string;
  /** Original tools used in the academic work. */
  tools: string[];
  /** Dataset period — a data range, NOT a project-completion date. */
  dataPeriod: string | null;
  /** Compact evidence line, e.g. "1,000 transactions · 3 cities". */
  proof: string;
  /** Hero chart (a supported single finding), or null for the AI plan. */
  hero: string | null;
  heroAlt: string | null;
  /** Ordered write-up sections. */
  sections: CaseSection[];
  /** Extra supporting exhibits shown after the sections. */
  supporting?: CaseImage[];
  /** AI project only: the proposed evaluation framework, rendered as a table. */
  matrix?: EvalMatrix;
  /** INTERNAL — Tableau-correction notes. Not rendered anywhere. */
  reviewNotes: string[];
}

export interface BusinessProject {
  id: string;
  /** Stable slug for the case-study view. */
  slug: string;
  /** "01" · "02" — the large index numeral on the card */
  index: string;
  /** Optional status chip (e.g. "In progress"); null for a published study. */
  status: string | null;
  title: string;
  /** One line under the card title. */
  standfirst: string;
  question: string;
  summary: string;
  /** Renders as chips on the card. */
  methods: string[];
  /** "Key insight" on the card. */
  outcome: string;
  /** External URL, or null to open the in-site case study. */
  href: string | null;
  cover: "contour" | "orbit" | "drift";
  /** Optional real cover image; overrides `cover` when set. */
  image?: string;
  /** Full write-up for the case-study view. */
  caseStudy: CaseStudy;
}

const CHART = "/media/business";

export const businessProjects: BusinessProject[] = [
  {
    id: "supermarket-promotion-analysis",
    slug: "supermarket-promotion-analysis",
    index: "01",
    status: null,
    title: "Supermarket Sales & Promotion Planning",
    standfirst: "Where the trading week concentrates value, and how to test a promotion against it.",
    question:
      "Which trading periods and locations deserve closer attention when planning a promotion, and how do you tell observed demand from evidence that a promotion would add sales?",
    summary:
      "Analyzed 1,000 supermarket transactions to identify sales patterns by time and city, and frame a measurable promotion test.",
    methods: ["Exploratory analysis", "Time-based analysis", "Business recommendations"],
    outcome:
      "The 19:00 hour is the largest single share of transaction value (12.3%) — a candidate to test, not a measured uplift.",
    href: null,
    cover: "contour",
    caseStudy: {
      context: "Individual academic project",
      role: "Sole creator of the Tableau analysis",
      tools: ["Tableau"],
      dataPeriod: "1 January–30 March 2019",
      proof: "1,000 transactions · 3 cities",
      hero: `${CHART}/supermarket-hourly-share.webp`,
      heroAlt:
        "Hourly shares of supermarket transaction value; 19:00 is highest at 12.3 percent.",
      sections: [
        {
          heading: "Overview",
          body: "I built a Tableau analysis to explore when and where a supermarket generated sales. The aim was to help a retail manager identify promising promotion tests using transaction patterns across time, cities, and product categories. This case study revisits the university project with independently recalculated findings from the portfolio review.",
        },
        {
          heading: "The business question",
          body: "Which trading periods and locations deserve closer attention when planning a promotion? The analysis needed to distinguish observed demand from evidence that a promotion would generate additional sales.",
        },
        {
          heading: "My contribution",
          body: "I created the Tableau worksheets, dashboard, and story, and framed the business questions. The original analysis explored daily, monthly, and hourly sales, product categories by city, and customer ratings.",
        },
        {
          heading: "Data and approach",
          body: "The embedded dataset contains 1,000 transactions across Mandalay, Naypyitaw, and Yangon from 1 January to 30 March 2019. Portfolio checks found no missing cells or duplicate full rows. Transaction values were grouped by hour and city, with each group expressed as a share of the total including tax. A separate review examined the transaction-level association between ratings and transaction value.",
        },
        {
          heading: "What the analysis shows",
          body: "The 19:00 hour contributes 12.3% of observed transaction value, the largest hourly share. Naypyitaw contributes 34.2%, while the other two cities each contribute about 32.9%; the sales mix is relatively balanced. Ratings have little linear association with transaction value in this sample (Pearson correlation approximately −0.036). These findings were recalculated during portfolio preparation.",
        },
        {
          heading: "Recommendation",
          body: "Use the evening peak as one candidate for a promotion test, alongside a comparison period. Define success using incremental margin after promotion costs, and track transaction volume and average basket value as supporting measures. A test needs a suitable comparison group or randomized allocation so ordinary trading patterns are not mistaken for promotional impact.",
        },
        {
          heading: "Scope and limitations",
          body: "The dataset contains no campaign exposure or response information, so it cannot establish campaign uplift. Three months do not establish annual seasonality. Currency is not confirmed; the visuals use shares rather than currency symbols.",
        },
        {
          heading: "What this project demonstrates",
          body: "Framing a commercial question, exploring transaction patterns in Tableau, and distinguishing an actionable hypothesis from a proven result.",
        },
      ],
      supporting: [
        {
          src: `${CHART}/supermarket-city-share.webp`,
          alt: "Naypyitaw contributes 34.2 percent of observed transaction value, Yangon and Mandalay each approximately 32.9 percent.",
        },
      ],
      reviewNotes: [
        "Use the verified static charts; the original Tableau dashboard needs correction before embedding.",
        "Replace day-of-month aggregation with full dates.",
        "Replace the rating worksheet with a view that actually answers the stated relationship question.",
        "Confirm dataset attribution and currency before enabling a source-data download.",
      ],
    },
  },
  {
    id: "evv-billing-validation",
    slug: "evv-billing-validation",
    index: "02",
    status: null,
    title: "EVV Billing Validation",
    standfirst: "A consistency rule for a service-billing report, and what a flagged record does and does not mean.",
    question:
      "Which records should an analyst investigate before relying on a service-billing report, and how do you keep an arithmetic discrepancy separate from a numerical-comparison artifact?",
    summary:
      "Examined 20,671 service records to identify amount discrepancies and missing identifiers, with an emphasis on reliable validation rules.",
    methods: ["Reconciliation", "Exception analysis", "Data validation"],
    outcome:
      "126 of 20,671 records (0.61%) fail an exact decimal check; all exceed a cent and warrant business-rule review.",
    href: null,
    cover: "orbit",
    caseStudy: {
      context: "Individual academic project",
      role: "Sole creator of the original Tableau analysis",
      tools: ["Tableau"],
      dataPeriod: "January 2023 dataset, as named in the supplied file",
      proof: "20,671 records · 126 review exceptions",
      hero: `${CHART}/evv-validation-summary.webp`,
      heroAlt:
        "Validation summary: 20,671 EVV records checked, 126 amount exceptions, or 0.61 percent.",
      sections: [
        {
          heading: "Overview",
          body: "I created a Tableau analysis of a professor-supplied service-billing dataset. The project explored service amounts and a consistency rule comparing units multiplied by rates with recorded amounts. For the portfolio, the analysis was independently checked using decimal arithmetic to clarify which records warranted review.",
        },
        {
          heading: "The business question",
          body: "Which records should an analyst investigate before relying on a service-billing report? A useful control needs to distinguish an arithmetic discrepancy from a numerical comparison artifact and keep missing identifiers visible.",
        },
        {
          heading: "My contribution",
          body: "I built the original Tableau worksheets and the calculated consistency rule. The original workbook examined service amounts, units over time, and possible outliers. The currency-aware validation and findings below were added during portfolio preparation.",
        },
        {
          heading: "Data and approach",
          body: "The supplied table contains 20,671 rows, with 18 service categories and 60 program values. The review calculated the expected amount as units multiplied by rate, then compared it with the recorded amount using exact decimal arithmetic. It also checked missing client identifiers independently. Only aggregate results are presented here.",
        },
        {
          heading: "What the validation shows",
          body: "Decimal arithmetic identifies 126 amount differences, approximately 0.61% of records; all exceed one cent. Rounding expected amounts to cents produces the same count. Ten records lack client IDs. An independent exact comparison using binary floating-point arithmetic flags 1,978 rows, illustrating how numerical representation can create excess flags. That larger count is a review calculation, not a verified output from the Tableau interface.",
        },
        {
          heading: "Recommendation",
          body: "Use a documented currency rule for reconciliation and retain the underlying difference for investigation. Review exceptions against service definitions, allowable adjustments, and rate conventions before assigning an error category. Track missing identifiers separately and prioritize records only after the relevant business rules are understood.",
        },
        {
          heading: "Scope and limitations",
          body: "The original dataset was supplied by a professor, and its upstream source is not available. Raw records and client identifiers are not included. Arithmetic differences do not establish incorrect billing, fraud, or recoverable funds. No operational corrections or financial savings have been measured.",
        },
        {
          heading: "What this project demonstrates",
          body: "Designing a data-quality control, examining the validity of exception logic, and communicating what a flagged record does and does not establish.",
        },
      ],
      reviewNotes: [
        "Individual authorship confirmed by user in Phase 2.",
        "Source provenance remains unverified; use aggregate exhibits and no raw-data download.",
        "Revise original currency-comparison logic before exposing the workbook.",
        "Replace summed-rate and mixed-unit outlier views with meaningful measures.",
      ],
    },
  },
  {
    id: "airline-delay-analysis",
    slug: "airline-delay-analysis",
    index: "03",
    status: null,
    title: "Airline Delay Analysis",
    standfirst: "Within recorded delayed departures, where the delay time actually sits.",
    question:
      "Within recorded delayed departures, where is delay time concentrated — and what has to be true about the flight population before a metric means anything?",
    summary:
      "Explored 1.94 million delayed-departure records to examine arrival-delay severity and the distribution of recorded delay minutes.",
    methods: ["Exploratory analysis", "Aggregation", "Operational interpretation"],
    outcome:
      "Late aircraft is the largest recorded delay cause by minutes (~31.6M) within the selected 2008 delayed-departure sample.",
    href: null,
    cover: "drift",
    caseStudy: {
      context: "Individual academic project",
      role: "Sole creator of the Tableau analysis",
      tools: ["Tableau"],
      dataPeriod: "2008",
      proof: "1.94M records · Historical 2008 sample",
      hero: `${CHART}/airline-delay-causes.webp`,
      heroAlt:
        "Delay-minute totals by cause: late aircraft 31.56 million, carrier 23.93 million, national aviation system 18.74 million, weather 4.62 million, and security 0.11 million.",
      sections: [
        {
          heading: "Overview",
          body: "I built a Tableau dashboard to explore airline delay patterns across time, carriers, and recorded causes. The case study focuses on severity within a selected delayed-departure dataset and on the questions an operations analyst could investigate next.",
        },
        {
          heading: "The business question",
          body: "Within recorded delayed departures, where is delay time concentrated? The aim is to guide further operational investigation while respecting the limits of the available flight population.",
        },
        {
          heading: "My contribution",
          body: "I created five Tableau worksheets, a dashboard, and a story. The original views explored monthly arrival delays, carriers, time of departure, cause measures, and the relationship between departure and arrival delays. Portfolio preparation independently checked the population and aggregate metrics.",
        },
        {
          heading: "Data and approach",
          body: "The embedded table contains 1,936,758 records from 2008. Every recorded departure delay is at least six minutes, so this is not a complete schedule of flights. The review calculated mean arrival delay from nonmissing observations and summed recorded minutes separately for each cause. Missing values were counted rather than interpreted as zero delay.",
        },
        {
          heading: "What the analysis shows",
          body: "Mean arrival delay is 42.2 minutes across the 1,928,371 records with an arrival-delay value. Late aircraft accounts for about 31.56 million recorded delay minutes, the largest of the five cause totals. Carrier and national aviation system delays follow at approximately 23.93 million and 18.74 million minutes. These are descriptive totals within the selected dataset.",
        },
        {
          heading: "Recommendation",
          body: "Investigate late-aircraft delay further using route, aircraft-rotation, and turnaround information. An operations team could examine where delays propagate between flights and what additional data is needed to evaluate schedule buffers. Obtain all scheduled flights before calculating overall carrier delay rates or comparing punctuality.",
        },
        {
          heading: "Scope and limitations",
          body: "The data is historical and contains only delayed departures. Arrival delay is missing on 8,387 rows, and each cause field is missing on 689,270 rows. Recorded cause totals are not counts of affected flights, and the findings do not demonstrate a reduction in delays.",
        },
        {
          heading: "What this project demonstrates",
          body: "Working with a large dataset, defining the population behind a metric, and translating descriptive findings into focused operational questions.",
        },
      ],
      reviewNotes: [
        "Do not embed the original dashboard until clock-time aggregation and labels are corrected.",
        "Group scheduled departure times into valid hours; never sum HHMM codes.",
        "Separate cancelled/diverted records appropriately in revised views.",
        "Verify scatterplot detail before claiming a flight-level relationship.",
        "Use counts only within the selected sample; do not label them overall punctuality rates.",
      ],
    },
  },
  {
    id: "dealership-ai-quality-plan",
    slug: "dealership-ai-quality-plan",
    index: "04",
    status: null,
    title: "Quality Planning for a Dealership AI Assistant",
    standfirst: "Turning broad quality goals for a proposed assistant into measurable acceptance tests.",
    question:
      "How should a team decide whether a proposed dealership assistant understands customer needs and provides a satisfactory experience?",
    summary:
      "Defined quality metrics and planned tests for a proposed dealership assistant, with a focus on intent understanding and customer experience.",
    methods: ["Quality metrics", "Test planning", "Requirements definition", "Team communication"],
    outcome:
      "Broad quality goals become testable requirements with defined measures, thresholds labelled as proposed, and explicit failure handling.",
    href: null,
    cover: "orbit",
    caseStudy: {
      context: "Academic team project · Proposed solution",
      role: "Quality assurance co-lead",
      tools: [],
      dataPeriod: null,
      proof: "QA co-lead · Metrics and test planning",
      hero: null,
      heroAlt: null,
      sections: [
        {
          heading: "Overview",
          body: "As a quality assurance co-lead on an academic team, I helped plan how a proposed dealership AI assistant would be evaluated. The assistant was intended to answer customer questions, recommend vehicles, and support dealership interactions. My focus was the quality plan and the evidence needed to judge performance.",
        },
        {
          heading: "The business question",
          body: "How should the team decide whether the proposed assistant understands customer needs and provides a satisfactory experience? Broad goals needed clear measures and a repeatable way to review failures.",
        },
        {
          heading: "My contribution",
          body: "I defined quality metrics, planned tests, and prepared and presented the QA slides. My work sat within a wider team plan covering scope, schedule, budget, risks, and communication. The proposal did not establish a completed deployment or an executed evaluation.",
        },
        {
          heading: "The quality approach",
          body: "The original plan proposed simulated conversations after knowledge-base updates, transcript review to identify errors, corrective action, and retesting. It set targets of at least 85% accuracy in understanding intent and at least 4.5/5 customer satisfaction during a pilot. These thresholds were proposed targets, not achieved measurements.",
        },
        {
          heading: "Portfolio refinement",
          body: "The proposed evaluation now distinguishes intent understanding from vehicle-recommendation correctness. Intent understanding would be measured against a labeled set of customer requests. Recommendation quality would require a separate rubric checking the customer's constraints and the inventory information. Pilot satisfaction would be reported with its response count and collection method.",
        },
        {
          heading: "Recommendation",
          body: "Define the test set, scoring rules, and failure categories before evaluating the assistant. Review representative customer requests, include cases with incomplete information, and specify when to ask a clarifying question or refer the customer to staff. Track failures through correction and retesting, with release decisions based on documented evidence.",
        },
        {
          heading: "Scope and limitations",
          body: "This is a quality-planning case study. No deployed assistant, measured accuracy, pilot satisfaction, sales uplift, or workload reduction is claimed. The evaluation matrix accompanying this case is a proposed portfolio extension, not a historical test report.",
        },
        {
          heading: "What this project demonstrates",
          body: "Turning a proposed service into measurable requirements, planning acceptance tests, and communicating quality expectations within a project team.",
        },
      ],
      matrix: {
        title: "Proposed evaluation matrix",
        status: "Proposed portfolio extension; no tests executed",
        rows: [
          {
            requirement: "Understand the customer's intent",
            approach:
              "Score responses against a labeled set of representative requests; report correct classifications divided by scored requests",
            condition:
              "At least 85%, retained from the original plan; test-set size to be specified",
          },
          {
            requirement: "Recommend an appropriate vehicle",
            approach:
              "Compare recommendations with inventory facts and stated customer constraints using a separate rubric",
            condition: "Rubric and threshold to be agreed before testing",
          },
          {
            requirement: "Clarify incomplete requests",
            approach:
              "Test requests with missing budget or preferences and inspect the follow-up",
            condition: "Clarification rules to be agreed before testing",
          },
          {
            requirement: "Support a satisfactory pilot experience",
            approach:
              "Collect ratings using a consistent question and report the number of responses",
            condition:
              "Mean rating at least 4.5/5, retained from the original plan; sample size to be specified",
          },
          {
            requirement: "Handle failed or uncertain answers",
            approach:
              "Categorize failures, define a correction, then repeat the relevant tests",
            condition: "Critical-failure and escalation rules to be agreed before testing",
          },
        ],
      },
      reviewNotes: [
        "User confirmed metrics, test planning, and QA slide preparation/presentation in Phase 2.",
        "Keep all performance thresholds labeled proposed.",
        "Do not claim software implementation, customer interviews, test execution, or compliance certification.",
        "Do not show proposed commercial benefits as achieved outcome counters.",
      ],
    },
  },
];

/* ------------------------------------------------------------------ *
 * 4 · Learning & credentials
 *
 * TO ADD A COURSERA BADGE: set `image` to the badge file you drop into
 * public/media/badges/ (it is drawn uncropped, at its own proportions),
 * fill in `title`, `issuer` and `date`, and set `href` to the Coursera
 * verification URL. The grid grows to fit however many entries exist;
 * nothing else needs changing.
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

// From LinkedIn → Licenses & certifications (Google "UX Design" and the
// Bocconi "Management of Fashion and Luxury Companies" are intentionally
// omitted). `href` is the public verification page for each.
export const credentials: Credential[] = [
  {
    id: "data-visualization-with-r",
    title: "Data Visualization with R",
    issuer: "IBM",
    date: "Dec 2024",
    href: "https://www.coursera.org/account/accomplishments/records/TWL6UO6HFGWS",
  },
  {
    id: "data-analysis-with-r",
    title: "Data Analysis with R",
    issuer: "IBM",
    date: "Dec 2024",
    href: "https://www.coursera.org/account/accomplishments/records/M1THI2353OYJ",
  },
  {
    id: "sql-for-data-science-with-r",
    title: "SQL for Data Science with R",
    issuer: "IBM",
    date: "Nov 2024",
    href: "https://www.coursera.org/account/accomplishments/records/MJ7H6OAU0NTJ",
  },
  {
    id: "intro-to-r-programming",
    title: "Introduction to R Programming for Data Science",
    issuer: "IBM",
    date: "Nov 2024",
    href: "https://www.coursera.org/account/accomplishments/records/FJ1JHMTJ6485",
  },
  {
    id: "data-visualization-dashboard-essentials",
    title: "Data Visualization & Dashboard Essentials",
    issuer: "IBM",
    date: "Nov 2024",
    href: "https://www.credly.com/badges/5f161c0e-8aac-417d-86db-d77d13e4fa84/linked_in_profile",
  },
  {
    id: "data-visualization-excel-cognos",
    title: "Data Visualization and Dashboards with Excel and Cognos",
    issuer: "IBM",
    date: "Nov 2024",
    href: "https://www.coursera.org/account/accomplishments/records/LTZCPQMGBG7O",
  },
  {
    id: "excel-basics-for-data-analysis",
    title: "Excel Basics for Data Analysis",
    issuer: "IBM",
    date: "Nov 2024",
    href: "https://www.coursera.org/account/accomplishments/records/L6LDR5P83HS0",
  },
  {
    id: "introduction-to-data-analytics",
    title: "Introduction to Data Analytics",
    issuer: "IBM",
    date: "Oct 2024",
    href: "https://www.coursera.org/account/accomplishments/records/YFSDSQ8PPKQ6",
  },
  {
    id: "citi-irb-social-behavioral-research",
    title: "IRB – Social and Behavioral Research (Group 2)",
    issuer: "CITI Program",
    date: "Oct 2022 – Oct 2026",
    href: "https://www.citiprogram.org/verify/?w7275ab28-3319-49c5-b038-dcf7eafa89b8-52402704",
  },
];
