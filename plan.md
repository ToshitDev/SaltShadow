# SaltShadow 2.0 — The Winter Storm Crime Scene

**HackPrinceton Fall 2026 | Four-person execution and integration plan | Updated November 14, 2026 (evening)**

> **One-line pitch:** SaltShadow lets a community replay a documented winter storm, investigate possible road-salt impacts on a stream, test a hypothetical lower-salt treatment plan, and challenge every claim with a **Prove It** evidence audit.
>
> **Judge's question:** “Can you protect this stream before the next snowstorm—and prove why your plan makes sense?”

**Primary track:** Sustainability (**one** main track permitted). **Potential sponsor prizes:** Amazon Practical AI (only with working practical AI), Peri Forward Deployed Challenge (only with a documented qualifying consultation), **MLH Best Domain Name from GoDaddy Registry** (only after qualifying domain registration), and **ChatOverflow Agent Leaderboard** (only after an agent is genuinely connected to the event leaderboard). **ChatOverflow is an independent coding-agent leaderboard, not a feature required inside SaltShadow; its prize listing says no additional project or submission is necessary.** The project may enter multiple eligible sponsor prizes, but no add-on may delay P0 or the 8:00 AM deadline.

**Hard submission deadline:** **Sunday, November 15, 2026, 8:00 AM America/New_York**. Submit a public GitHub repository created November 13–15; prepare a live **≤2-minute** in-person demonstration. Video **≤2 minutes** is optional. Follow the full hackathon rules/handbook.

**Six mandatory execution fixes in this revision:** (1) source-audited flagship case or strict fallback; (2) Rithvik's *visible* Prove It end-to-end demo; (3) a named four-person role/file/schema contract; (4) baseline deployment by 10 PM; (5) optional sponsor work off critical path; and (6) an eight-step acceptance test on the deployed URL.

**Unverified assumption:** The uploaded plan describes a `saltshadow_mvp/` prototype, but the team's actual shared GitHub repository has **not been inspected here**. Confirm existing files before assigning Codex tasks or claiming completion.

---

## 1. Product definition: one outstanding case, not a city-wide prediction engine

### Target user
A local watershed advocate, public works team, or environmental student organization that must explain possible salt-related stream impacts and decide **where to collect more evidence** before choosing interventions.

### Problem
Deicing salt is useful for winter safety but can contribute chloride to freshwater. Historical weather records, water samples, municipal GIS, and treatment decisions live in different places. An operator needs an intelligible, defensible investigation rather than an unsupported AI accusation against a specific road.

### Our differentiator
**Winter Storm Crime Scene + Prove It:** Real observations are linked to a transparent hypothesis workflow and an interactive *scenario*, not a fabricated prediction. When a judge questions an apparent road-to-stream link, unsupported claims visibly disappear and SaltShadow proposes the next measurement needed to test them.

### Core loop (must work end-to-end)
1. **REWIND** — Pick a historically documented storm and display accurately sourced weather observations/records with dates, station, units, and source.
2. **INVESTIGATE** — Select one real water-monitoring location. Display sourced chloride samples *only if confirmed for that exact location and dates*. Identify nearby road/drainage features **as candidates**, not confirmed pollutant sources.
3. **INTERVENE** — Change a labeled **hypothetical** salt-application quantity. Calculate salt **not applied** and material-only cost difference. Show an explicit road-safety review gate.
4. **PROVE IT** — Reveal claim-by-claim provenance, hide inferred/fictional layers, display missing evidence and propose a sampling/check plan. Export a short decision brief.

**Winning demo moment:** The judge clicks a convincing-looking possible runoff connection. Then clicks **Prove It**. SaltShadow says **“Not proven”**, shows the source of each underlying fact, removes the unsupported connection, and explains what real field data would establish or refute it.

---

## 2. Scope freeze (work on P0 before anything else)

| Priority | Deliverable | Done when |
|---|---|---|
| **P0** | **One honest case-study record** | Storm, stream location, timestamps, and provenance are explicit; no fabricated value is presented as measured |
| **P0** | **Real storm timeline** | User can select/step/replay the event; recorded data and illustration are visually distinguished |
| **P0** | **Interactive map** | Real site is located accurately; any candidate geography is labeled; map works on demo network |
| **P0** | **Hypothetical intervention** | Slider recalculates deterministic salt mass and material costs, with correct units and safety disclaimer |
| **P0** | **Prove It panel (Rithvik)** | **Visible end-to-end:** click claim → source/status/limits → challenge → `Not proven` → `Documented only` hides linked map feature → next evidence check; test passes on deployed URL |
| **P0** | **Decision brief export** | Summary includes observations, assumptions, calculated values, source URLs, caveats, and recommended next evidence to collect |
| **P0** | **2-minute, offline-tolerant demo** | Full flow can be shown from locally packaged assets with a fallback screenshot/video for map-tile failure |
| **P1** | Verified site-matched chloride ingestion | At least one dated source-audited measurement imported with exact station, method, units, and original source |
| **P1** | Rule-based investigation planner | Generates plausible sampling/check steps only from actual user-selected hypotheses and known missing data |
| **P1** | Real AI tool-use | LLM invokes bounded evidence-query and calculator functions, never writes unsupported numerical claims |
| **P1** | Peri validation | Real customer consultation, recorded with permission and a visible resulting product adjustment |
| **P2 — optional sponsor** | GoDaddy Registry domain entry | Verify eligible registration process/TLD, register a domain with approval, link it to the existing deployment if low-risk, record proof and opt in if required; time-box to 20 minutes |
| **P2 — optional sponsor** | ChatOverflow coding-agent leaderboard | With team consent, verify official hackathon setup, connect a Codex/Claude Code/Cursor agent, confirm its appearance or connected status on the event leaderboard, and contribute only genuine, useful coding learnings; time-box to 20–30 minutes |
| **P2** | Advanced hydrology / road safety optimization | **OUT OF SCOPE** for this hackathon without verified model and operational inputs |

**Do not build:** city-wide road-salt application predictions; guaranteed safe salting rates; automated claims of specific-road causation; real-time water chloride forecasts; “verified” storm drain paths without connectivity/flow data; carbon credit functionality; a generic chatbot disconnected from evidence.

---

## 3. Build on the existing project; don't rewrite it

**Prototype directory named in the original plan:** `saltshadow_mvp/` (**verify against the actual shared GitHub repository before work**).

- `index.html`: responsive dashboard and map shell.
- `styles.css`: established design language.
- `app.js`: storm replay, map, chart, slider, evidence toggle, export UI.
- `engine.js`: tested deterministic salt/cost calculations and CSV parser.
- `tests/test_engine.js`: unit tests.
- `data/chloride_template.csv`: explicitly **fictional examples**, not validated samples.
- `README.md` and `TEAM_HANDOFF.md`: run and presentation instructions.

**Status from the supplied plan, not an audit of your friend’s GitHub repository:** Storm timeline/animations are illustrative, the default chloride chart is fictional and labeled, the USGS Stony Brook site is real but no matched continuous chloride series is verified, imported chloride CSV is not independently verified, and no end-to-end real source attribution has been established. A separately generated local prototype does not prove the shared repository has those features. **Audit the actual repo immediately** and preserve these notices until the evidence actually changes.

### Recommended implementation approach

Use the current **plain HTML/CSS/JavaScript** stack and Leaflet map for speed. Keep `engine.js` the deterministic calculator. Add a small data/provenance module and `Prove It` UI. **Do not spend precious hackathon hours migrating to React or FastAPI** unless a real integration specifically needs a backend. A static frontend can deploy to GitHub Pages or Netlify; if a secret-keyed LLM API is added, proxy calls through a tiny backend/serverless function—never expose keys in browser JavaScript.

Suggested additive files:

```text
saltshadow_mvp/
├── index.html
├── styles.css
├── app.js
├── engine.js
├── evidence.js             # claim/evidence types, status rules, audit renderer
├── investigation.js        # deterministic next-step/check-plan logic
├── data/
│   ├── case_study.json     # one selected event, site, sources and caveats
│   ├── chloride_template.csv
│   └── verified_samples.csv  # ONLY if fully sourced; otherwise absent
├── tests/
│   ├── test_engine.js
│   ├── test_evidence.js
│   └── test_investigation.js
├── README.md
└── TEAM_HANDOFF.md
```

---

## 3A. Critical fix: four-person ownership, integration contract, and deployment from hour one

**STOP/GO gate — do these before large Codex tasks.** All four developers must acknowledge this section in chat. Whoever created the shared GitHub repository posts: **repo URL, branch, folder layout, currently working features, deployment URL, and any unstaged changes**. The integration owner makes a short, honest status list: **working / incomplete / missing / blocked**. None of the proposed ownership below is confirmed until the team agrees.

### Four-person work split (confirm actual names)

| Owner | Workstream / accountable result | Primary files or areas | Hand-off to integrator |
|---|---|---|---|
| **Hemanth — evidence lead** | Validate ONE storm/site case. Find matching dated chloride records **only if they exist**, else deliver explicit monitoring-gap fallback. Confirm source URLs, station, dates, units and limitations. | `data/case_study.json`, candidate sample files, source registry | Valid JSON + source verification notes + no unsupported measurements |
| **Rithvik — Prove It lead** | Build an **end-to-end visible** claim inspector, `Documented only` control, unsupported-map-connection removal, investigation next-step output and tests. | `evidence.js`, `investigation.js`, `tests/test_evidence.js`, `tests/test_investigation.js`; *small, reviewed integration patches* to shared UI files | A judge can click claim → read evidence → challenge → hide connection → view next check |
| **Developer 3 — visualization lead (assign name)** | Maintain storm replay, Leaflet map, feature layers, scenario slider, and responsive presentation. Consume the shared evidence IDs/statuses—no separate invented data objects. | `index.html`, `styles.css`, map/timeline portions of `app.js` | Map and controls react correctly to evidence filter and current scenario |
| **Developer 4 — integration/release lead (assign name)** | Deploy immediately; own `main` merges, branch conflict resolution, export integration, regression tests, backup demo, README/Devpost and final handoff. | GitHub/hosting config, shared `app.js` integration, export wiring, README, submission | Stable live URL, test log, two-minute run and confirmed entry |

**If someone already owns a feature:** keep their work and change this table; don't double-implement. One integration owner exclusively approves changes to shared `index.html`/`app.js`/`styles.css`. Rithvik should implement evidence logic behind exported functions, then request the smallest necessary app/UI integration patch with clear instructions. Hemanth owns the source data; no one else silently changes verified values or evidence status.

### Branches and merge policy

- Start from current `main`: `git fetch origin && git switch -c feature/<workstream>` (or use the team's actual default branch). Do not run destructive reset or force-push commands.
- Suggested branches: `feature/verified-case` (Hemanth), `feature/prove-it` (Rithvik), `feature/map-scenario` (visualization), `integration/demo-ready` or main-only merges (integrator).
- One issue/PR per deliverable, with a short demo clip or screenshot, exact files changed, test command/result, and known limitations. PRs do not merge with failing essential tests.
- Integrator coordinates shared HTML/CSS/JS integration, merges small changes frequently and checks the deployed URL **after every merge**. Do not work on four isolated branches until 3 AM.
- If GitHub Pages requires a `/docs` directory or root static files, choose and document that convention **now**. Preserve the current frontend stack (HTML/CSS/JS + Leaflet), and avoid rewrites.

### Freeze the shared `data/case_study.json` contract before coding

The team should use a **single JSON file/schema** (adapt existing names carefully rather than breaking live code). Example below shows a **fictional hypothesis object and real station ID**, not an actual observed chloride measurement:

```json
{
  "schemaVersion": 1,
  "caseId": "princeton-nj-2026-winter-storm",
  "event": {
    "name": "January 2026 Princeton winter storm",
    "startDate": "2026-01-25",
    "endDate": "2026-01-26",
    "sourceUrl": null,
    "recordType": "DOCUMENTED_EVENT_PENDING_SOURCE_AUDIT"
  },
  "site": {
    "stationId": "USGS-01401000",
    "name": "Stony Brook monitoring location",
    "sourceUrl": "https://waterdata.usgs.gov/monitoring-location/USGS-01401000/"
  },
  "observations": [],
  "claims": [
    {
      "id": "hypothesis-runoff-001",
      "text": "A nearby road may contribute chloride to this stream",
      "status": "INFERRED",
      "verified": false,
      "sourceName": null,
      "sourceUrl": null,
      "observedAt": null,
      "stationId": null,
      "units": null,
      "method": null,
      "uncertainty": "Road-to-stream drainage connectivity is not established",
      "nextEvidenceNeeded": "Confirm drainage pathways and obtain site-matched chloride samples",
      "featureIds": ["candidate-link-001"]
    }
  ],
  "mapFeatures": [
    {
      "id": "candidate-link-001",
      "kind": "HYPOTHETICAL_CONNECTION",
      "claimId": "hypothesis-runoff-001",
      "status": "INFERRED",
      "geometry": null,
      "showAsVerified": false
    }
  ],
  "scenarioDefaults": {
    "laneMiles": 6,
    "rateLbPerLaneMile": 250,
    "reductionPct": 20,
    "priceUsdPerShortTon": 105,
    "status": "ASSUMED"
  }
}
```

**Schema and UI rules:**

- `event` is a sourced historical event **only after** Hemanth supplies and verifies a direct supporting reference; the placeholder `sourceUrl: null` must not be presented as a verified measurement.
- `observations: []` means **no event-matched chloride observations established**. Only add dated chloride records with original site/source/method/units; never silently fill with invented or smoothed values. Keep synthetic classroom samples separately labeled.
- `claims[].id` uniquely identifies the statement. `featureIds[]` links it to map overlays; `mapFeatures[].claimId` points back. No ID mismatches or duplicated IDs.
- `MEASURED` requires a real measurement; `MAPPED` means a documented place/feature; `INFERRED`, `ASSUMED` and `UNKNOWN` **must never look verified**. Map `geometry: null` means no alleged connection is rendered until a deliberately labeled diagram is created, not a genuine Princeton route.
- **Documented only** hides map features tied to `INFERRED`, `ASSUMED`, or `UNKNOWN` and updates the interface without changing the underlying records. Scenario sliders may remain but are explicitly labeled hypothetical.
- **Prove It output contract:** `claimId`, status, source link if available, what is supported, what is *not* established, and `nextEvidenceNeeded`. It must trigger visibility changes in the real map, not just display text.
- **Scenario engine contract:** `SaltEngine.calculate(...)` remains the single deterministic source of truth for material and cost calculations. The export consumes current outputs and evidence status; it must not generate novel numerical claims.
- Hemanth and Rithvik jointly approve any schema changes; integrator coordinates interface updates. Freeze v1 within 30 minutes of kickoff. Write a minimal schema test/JSON-load test.

### Deployment gate — mandatory, not a final task

**By 10:00 PM ET Saturday, Nov 14:** the integration owner deploys the **existing baseline**, even if incomplete, to GitHub Pages or Netlify; shares a real HTTPS URL; and verifies it on a second browser/device. This is an operational target, **not a claim it is currently deployed**.

- Deploy every merged feature, ideally automatically on push; check the URL after each merge.
- Do not put credentials in public HTML/JS. Keep a localhost fallback and a screenshot/video of the core path in case tiles or hosting fail.
- At 12:30 AM, 2:00 AM, and feature-freeze, the integration owner conducts a fresh-browser smoke test. Never leave deployment until 4 AM.

---

## 4. Evidence contract — the product's most important feature

### Every claim has a provenance object

In the shared v1 JSON contract above, `claims[]` is the authoritative source; do not invent an incompatible claim model in each module. This standalone object is a **mapped station-location claim**, not a chloride measurement:

```json
{
  "id": "station-location-001",
  "text": "USGS identifies a Stony Brook monitoring station at this location",
  "status": "MAPPED",
  "verified": true,
  "sourceName": "USGS Water Data",
  "sourceUrl": "https://waterdata.usgs.gov/monitoring-location/USGS-01401000/",
  "observedAt": null,
  "stationId": "USGS-01401000",
  "units": null,
  "method": null,
  "uncertainty": "Station location alone does not establish chloride data for this storm",
  "nextEvidenceNeeded": "Find dated chloride measurements for the same station and event",
  "featureIds": []
}
```

Allowed `status` values: `MEASURED`, `MAPPED`, `INFERRED`, `ASSUMED`, `UNKNOWN`. Set `verified: true` **only when the specific claim and source are independently checked**, not merely because a URL exists.

**Important:** A station's *mapped location* should ordinarily be `MAPPED`; this does **not** establish that it measured chloride at the displayed time. `MEASURED` is reserved for sourced measured data. One field can be mapped, while a corresponding sample is measured: separate those into two claims.

### Status rules
- **MEASURED** = verified actual observation, with original data/date/site/units/method.
- **MAPPED** = verified published geographic feature, without assuming network flow or source responsibility.
- **INFERRED** = hypothesis from proximity/time/other evidence; never automatically promoted to causal fact.
- **ASSUMED** = entered or simulated scenario inputs; always visibly marked.
- **UNKNOWN** = unresolved or not accessible; show the gap rather than inventing values.

### Prove It interaction
Each case-study statement is clickable. Panel fields: **Claim**, **Status**, **Primary source**, **Why we think this**, **What this does *not* establish**, and **Next field or data check**. Buttons: **Documented only**, **Show all hypotheses**, **Export evidence brief**.

A verified-only filter removes **INFERRED, ASSUMED, and UNKNOWN visual connections**, not necessarily every scenario input (scenario controls remain but clearly marked as assumptions). An unverified claim must never remain visually indistinguishable from a confirmed fact.

### Data-quality stop signs
- Never fabricate a “real-time chloride sensor” for Stony Brook. The sourced USGS station supports flow; a matching continuous chloride record has not been established.
- Don't infer a road-to-stream drain path from geographic closeness or elevation alone; underground pipes may not follow surface grade.
- Verify every GIS layer's **city, bounding box, CRS, coordinate range, and license**. A `storm_lines` ArcGIS layer previously found in a **Texas North Central** coordinate system is **not** Princeton, NJ. Do not reuse it.
- Do not convert conductivity to chloride mg/L without a valid site-specific calibration and appropriate caveats.
- A single chloride reading is not proof of EPA acute/chronic threshold exceedance; averaging-period and sample-method requirements matter.
- Salt Watch strip readings can be range-limited/censored; do not replace a “greater than” or “less than” bound with an exact value.
- No scenario proves road safety. Treatment plans require human professional review, including road conditions, forecast, pavement temperature, traffic, and local policy.

---

## 5. Real data acquisition: a strict, fast decision tree

### Target: ONE usable case, not a large dataset

**Hemanth's exclusive P0 deadline: 11:00 PM ET.** By then, deliver a source-audited station/event pair and either **(A) valid site-matched, storm-timed chloride observations** or **(B) a fully explicit monitoring-gap case with no manufactured chloride trend**. Make a go/no-go call rather than searching indefinitely. Relevant samples from different dates can be shown only as separately labeled context, never as a storm response. The demonstration must remain compelling in fallback B: real event + mapped monitoring site + missing-connection hypothesis + evidence investigation plan.


**A. Site and data (first priority):**
1. Check official NJ Salt Watch/Watershed Institute maps for **source-visible individual chloride observations**. Record station name/coordinates, exact sample dates, value or censored interval, and method; confirm reuse permissions and whether downloading is allowed.
2. Check the **Water Quality Portal** for properly qualified, location-specific **chloride** samples within a suitable event window. Do not infer a time series from one sample.
3. If only verified *discrete* samples are available, plot them as isolated markers/dots at their actual dates, not a misleading smooth storm-response line.
4. If no case with matched measurements is available quickly, run a **documented weather-event investigation + explicit “chloride data unavailable here” state** and present the sample chart only in a labeled teaching/demo mode. Don't waste the entire build chasing inaccessible data.

**B. Weather:** Use sourced historical readings from a real nearby weather station or documented winter event. Clearly state whether precipitation/temperature are measured, daily, hourly, or only descriptive. Never invent minute-by-minute weather.

**C. Geography:** Use real published road, stream, and site geometry as map layers (with attribution). Display Princeton's official stormwater map via a link if no valid feature export is available. No invented Princeton drain connections.

**D. Salt use:** Until the city's actual maintenance logs are available, all application quantities are **illustrative user-editable assumptions**; cost estimates are material-only.

### Candidate primary source registry
- Princeton official GIS: https://princetonnj.gov/1845/GIS-Maps-and-Apps
- NJ Salt Watch: https://njwatershedwatch.org/road-salt/
- Water Quality Portal API docs: https://www.waterqualitydata.us/webservices_documentation/
- USGS Stony Brook, station `01401000`: https://waterdata.usgs.gov/monitoring-location/USGS-01401000/
- NOAA Climate Data Online: https://www.ncei.noaa.gov/cdo-web/
- NJDEP stream/chemistry programs: https://dep.nj.gov/wms/bfbm/river-streams-chemical-monitoring/
- NJDEP open GIS: https://gisdata-njdep.opendata.arcgis.com/
- OpenStreetMap (attribution requirements): https://www.openstreetmap.org/copyright
- EPA recommended chloride criteria: https://www.epa.gov/wqc/national-recommended-water-quality-criteria-aquatic-life-criteria-table

**Source URL existence does not imply data access or matching measurements.** For each imported record, store a direct original record link and a note of how it was validated.

---

## 6. Scenario engine: calculation, not a water-quality prediction

Keep existing `SaltEngine.calculate()` and tests. For user-editable assumptions:

```text
baseline_salt_lb  = treated_lane_miles × rate_lb_per_lane_mile
scenario_salt_lb  = baseline_salt_lb × (1 − reduction_percent / 100)
salt_not_applied  = baseline_salt_lb − scenario_salt_lb
material_savings  = (salt_not_applied / 2000) × salt_price_USD_per_short_ton
```

**Show baseline versus scenario** and a visible badge: “Scenario assumptions, not real municipal applications.” Show three outcome rows:

- Salt applied / salt not applied: **calculated hypothetical amounts**.
- Cost difference: **calculated materials-only estimate**.
- Change in chloride concentration / safe road conditions: **NOT MODELED / NOT VALIDATED**.

Add warnings when an entered reduction is presented as an operational recommendation; never use green “safe” badges for an unverified maintenance plan.

---

## 7. Investigation agent: make it useful and auditable

### Minimum viable *deterministic* engine (P0)
Input: a selected site, a real observation if available, available weather and road layers, and missing-data list.

Output, in clearly separated panels:
1. **Observed:** what verified data show.
2. **Possible explanations:** limited, phrased as hypotheses, with evidence and uncertainty.
3. **Not established:** road-specific responsibility, exact transport route, road-safety effect, predicted chloride improvements.
4. **Best next check:** sample at a listed downstream/upstream site **only if its location exists and suitability is verified**; otherwise suggest general “identify upstream/downstream sampling points with local experts”; request maintenance logs or actual drainage maps where relevant.

Do not rank roads by causation unless a defensible data-driven method exists. Proximity can drive a **candidate review list**, not a blame score.

### Optional genuine AI implementation (P1 / Amazon only)
Provide the model **read-only tools** with structured inputs:
- `getCaseStudy()` — returns event dates/site and citations.
- `listObservations({stationId})` — returns *verified* values only.
- `getCandidateFeatures({siteId})` — returns mapped/inferred features with labels.
- `calculateSaltScenario({laneMiles,rate,reductionPct,cost})` — deterministic engine.
- `listEvidenceGaps()` — lists missing/uncertain records.

AI should create a cited investigation memo and choose reasonable evidence-gathering actions, not manipulate datasets or invent numbers. Validate tool outputs in code and show the exact data provenance behind responses. If this isn't truly implemented, **do not call it an autonomous AI agent** or enter Amazon on that basis.

---

## 8. Peri FDE path — conditional, not automatic

Peri's handbook requires a **real consulted business, family business, startup, restaurant, or student club**; student organizations qualify. Submission needs **organization name, person consulted, their role, and evidence** such as a screenshot, permitted quote, or photo. Judged on **real need, immediate usability, and end-to-end execution**.

**Prospective users:** municipal winter-maintenance staff, watershed nonprofits, civic/environment clubs, or student organizations involved in water monitoring. Only claim a customer if a real conversation happened **during this hackathon**. Don't call an arbitrary business a customer of SaltShadow if it has no real need for this product.

**90-second interview script:**
> “We're building an investigation tool for road-salt effects on streams. How do you currently decide which waterways to investigate after a winter storm? What's the hardest data or communication step? Can you tell us about one recent example? If we made one part easier tonight, would you try it?”

Ask permission to use their name/role and a specific quote as evidence. If they identify a different bottleneck (e.g. downloading samples, documenting fieldwork, explaining unknowns), **change one feature to solve that actual bottleneck**, then show the improvement. Do not invent a testimonial, customer adoption, or pilot result.

**Go/no-go:** If a qualifying consultation cannot be arranged quickly, focus on Sustainability and possibly Amazon; do not represent the project as Peri-eligible without the required evidence.

---

## 8A. Optional extra prizes — GoDaddy Registry and ChatOverflow

These are **side quests, not separate SaltShadow product features**. Assign a volunteer who is **not blocking core development**, and stop immediately if either needs substantial debugging. The main track remains Sustainability. The official rules allow one main track and multiple eligible sponsor tracks.

### A. [MLH] Best Domain Name from GoDaddy Registry — low-effort optional entry

**Published prize:** One digital gift card for the winning entry. The HackPrinceton Devpost listing says to **register a domain name with GoDaddy Registry**. It does **not** specify in the public description which TLDs, registration method, proof, or event-specific opt-in are required; do not assume that buying an arbitrary `.com` from any registrar qualifies.

**One owner, maximum 20 minutes after P0 is functional:**

1. Open the [official MLH GoDaddy Registry entry point](https://mlh.link/GoDaddyRegistry) and the [HackPrinceton Devpost prize listing](https://hackprinceton-fall-26.devpost.com/). Check with MLH organizers if the landing page/eligibility instructions are unclear. Verify the **eligible extension, actual cost/free offer, registration deadline, and entry procedure** before paying.
2. Brainstorm a distinctive SaltShadow-related domain (e.g., `saltshadow` plus an *eligible* extension). Check availability and price. **These are naming ideas, not claims that any domain is available or eligible.** Obtain agreement before spending money; do not register personal information using a teammate's identity without consent.
3. If registered, optionally point DNS to the **already-working** deployed SaltShadow site. Confirm the domain resolves via HTTPS and the main demo still works. If DNS takes too long, keep the stable original deployment link as the primary Devpost/demo URL. Do not disrupt deployment to satisfy the domain prize.
4. Retain a private/redacted registration confirmation and the public domain URL. Include a short description of the name in Devpost and select the appropriate GoDaddy prize option **if offered/required**. Avoid publishing billing details.

**Done/eligible only when:** the registration is real, its method and extension meet the sponsor's confirmed rules, and any required opt-in is completed. A clever domain name in the README alone is **not** an entry.

**Go/no-go:** If eligibility, payment, or DNS are unresolved after 20 minutes, skip. SaltShadow can still compete in Sustainability without a custom domain.

### B. [ChatOverflow] Agent Leaderboard — coding workflow opportunity, not an in-app AI feature

**Published prize structure:** First **$500**, second **$250**, third **$150**, plus a **$100 connected-agent raffle**. The [official Devpost listing](https://hackprinceton-fall-26.devpost.com/) states that **useful insights from connected agents** determine the ranking, **everyone with a connected agent is eligible for the raffle**, and **no additional project or submission is required**. The [event leaderboard URL](https://chatoverflow.dev/leaderboard/hackprinceton) is published, but its full setup instructions and live connection status must be checked directly with the sponsor/event materials.

**Crucial distinction:** ChatOverflow connects development agents such as **Codex, Claude Code or Cursor** so useful lessons from genuine coding work can contribute to the agent network. It is **not** the SaltShadow environmental investigation assistant, and no new customer-facing bot is needed for this prize.

**One owner, maximum 20–30 minutes after the team agrees:**

1. Locate the sponsor's official HackPrinceton setup instructions on the event site, Discord or at the sponsor table; verify how to join the **HackPrinceton** leaderboard specifically. The public ChatOverflow site advertises a CLI/hook-based connection for coding agents, but product versions and instructions may differ. **Use the event's current official instructions, not an assumed command.**
2. Confirm the account/agent belongs to an eligible participant. Ask the team **before allowing a tool to read prior Codex/Claude/Cursor sessions or upload session-derived insights**. Review exactly what data is accessed, stored and shared. Do **not** expose API keys, personal credentials, private sponsor datasets, teammates' private sessions, or internal chat logs. Use a clean, project-only agent session if supported.
3. Connect the agent and confirm that the connection is **visible/acknowledged by the sponsor's event system**, ideally with a screenshot or confirmation. Installing a CLI alone is not proof of connection or eligibility.
4. While legitimately developing SaltShadow, let the connected agent discover and share **accurate, generalized technical insights** in the way the official product supports (for example, a validated fix to a source-classification bug, deterministic tests, or an integration pitfall). Never post fabricated findings, spam, or unrelated low-value contributions to game rankings.
5. Check event leaderboard status once after connecting. Keep only minimal eligibility evidence; do **not** publish private agent session content in the GitHub repo or Devpost.

**Done for raffle eligibility only when:** a real agent is connected under the event's rules. **Ranking prizes are competitive and not guaranteed**; no extra SaltShadow Devpost submission is required for ChatOverflow based on the published listing.

**Go/no-go:** If sponsor onboarding or consent is uncertain, skip it. Do not jeopardize the main repo, secrets, or team trust for a leaderboard position.

### Sponsor owner/status tracker (update manually; do not infer completion from this plan)

| Opportunity | Owner (fill in) | Actual proof of eligibility | Status |
|---|---|---|---|
| Sustainability (main) | TBD | Working SaltShadow + one main-track Devpost selection | NOT SUBMITTED |
| Amazon Practical AI (conditional) | TBD | Working, demonstrably tool-using practical AI | NOT VERIFIED |
| Peri FDE (conditional) | TBD | Real qualified consultation + evidence + resulting product change | NOT VERIFIED |
| GoDaddy domain (optional) | TBD | Eligible domain registration + entry/opt-in proof if required | NOT STARTED |
| ChatOverflow leaderboard (optional) | TBD | Agent connected to HackPrinceton event system | NOT CONNECTED |

**Priority order:** P0 SaltShadow → submit safely → qualifying Peri/Amazon work if feasible → GoDaddy/ChatOverflow only in parallel or unused time. Never trade the core demo or submission buffer for side-prize eligibility.

---

## 9. Revised build sprint — staged integration and early deployment

**All times Eastern (Saturday Nov 14 → Sunday Nov 15).** This replaces the old late-deployment sequence. Starting time is an operational target; if an earlier window has passed, **perform its exit condition immediately**. Integrator updates a shared status message after each gate. The 8:00 AM hard deadline is never negotiable.

| Deadline | Deliverable / owner | Exit condition — what must actually be demonstrated |
|---|---|---|
| **Immediately; no more than 30 minutes** | All four: audit shared repo, agree roles and `case_study.json` v1, create short branches | Repo URL, owner table, frozen schema, baseline test status and known conflicts in team chat |
| **10:00 PM Saturday** | Integration owner: **deploy baseline early** | Working public HTTPS preview, tested from a separate browser; share URL |
| **11:00 PM Saturday** | Hemanth: verified flagship investigation **or monitoring-gap fallback** | Real event/site, source URLs, no invented chloride readings, valid `case_study.json`, explicit go/no-go |
| **12:30 AM Sunday** | Rithvik: complete **Prove It** interaction | On the **deployed app**, judge clicks a hypothesis, sees `Not proven`, toggles Documented Only, and linked unsupported feature disappears |
| **2:00 AM Sunday** | All + integrator: **integrated P0** | Storm → site → scenario → Prove It → evidence export works on live URL; run core tests |
| **3:00 AM Sunday** | **Feature freeze** | Stop new sponsor features, schema rewrites, framework changes, and risky integrations; fix bugs only |
| **3:00–4:00 AM** | Integration owner: QA + two-minute rehearsal | Full fresh-browser acceptance test passes; demo under 2 minutes; screenshot/video backup |
| **4:00–5:00 AM** | Integration owner: GitHub and deployment hardening | Public repo, README/run instructions, attributions, no credentials, live link checked |
| **5:00–6:30 AM** | Submitter + team: Devpost and final track choices | Sustainability selected, accurate screenshots, correct teammate/project links, optional video if ready |
| **By 7:00 AM** | **Submit early and verify** | Devpost confirms submission and accessible GitHub/deployed site; no reliance on 8:00 AM upload |
| **8:00 AM Sunday** | **Hard submission cutoff** | All core tasks already complete |

### Optional workstreams — only off the critical path

- **Peri:** only with genuine qualifying consultation **and** a demonstrable feature adjustment; if no real consultation, skip.
- **Amazon / Gemini:** only if a real grounded tool-using AI workflow exists **before** feature freeze and does not threaten P0; otherwise don't claim it.
- **GoDaddy Registry:** volunteer-only, ≤20 minutes, eligibility/permission first, no deployment disruption.
- **ChatOverflow:** optional verified agent connection, ≤20–30 minutes, explicit session-data/privacy consent first. It is a **coding-agent leaderboard**, not a SaltShadow product feature.
- **No one on the four-person critical path is reassigned solely to a side prize.** On any P0 failure, all discretionary sponsor work stops.

---

## 10. Tests and acceptance checks

### Data/provenance
- [ ] Site/map coordinates correspond to the named NJ location, not a homonymous town.
- [ ] Every visible numeric observation has exact units, site, timestamp, source, and method if published.
- [ ] Default fictional chloride chart is marked **SYNTHETIC** on chart, legend, hover, and exported brief.
- [ ] A sample taken on a different date cannot be presented as a response to the selected storm.
- [ ] A single or irregular sample series is drawn as points, not a fabricated smooth continuous trend.
- [ ] No inferred road-to-stream path persists in **Documented only** mode.
- [ ] No source-less AI claim is presented as measured or established.

### Scenario calculations
- [ ] 0% reduction => exactly 0 lb and $0 savings.
- [ ] 100% hypothetical reduction => baseline amount not applied, **not** a recommendation.
- [ ] 6 lane-mi × 250 lb/lane-mi × 20% => **300 lb** not applied.
- [ ] At $105/short ton, 300 lb => **$15.75** hypothetical material savings.
- [ ] Negative, invalid, and enormous inputs are rejected/clamped; no NaN or Infinity appears.
- [ ] No computed stream chloride drop or road-safety guarantee appears.

### Optional sponsor acceptance checks (not P0 blockers)
- [ ] GoDaddy: eligibility and domain extension verified with MLH/event instructions **before** registration.
- [ ] GoDaddy: any registered domain is real; proof saved privately; primary deployed demo link remains usable even if custom DNS fails.
- [ ] ChatOverflow: team approves access to agent session data; credentials/private data are not shared.
- [ ] ChatOverflow: coding agent connection is confirmed by the event system; no claim of ranking/raffle qualification based on an unverified install.
- [ ] Sponsor descriptions accurately distinguish the in-app investigation workflow from any connected **development** coding agent.

### Mandatory live end-to-end gate — **all eight steps must pass on deployed URL**

Run in a **fresh browser**, not only localhost. Have a teammate who did not write the feature perform it and record PASS/FAIL with timestamp, browser, and URL. A missing step blocks feature freeze and submission polish.

1. [ ] Open the sourced Princeton winter-storm case; dates and source attribution are visible.
2. [ ] Select the real mapped monitoring site; no unsupported chloride data appears as measured.
3. [ ] Select an explicitly `INFERRED` possible road-to-stream hypothesis.
4. [ ] Click **Prove It**; see claim, status, source/limitations, **Not proven** and the next investigation check.
5. [ ] Toggle **Documented only**; the unsupported visual connection **actually disappears from the map**, while documented features remain.
6. [ ] Change the hypothetical salt-use percentage; displayed amounts update deterministically with clear units and a safety review warning.
7. [ ] Export decision brief; exported file includes the same active case, scenario numbers, claim status, sources, assumptions and missing evidence.
8. [ ] Finish the complete rewind → investigate → intervene → prove → export story within **two minutes** on the deployed site.

If a check fails, **fix it before** buying a domain, joining a leaderboard, adding AI, or polishing animations. A stable locally bundled fallback must be available if external map tiles fail.

### UX and demo
- [ ] Under two minutes: storm → evidence → intervention → Prove It → export.
- [ ] Works at 1280×720, laptop, and narrow phone viewport; no major clipping.
- [ ] Controls are keyboard-usable; toggle states announced/clear.
- [ ] External map/tile failure leaves enough cached/local content to tell the story.
- [ ] Exported brief preserves fact-versus-hypothesis labels.
- [ ] Public repo works from a clean browser and includes test instructions.

**Run:**

```bash
cd saltshadow_mvp
python3 -m http.server 8000
# open http://localhost:8000
node tests/test_engine.js
# add tests/test_evidence.js and tests/test_investigation.js before claiming feature coverage
```

---

## 11. Two-minute judging script

| Time | Action / talk track |
|---|---|
| **0:00–0:15** | “Road salt helps keep streets safer but some eventually reaches freshwater. Communities need to understand the evidence before they change practices.” |
| **0:15–0:40** | Choose the documented winter event and show real mapped stream station. “Here's what the historical source supports; this illustration isn't a measurement.” |
| **0:40–1:00** | Open observed data and candidate source list. Say which measurements actually exist, and if the selected event has no matched chloride reading, say so. |
| **1:00–1:20** | Judge chooses a salt-use scenario; show salt amount and material-cost difference with safety gate. |
| **1:20–1:45** | **Prove It moment:** audit a possible road link; turn on documented-only; unsupported evidence disappears; show next sampling/check step. |
| **1:45–2:00** | Export evidence brief and close: “SaltShadow doesn't pretend to know what it can't prove—it makes the next environmental decision more informed.” |

### Optional case-study hook (only if verified)
If actual chloride samples and the storm line up at one site, lead with the concrete, cited readings and their exact dates. If they do not, **do not claim a storm-caused spike**. A well-validated monitoring gap plus a specific proposed sampling plan is better than a fabricated success story.

---

## 12. Public repo / submission checklist

- [ ] Public GitHub repo created within Nov 13–15, 2026 (per handbook); **existing teammate repo actually inspected and all four file owners acknowledged**.
- [ ] **Public preview deployed early**, link shared with team, verified on a fresh browser and retested after each merge.
- [ ] `case_study.json` agreed and schema/IDs tested; one person owns source modifications and one owns shared-file merges.
- [ ] Full eight-step live acceptance test passed; record screenshot or brief checklist evidence.
- [ ] README clearly distinguishes working features, example data, limitations and data source URLs.
- [ ] `LICENSE` and OSM/Leaflet attribution are included where applicable.
- [ ] No API keys, tokens, personal customer data, or private conversations committed.
- [ ] If using a real interview, obtain consent and redact private business/customer information.
- [ ] Devpost selects **exactly one** main track: Sustainability.
- [ ] Add sponsor tracks only when qualified: Peri requires documented customer consultation; Amazon needs actual working practical AI.
- [ ] **GoDaddy (optional):** confirm registered domain meets sponsor conditions and complete any required event opt-in; include a working URL and safe/redacted proof.
- [ ] **ChatOverflow (optional):** confirm coding-agent connection on the HackPrinceton leaderboard; **no separate project/Devpost submission** per published sponsor listing.
- [ ] Sponsor prize work must not require exposing private coding sessions, credentials, billing information, or unverified environmental findings.
- [ ] Optional video ≤2 minutes; required in-person live demonstration ≤2 minutes.
- [ ] Submit before **8:00 AM ET Sunday, Nov 15**.

---

## 13. What success actually looks like

**Minimum credible result:** a beautiful, functional and scientifically honest stream-first investigation for a documented winter event, with a tested what-if calculator and an evidence audit that makes uncertainty *visible*.

**What would make it award-competitive:** a verified site-specific chloride record genuinely linked in time to the case, a real end-to-end decision workflow, an intuitive **Prove It** reveal, and—if targeting Peri—verifiable customer input used to modify the product.

**What we must never claim without evidence:** a measured chloride improvement, proven road-specific pollution causation, validated safe-salting recommendations, actual municipal cost savings, or Peri customer adoption.

**Build order to remember:** **Agree ownership/schema → deploy baseline → real case (or monitoring-gap fallback) → visible Prove It → integrated eight-step test → feature freeze → polish → submit by 7:00 AM.** Pursue optional sponsors only in spare time with real eligibility evidence; never sacrifice the stable Sustainability demo.

### Official organizer and sponsor references
- [HackPrinceton rules — one main track, multiple sponsors, 8:00 AM hard stop](https://hackprinceton-fall-26.devpost.com/rules)
- [HackPrinceton prizes — GoDaddy, ChatOverflow, Amazon and Peri listings](https://hackprinceton-fall-26.devpost.com/)
- [MLH GoDaddy Registry domain entry point](https://mlh.link/GoDaddyRegistry)
- [ChatOverflow HackPrinceton leaderboard](https://chatoverflow.dev/leaderboard/hackprinceton)
- [ChatOverflow public product explanation](https://chatoverflow.dev/)

**Verification note (November 14, 2026):** The official Devpost listing supplies the prize categories and ChatOverflow awards but does not publicly detail every domain eligibility condition or agent onboarding step. Reconfirm those with official event/sponsor instructions before claiming eligibility.
