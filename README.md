
# SaltShadow — The Winter Storm Crime Scene

**Investigate winter road salt. Compare lower-salt scenarios. Challenge claims that the evidence cannot prove.**

SaltShadow is a HackPrinceton Fall 2026 Sustainability project that turns a documented Princeton-area winter storm into an interactive environmental investigation.

Our goal is simple: help communities explore how road salt is used, compare hypothetical ways to reduce unnecessary salt, and distinguish scientific evidence from assumptions.

> **Our principle:** A plausible connection is not a proven connection. SaltShadow shows what is documented, what is assumed, and what to investigate next.

## The Problem

Road salt helps keep roads usable during winter storms, but chloride can affect freshwater ecosystems.

The challenge is balancing winter road maintenance with environmental protection.

Knowing that a road is near a stream does not prove that salt from that particular road reached the water. Establishing that requires drainage records, salt application logs, water samples, and other evidence.

SaltShadow helps users investigate these questions without turning assumptions into conclusions.

## Our Solution

SaltShadow is an interactive, evidence-first winter road-salt investigation tool.

It combines four stages:

| Stage | What It Does |
| --- | --- |
| **01 — Rewind** | Explore a documented Princeton-area winter storm. |
| **02 — Investigate** | Explore a verified USGS monitoring location and environmental evidence. |
| **03 — Intervene** | Compare hypothetical salt reductions and review published winter-maintenance guidance. |
| **04 — Prove It** | Challenge environmental claims and identify missing evidence. |

## Features

### 1. Rewind — Winter Storm Replay

Explore the January 25–26, 2026 Princeton-area winter storm.

The case is supported by Rutgers climate reporting and NOAA storm-event information.

The interactive timeline illustrates stages of the investigation. It is not a verified hourly weather or chloride measurement series.

### 2. Investigate — Environmental Map

Explore Stony Brook at Princeton, New Jersey.

**USGS monitoring station:** 01401000

The Leaflet/OpenStreetMap interface identifies a documented monitoring location.

A verified station location does not establish that salt from a specific road reached the stream.

SaltShadow keeps this distinction clear.

### 3. Intervene — Salt Scenario Simulator

Explore hypothetical road-salt application strategies.

Inputs include:

- Treated lane-miles
- Salt application rate in lb/lane-mile
- Hypothetical reduction percentage
- Material price per US short ton

The existing calculation engine computes:

- Baseline salt quantity
- Scenario salt quantity
- Salt not applied
- Material-only cost difference

These calculations do not predict road safety or environmental outcomes.

### 4. Salt Use Guidance — NEW

The Salt Use Guidance feature helps users explore the factors that influence winter road-salt application decisions.

Users can enter:

- Pavement temperature in degrees Fahrenheit
- Road condition

SaltShadow displays concise, source-backed guidance using FHWA winter-maintenance information.

It also links to relevant source documents and provides an expandable freshwater explanation.

**Important:** No universal salt application rate is guaranteed to keep roads safe while preventing freshwater pollution.

When available inputs do not support a condition-matched published application rate, the app does not invent or recommend one.

The advisor is an educational tool, not an operational road-treatment prescription.

### 5. Three-Scenario Comparison — NEW

Compare three hypothetical strategies side by side:

- 10% Less Salt
- 20% Less Salt
- 30% Less Salt

Each comparison displays:

- Salt applied
- Salt not applied
- Material-only cost difference

Selecting a preset updates the existing reduction slider and the current scenario used in exports.

Changing to a custom percentage clears the preset selection.

#### Example Calculations

Assume:

- 6 treated lane-miles
- 250 lb of salt per lane-mile
- $105 per US short ton

Baseline: **1,500 lb**

| Reduction | Salt Applied | Salt Not Applied | Material Difference |
| --- | ---: | ---: | ---: |
| 10% | 1,350 lb | 150 lb | $7.88 |
| 20% | 1,200 lb | 300 lb | $15.75 |
| 30% | 1,050 lb | 450 lb | $23.63 |

#### Calculation Formulas

```text
baseline_lb = lane_miles × application_rate

scenario_lb = baseline_lb × (1 - reduction_percent / 100)

not_applied_lb = baseline_lb - scenario_lb

material_difference_usd =
    not_applied_lb / 2000 × price_per_short_ton
```

The numbers are illustrative material comparisons only.

They do not establish that a particular salt reduction is operationally safe or that stream chloride concentrations will decrease by a particular amount.

### 6. Prove It — Evidence Verification

Prove It is SaltShadow's evidence-verification experience.

It distinguishes:

- **MEASURED:** Verified observation with supporting methodology
- **MAPPED:** Verified location or geographic feature
- **INFERRED:** Plausible hypothesis without established proof
- **ASSUMED:** User-entered or simulated input
- **UNKNOWN:** Evidence gap requiring investigation

The application lets users:

1. Select a possible road-to-stream connection.
2. Challenge the environmental claim.
3. View a **NOT PROVEN** verdict when evidence is insufficient.
4. Understand which data is missing.
5. Enable **Documented Evidence Only** to hide unsupported conceptual connections.
6. Restore the hypotheses when desired.
7. Export the evidence brief.

**NOT PROVEN does not mean false.**

It means the available evidence does not establish the claim.

### 7. Evidence and Decision Exports

SaltShadow supports exporting investigation findings.

Exports preserve relevant information such as:

- Case-study context
- Selected hypothetical scenario
- Material calculations
- Evidence classifications
- Source links
- Uncertainty
- Missing evidence
- Suggested next investigation steps

## Technology Stack

- **Frontend:** HTML, CSS, vanilla JavaScript
- **Interactive map:** Leaflet and OpenStreetMap
- **Calculation engine:** JavaScript SaltEngine
- **Guidance module:** salt-guidance.js
- **Evidence verification:** evidence.js, investigation.js, prove-it.js
- **Case-study records:** JSON
- **Testing:** Node.js module tests and browser checks

The website is designed to run as a static frontend.

## How to Run Locally

Clone the repository:

```bash
git clone https://github.com/ToshitDev/SaltShadow.git
cd SaltShadow
```

Start a local server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open:

http://127.0.0.1:8000

The interactive map requires internet access for external map assets.

To test the Salt Use Guidance and three-scenario features before their integration PR is merged, use the `feature/salt-strategy` branch.

## Running Tests

Use Node.js 22 or later.

Run all JavaScript module and integration tests:

```bash
for test in tests/test_*.js tests/test_*.mjs; do
  node "$test" || exit 1
done
```

Run the calculator test:

```bash
node tests/test_engine.js
```

Run the Salt Use Guidance test:

```bash
node tests/test_salt_guidance.js
```

Manual verification should cover the storm replay, USGS station, scenario comparison, salt guidance, Prove It challenge, Documented Evidence Only filter, and evidence export.

## Environmental Evidence and Sources

### Storm Records

- [Rutgers New Jersey State Climate Office — January 2026](https://climate.rutgers.edu/articles/january-2026-report)
- [NOAA Storm Events — Mercer County](https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=1309897)

### Monitoring Location

- [USGS — Stony Brook at Princeton NJ](https://waterdata.usgs.gov/monitoring-location/USGS-01401000/)

### Winter Road Maintenance

- [FHWA — Anti-Icing Practices](https://www.fhwa.dot.gov/publications/research/safety/95202/003.cfm)
- [FHWA — Winter Maintenance Reference Tables](https://www.fhwa.dot.gov/publications/research/safety/95202/006.cfm)
- [NJDOT — Winter Readiness](https://www.nj.gov/transportation/about/winter/)

### Freshwater Chloride

- [EPA — National Recommended Aquatic Life Criteria](https://www.epa.gov/wqc/national-recommended-water-quality-criteria-aquatic-life-criteria-table)

EPA freshwater chloride aquatic-life criteria include:

- **230 mg/L:** chronic criterion
- **860 mg/L:** acute criterion

These are chloride concentrations in water, not road-salt application limits or guarantees of environmental safety.

### Map Attribution

- [OpenStreetMap Contributors](https://www.openstreetmap.org/copyright)

## Scientific Limitations

SaltShadow is an educational investigation and hypothetical scenario-comparison tool.

The current project does not include:

- Verified event-matched chloride measurements for the selected storm
- Verified drainage connectivity from a particular road to Stony Brook
- Actual municipal salt-application records for the scenario
- A validated chloride transport model
- A model establishing road-safety outcomes
- A universally safe salt application rate

The application does not calculate actual stream pollution from hypothetical road-salt reductions.

Missing evidence is treated as unknown, not as zero.

## Project Team

| Team Member | Primary Contribution |
| --- | --- |
| **Toshit** | Frontend, integration, deployment, and demo coordination |
| **Rithvik** | Prove It evidence verification, Salt Use Guidance, and scenario comparison |
| **Hemanth** | Verified storm and environmental monitoring case-study records |
| **Rohan** | Salt simulation engine, calculations, and testing |

## Two-Minute Demonstration

**Rewind:** Introduce the documented Princeton winter storm.

**Investigate:** Show the verified Stony Brook monitoring location and explain what the map does not prove.

**Intervene:** Compare 10%, 20%, and 30% hypothetical salt reductions and review published maintenance guidance.

**Prove It:** Challenge a possible road-to-stream claim, reveal NOT PROVEN, hide unsupported hypotheses, and export the findings.

## Elevator Pitch

**The snow melts. The questions don't.**

SaltShadow helps communities explore smarter road-salt choices while revealing which environmental claims are backed by evidence and which still need investigation.

## HackPrinceton

Built for **HackPrinceton Fall 2026 — Sustainability**.

The Salt Use Guidance and three-scenario comparison additions are developed on `feature/salt-strategy` and are included in the integrated application only after their pull request is merged.
