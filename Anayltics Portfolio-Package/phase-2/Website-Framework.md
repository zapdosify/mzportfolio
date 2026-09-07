# Portfolio website framework

Phase 2 · Zaabi Noor · Business and data analyst portfolio

## The portfolio’s central message

Present Zaabi as an early-career analyst who can frame a business question, inspect the evidence, and explain a useful next decision. Academic context should be visible in the project metadata. The work itself should carry the story through specific methods and findings.

The proposed headline is **Analysis that connects data to business decisions.** Four case studies support it with different evidence: commercial patterns, billing validation, operational analysis, and quality planning. Avoid percentage-based skill ratings, invented client logos, or a work-experience timeline filled with university assignments.

## What this phase delivers

- `Portfolio-Website-Copy.md`: homepage wording, four project cards, four full case studies, and a proposed AI evaluation matrix.
- `website-content.json`: the same core wording in structured fields for a website implementation. Internal review notes are separate from visible copy.
- `assets/`: four original charts created from the verified research calculations. These are portfolio-review visuals, not screenshots of revised Tableau workbooks.

This phase creates the content and design framework. It does not create or publish the website, revise the original Tableau workbooks, or add a SQL project. The new charts use defensible aggregates and can support the drafted case studies independently of the old dashboard views.

## Site structure

| Page or area | Purpose | Content | Action |
|---|---|---|---|
| Homepage introduction | Establish the analyst focus immediately | Name, headline, two-sentence introduction | Explore projects |
| Selected projects | Let the visitor choose relevant evidence | Four cards, each with context, one useful scope fact, short summary, and preview | Read case study |
| About | Explain professional direction | Brief personal introduction and evidenced skills | Continue to contact |
| Contact | Make a next step simple | Supplied email or professional profile | Get in touch |
| Four case-study pages | Show reasoning and contribution | The shared structure below, adapted to each project | Back to projects; next case study |

Use a single homepage with Projects, About, and Contact sections, plus four dedicated case-study pages. Do not add empty pages for a blog, services, testimonials, or work history.

Suggested paths: `/projects/supermarket-promotion-analysis`, `/projects/evv-billing-validation`, `/projects/airline-delay-analysis`, and `/projects/dealership-ai-quality-plan`. These are proposed routes, not existing live links.

## Shared case-study structure

| Order | Section | What the reader should learn | Design guidance |
|---|---|---|---|
| 1 | Title and short overview | What was investigated and why it matters | One clear title and a short paragraph |
| 2 | Project metadata | Academic context, personal role, original tools, data period | Compact text; avoid decorative badges for every skill |
| 3 | Main visual or planning artifact | One supported finding or central deliverable | Static chart for data cases; proposed evaluation matrix for AI |
| 4 | Business question and contribution | The decision and the work Zaabi personally owned | Distinguish individual work from team responsibilities |
| 5 | Data and approach | Population, preparation, and analytical choices | Plain-language explanation; expand technical detail only when useful |
| 6 | Findings or quality approach | What the evidence actually supports | Two or three findings, each with a clear basis |
| 7 | Recommendation | What someone could do next and how to evaluate it | Recommendations remain proposals unless implemented results exist |
| 8 | Scope and limitations | Relevant boundaries on interpretation | Short, visible paragraph rather than a hidden disclaimer |
| 9 | Supporting work | A way to inspect further evidence | Enable links only when the artifact exists and is suitable to share |

For the AI project, “quality approach” and “proposed evaluation” replace an artificial results section. Its deliverable is a plan. Do not display the original commercial targets as achieved KPI counters.

## Project cards and order

| Order | Card | Why it is here | Proof line | Preview |
|---|---|---|---|---|
| 1 | Supermarket Sales & Promotion Planning | Most accessible commercial story with confirmed individual authorship | 1,000 transactions · 3 cities | Hourly transaction-value shares |
| 2 | EVV Billing Validation | Shows precision and data-quality reasoning | 20,671 records · 126 review exceptions | Validation summary |
| 3 | Airline Delay Analysis | Adds scale and operational interpretation | 1.94M records · Historical 2008 sample | Recorded cause minutes |
| 4 | Quality Planning for a Dealership AI Assistant | Shows requirements and a confirmed team contribution | QA co-lead · Metrics and test planning | Short excerpt from the proposed evaluation matrix |

On desktop, use a two-column grid in this order. On mobile, keep the same sequence in one column. Each card needs a readable title and description even if its image is not loaded. Keep a single meaningful link per card. Four projects do not need search, filters, or category tabs.

## Visual system

Use a restrained editorial design: an off-white background, dark navy text, teal emphasis, and muted blue-gray secondary chart marks. The exported assets use `#F7F8FA`, `#172C3D`, `#087F83`, and `#B8CBD4`. Use dark text for small labels; pale blue-gray is for chart fills and supporting shapes.

Favor a readable system sans-serif typeface, generous space between sections, and body text around 17–18 px. Keep long prose near 65–75 characters per line. Limit the main content width to roughly 1,160 px, with narrower case-study text and wider charts. These are starting specifications, to be checked in the actual website.

Use real analytical visuals rather than stock photography, software logos, or decorative AI imagery. Chart captions must identify the period, population, metric, and any material exclusion. Pair each image with HTML text summarizing its finding so the meaning remains accessible.

Do not shrink a complete desktop dashboard into an unreadable card. Use a simplified chart preview and let the case-study page hold the detail. On mobile, preserve the entire chart image with optional enlargement and a text summary; do not crop axis labels to fill a fixed image box.

## Asset specifications and captions

| File | Placement | Suggested visible caption | Status |
|---|---|---|---|
| `assets/supermarket-hourly-share.png` | Retail card and case hero | The 19:00 hour accounts for 12.3% of transaction value in this three-month sample. This identifies a promotion-test candidate, not measured uplift. | Created and checked |
| `assets/supermarket-city-share.png` | Retail supporting evidence | Naypyitaw contributes 34.2% of transaction value; the other two cities each contribute about 32.9%. | Created and checked |
| `assets/evv-validation-summary.png` | EVV card and case hero | Decimal arithmetic identifies 126 amount exceptions among 20,671 records. Exceptions require business-rule review. | Created and checked |
| `assets/airline-delay-causes.png` | Airline card and case hero | Late aircraft has the largest recorded delay-minute total in the selected 2008 data. Missing cause values are excluded from each sum. | Created and checked |
| Proposed AI evaluation matrix in the copy | AI case hero/deliverable | A proposed evaluation framework developed from the academic quality plan; no test results are shown. | Written; render as a native website table |

The charts are 1,920 × 1,080 PNGs. Render the AI matrix as HTML with headers and horizontal scrolling if necessary; do not turn it into a screenshot. Show a small excerpt on its card rather than squeezing the entire table into a preview.

Potential later assets: corrected Tableau screenshots, a supermarket category-by-city view, and an airline hour/day heatmap. These were not created in this phase and should not appear as available downloads or working dashboard links.

## Skill claims and attribution

| Claim | Evidence in the selected work | How to present it |
|---|---|---|
| Tableau | Original individual supermarket, EVV, and airline workbooks | Feature in the project metadata |
| Exploratory analysis | Original Tableau worksheets and business questions | Explain the actual comparisons |
| Data validation | EVV consistency calculation and new portfolio review | Distinguish the original rule from the decimal validation enhancement |
| Business recommendations | Retail and airline case-study reasoning | Describe the decision supported; avoid unmeasured operational outcomes |
| Quality metrics and test planning | AI presentation and user confirmation | QA co-lead; planning and presentation, without claiming execution |
| SQL, Python, or deployed AI development | Not established by these four original projects | Do not add as featured project tools based on the portfolio-building process |

The user confirmed individual creation of supermarket, airline, and EVV work. For the dealership project, the user confirmed defining quality metrics, planning tests, and preparing/presenting the QA slides. Keep the co-lead credit because the original team presentation also names another QA lead.

The new calculations and charts were prepared with AI assistance during this portfolio process. They are not evidence that the user used Python in the original coursework. The public drafts refer to portfolio preparation when introducing these additions.

## Metric definitions

| Metric | Exact basis | Source |
|---|---|---|
| Retail 1,000 transactions | Number of rows in the embedded supermarket CSV | Supermarket packaged workbook |
| Retail 12.3% at 19:00 | Sum of `Total` for hour 19 divided by sum of `Total`; includes tax | Portfolio recalculation from the embedded CSV |
| Retail city shares | City sum of `Total` divided by total across all cities | Same CSV; no currency symbol assumed |
| EVV 126 amount exceptions | Exact decimal `Units × Rate − Amount` is nonzero; all differences also exceed 0.01 | Portfolio recalculation from the professor-supplied CSV |
| EVV 0.61% | 126 / 20,671, rounded to two percentage decimals | Same validation |
| EVV 10 missing IDs | Missing `Client ID` values | Separate check; overlap with amount exceptions is not asserted |
| Airline 1.94M records | 1,936,758 rows, all in 2008 and all departure delays at least six minutes | Airline packaged workbook |
| Airline 42.2 minutes | Mean `ArrDelay` over 1,928,371 nonmissing observations | Portfolio recalculation; selected delayed departures only |
| Airline cause minutes | Sum each named cause column, excluding missing values | Each cause column has 689,270 missing values |
| AI 85% and 4.5/5 | Proposed intent-understanding and pilot satisfaction thresholds | Original quality plan; not observed performance |

## Editorial checks before publication

The drafts are complete as Phase 2 content. The following tasks apply when implementing or launching the site:

1. Use the verified static assets first. Correct and validate the original Tableau views before providing live dashboard or workbook links.
2. Keep EVV at aggregate level. Its professor-supplied origin is known, but its upstream source and redistribution terms are not. Omit raw-data downloads and identifiable record exhibits.
3. Add the user's chosen email, professional-profile link, and résumé if desired. No contact details were invented. Do not render a contact button with an empty destination.
4. Give dates their proper meaning: 2019 and 2008 are dataset periods, not claimed project-completion dates.
5. Keep missing source links and unavailable artifacts out of the visible interface. Never publish placeholder links.
6. Check the actual website on a narrow screen and with keyboard navigation. Verify headings, chart text, link destinations, table accessibility, and readable color contrast.

The original Tableau corrections are documented in each project's `reviewNotes`. They are internal implementation notes, not content for a visitor-facing warning panel.

## Structured content handoff

`website-content.json` separates `homepage`, `projects`, `navigation`, and `contact`. Each project has a stable ID, summary, role, skills, data period, image reference and alternative text, case-study sections, and internal review notes. All projects are marked `draft`; this is editorial status, not a visible label or a publication command.

Image references are relative to this package. The Markdown copy uses absolute image paths for local reading. A website implementation should copy the image files into its public assets directory and resolve the relative references. The AI matrix is included in both the Markdown copy and the structured `evaluationMatrix` field. Implement it as a native table using the exact row content.

The next phase can implement this structure and refine the presentation without changing the underlying claims. Any new analyses, tools, or outcomes should be added only after they are completed and checked.
