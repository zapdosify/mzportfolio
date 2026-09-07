# Portfolio website copy

Phase 2 · Draft content for Zaabi Noor

The following copy is organized for direct transfer into a website. All four projects remain academic work. Supporting metrics added in the portfolio review are identified as such. Publication tasks and asset specifications are in the separate framework document.

## Homepage

**Eyebrow:** Business & Data Analytics

**Headline:** Analysis that connects data to business decisions.

I use data to investigate business questions, evaluate evidence, and communicate practical recommendations. Explore my academic projects in retail analytics, service-billing validation, airline operations, and quality planning.

**Buttons:** Explore projects · About me

### Selected projects

Four academic case studies showing the question, the analysis, and the decision it supports.

#### Supermarket Sales & Promotion Planning

Analyzed 1,000 supermarket transactions to identify sales patterns by time and city, and frame a measurable promotion test.

**Context:** Individual academic project  
**Evidence:** 1,000 transactions · 3 cities  
**Link:** Read case study

#### EVV Billing Validation

Examined 20,671 service records to identify amount discrepancies and missing identifiers, with an emphasis on reliable validation rules.

**Context:** Individual academic project  
**Evidence:** 20,671 records · 126 review exceptions  
**Link:** Read case study

#### Airline Delay Analysis

Explored 1.94 million delayed-departure records to examine arrival-delay severity and the distribution of recorded delay minutes.

**Context:** Individual academic project  
**Evidence:** 1.94M records · Historical 2008 sample  
**Link:** Read case study

#### Quality Planning for a Dealership AI Assistant

Defined quality metrics and planned tests for a proposed dealership assistant, with a focus on intent understanding and customer experience.

**Context:** Academic team project · Proposed solution  
**Evidence:** QA co-lead · Metrics and test planning  
**Link:** Read case study

### About me

I’m building a career in business and data analytics. My university work includes individual Tableau analyses and a team project in quality assurance planning. I’m interested in roles where I can investigate a problem, check the evidence, and make the findings clear to people making decisions.

### Contact

**Let’s talk about an analyst opportunity.**

I’m interested in business analyst and data analyst roles.

**Button:** Get in touch

## Supermarket Sales & Promotion Planning

**Context:** Individual academic project  
**My role:** Sole creator of the Tableau analysis  
**Skills:** Exploratory analysis, Time-based analysis, Business recommendations  
**Original tools:** Tableau

![Hourly shares of supermarket transaction value; 19:00 is highest at 12.3 percent.](C:/Users/zab/Documents/Codex/2026-09-06/i-ne/outputs/phase-2/assets/supermarket-hourly-share.png)

### Overview

I built a Tableau analysis to explore when and where a supermarket generated sales. The aim was to help a retail manager identify promising promotion tests using transaction patterns across time, cities, and product categories. This case study revisits the university project with independently recalculated findings from the portfolio review.

### The business question

Which trading periods and locations deserve closer attention when planning a promotion? The analysis needed to distinguish observed demand from evidence that a promotion would generate additional sales.

### My contribution

I created the Tableau worksheets, dashboard, and story, and framed the business questions. The original analysis explored daily, monthly, and hourly sales, product categories by city, and customer ratings.

### Data and approach

The embedded dataset contains 1,000 transactions across Mandalay, Naypyitaw, and Yangon from 1 January to 30 March 2019. Portfolio checks found no missing cells or duplicate full rows. Transaction values were grouped by hour and city, with each group expressed as a share of the total including tax. A separate review examined the transaction-level association between ratings and transaction value.

### What the analysis shows

The 19:00 hour contributes 12.3% of observed transaction value, the largest hourly share. Naypyitaw contributes 34.2%, while the other two cities each contribute about 32.9%; the sales mix is relatively balanced. Ratings have little linear association with transaction value in this sample (Pearson correlation approximately −0.036). These findings were recalculated during portfolio preparation.

### Recommendation

Use the evening peak as one candidate for a promotion test, alongside a comparison period. Define success using incremental margin after promotion costs, and track transaction volume and average basket value as supporting measures. A test needs a suitable comparison group or randomized allocation so ordinary trading patterns are not mistaken for promotional impact.

### Scope and limitations

The dataset contains no campaign exposure or response information, so it cannot establish campaign uplift. Three months do not establish annual seasonality. Currency is not confirmed; the visuals use shares rather than currency symbols.

### What this project demonstrates

Framing a commercial question, exploring transaction patterns in Tableau, and distinguishing an actionable hypothesis from a proven result.

![City shares of supermarket transaction value.](C:/Users/zab/Documents/Codex/2026-09-06/i-ne/outputs/phase-2/assets/supermarket-city-share.png)

## EVV Billing Validation

**Context:** Individual academic project  
**My role:** Sole creator of the original Tableau analysis  
**Skills:** Reconciliation, Exception analysis, Data validation  
**Original tools:** Tableau

![Validation summary: 20,671 EVV records checked, 126 amount exceptions, or 0.61 percent.](C:/Users/zab/Documents/Codex/2026-09-06/i-ne/outputs/phase-2/assets/evv-validation-summary.png)

### Overview

I created a Tableau analysis of a professor-supplied service-billing dataset. The project explored service amounts and a consistency rule comparing units multiplied by rates with recorded amounts. For the portfolio, the analysis was independently checked using decimal arithmetic to clarify which records warranted review.

### The business question

Which records should an analyst investigate before relying on a service-billing report? A useful control needs to distinguish an arithmetic discrepancy from a numerical comparison artifact and keep missing identifiers visible.

### My contribution

I built the original Tableau worksheets and the calculated consistency rule. The original workbook examined service amounts, units over time, and possible outliers. The currency-aware validation and findings below were added during portfolio preparation.

### Data and approach

The supplied table contains 20,671 rows, with 18 service categories and 60 program values. The review calculated the expected amount as units multiplied by rate, then compared it with the recorded amount using exact decimal arithmetic. It also checked missing client identifiers independently. Only aggregate results are presented here.

### What the validation shows

Decimal arithmetic identifies 126 amount differences, approximately 0.61% of records; all exceed one cent. Rounding expected amounts to cents produces the same count. Ten records lack client IDs. An independent exact comparison using binary floating-point arithmetic flags 1,978 rows, illustrating how numerical representation can create excess flags. That larger count is a review calculation, not a verified output from the Tableau interface.

### Recommendation

Use a documented currency rule for reconciliation and retain the underlying difference for investigation. Review exceptions against service definitions, allowable adjustments, and rate conventions before assigning an error category. Track missing identifiers separately and prioritize records only after the relevant business rules are understood.

### Scope and limitations

The original dataset was supplied by a professor, and its upstream source is not available. Raw records and client identifiers are not included. Arithmetic differences do not establish incorrect billing, fraud, or recoverable funds. No operational corrections or financial savings have been measured.

### What this project demonstrates

Designing a data-quality control, examining the validity of exception logic, and communicating what a flagged record does and does not establish.

## Airline Delay Analysis

**Context:** Individual academic project  
**My role:** Sole creator of the Tableau analysis  
**Skills:** Exploratory analysis, Aggregation, Operational interpretation  
**Original tools:** Tableau

![Delay-minute totals by cause: late aircraft 31.56 million, carrier 23.93 million, national aviation system 18.74 million, weather 4.62 million, and security 0.11 million.](C:/Users/zab/Documents/Codex/2026-09-06/i-ne/outputs/phase-2/assets/airline-delay-causes.png)

### Overview

I built a Tableau dashboard to explore airline delay patterns across time, carriers, and recorded causes. The case study focuses on severity within a selected delayed-departure dataset and on the questions an operations analyst could investigate next.

### The business question

Within recorded delayed departures, where is delay time concentrated? The aim is to guide further operational investigation while respecting the limits of the available flight population.

### My contribution

I created five Tableau worksheets, a dashboard, and a story. The original views explored monthly arrival delays, carriers, time of departure, cause measures, and the relationship between departure and arrival delays. Portfolio preparation independently checked the population and aggregate metrics.

### Data and approach

The embedded table contains 1,936,758 records from 2008. Every recorded departure delay is at least six minutes, so this is not a complete schedule of flights. The review calculated mean arrival delay from nonmissing observations and summed recorded minutes separately for each cause. Missing values were counted rather than interpreted as zero delay.

### What the analysis shows

Mean arrival delay is 42.2 minutes across the 1,928,371 records with an arrival-delay value. Late aircraft accounts for about 31.56 million recorded delay minutes, the largest of the five cause totals. Carrier and national aviation system delays follow at approximately 23.93 million and 18.74 million minutes. These are descriptive totals within the selected dataset.

### Recommendation

Investigate late-aircraft delay further using route, aircraft-rotation, and turnaround information. An operations team could examine where delays propagate between flights and what additional data is needed to evaluate schedule buffers. Obtain all scheduled flights before calculating overall carrier delay rates or comparing punctuality.

### Scope and limitations

The data is historical and contains only delayed departures. Arrival delay is missing on 8,387 rows, and each cause field is missing on 689,270 rows. Recorded cause totals are not counts of affected flights, and the findings do not demonstrate a reduction in delays.

### What this project demonstrates

Working with a large dataset, defining the population behind a metric, and translating descriptive findings into focused operational questions.

## Quality Planning for a Dealership AI Assistant

**Context:** Academic team project · Proposed solution  
**My role:** Quality assurance co-lead  
**Skills:** Quality metrics, Test planning, Requirements definition, Team communication  
**Deliverable:** Quality plan and presentation

### Overview

As a quality assurance co-lead on an academic team, I helped plan how a proposed dealership AI assistant would be evaluated. The assistant was intended to answer customer questions, recommend vehicles, and support dealership interactions. My focus was the quality plan and the evidence needed to judge performance.

### The business question

How should the team decide whether the proposed assistant understands customer needs and provides a satisfactory experience? Broad goals needed clear measures and a repeatable way to review failures.

### My contribution

I defined quality metrics, planned tests, and prepared and presented the QA slides. My work sat within a wider team plan covering scope, schedule, budget, risks, and communication. The proposal did not establish a completed deployment or an executed evaluation.

### The quality approach

The original plan proposed simulated conversations after knowledge-base updates, transcript review to identify errors, corrective action, and retesting. It set targets of at least 85% accuracy in understanding intent and at least 4.5/5 customer satisfaction during a pilot. These thresholds were proposed targets, not achieved measurements.

### Portfolio refinement

The proposed evaluation now distinguishes intent understanding from vehicle-recommendation correctness. Intent understanding would be measured against a labeled set of customer requests. Recommendation quality would require a separate rubric checking the customer’s constraints and the inventory information. Pilot satisfaction would be reported with its response count and collection method.

### Recommendation

Define the test set, scoring rules, and failure categories before evaluating the assistant. Review representative customer requests, include cases with incomplete information, and specify when to ask a clarifying question or refer the customer to staff. Track failures through correction and retesting, with release decisions based on documented evidence.

### Scope and limitations

This is a quality-planning case study. No deployed assistant, measured accuracy, pilot satisfaction, sales uplift, or workload reduction is claimed. The evaluation matrix accompanying this case is a proposed portfolio extension, not a historical test report.

### What this project demonstrates

Turning a proposed service into measurable requirements, planning acceptance tests, and communicating quality expectations within a project team.

### Proposed evaluation matrix

This matrix is a portfolio extension of the original quality plan. No tests or results are recorded here.

| Requirement | Evaluation approach | Proposed acceptance condition |
|---|---|---|
| Understand the customer’s intent | Score responses against a labeled set of representative requests; report correct classifications divided by scored requests | At least 85%, retained from the original plan; test-set size to be specified |
| Recommend an appropriate vehicle | Compare recommendations with inventory facts and stated customer constraints using a separate rubric | Rubric and threshold to be agreed before testing |
| Clarify incomplete requests | Test requests with missing budget or preferences and inspect the follow-up | Clarification rules to be agreed before testing |
| Support a satisfactory pilot experience | Collect ratings using a consistent question and report the number of responses | Mean rating at least 4.5/5, retained from the original plan; sample size to be specified |
| Handle failed or uncertain answers | Categorize failures, define a correction, then repeat the relevant tests | Critical-failure and escalation rules to be agreed before testing |
