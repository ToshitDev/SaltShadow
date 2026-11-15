# SaltShadow: Princeton case source verification

- **Maintainer:** Hemanth — Environmental Data and Investigation
- **Review date:** November 15, 2026 (America/New_York)
- **Case:** `princeton-nj-2026-01-storm-stony-brook`
- **Data contract:** [case_study.json](case_study.json), schema version 1
- **Project guidance:** [plan.md](../plan.md), particularly its evidence contract and data-acquisition rules.

This review checks published source pages against the case JSON. It verifies the documented storm report and station metadata; it does not establish a measured chloride response. All seven requested source pages were accessible. Original chloride result exports, laboratory reports, municipal treatment logs, and individual drainage features were not audited in this review.

## 1. Case overview

The case covers the **January 25–26, 2026 Princeton-area winter storm** and the **Stony Brook at Princeton NJ** monitoring location, `USGS-01401000`.

The investigation classification is **documented storm, mapped monitoring station, and unresolved chloride-data gap**. The JSON contains three claims and zero observations. Its chloride status is `NO_EVENT_MATCHED_CHLORIDE_OBSERVATIONS_VERIFIED`.

For judges: this case supports an investigation into missing evidence. It does not demonstrate a storm-caused chloride spike, identify a responsible road, or predict a water-quality improvement from reduced salt use.

## 2. Historical storm

**Source checked:** [Rutgers New Jersey State Climate Office, January 2026 Report](https://climate.rutgers.edu/articles/january-2026-report), storm narrative, Figure 13, and Table 4.

Rutgers describes snow arriving before dawn on January 25. Table 4 lists **Princeton, Mercer County: 10.0 inches**; the accompanying discussion identifies storm totals that include snow and sleet.

The JSON preserves this as `REPORTED_STORM_TOTAL`, with units `in` and `timeResolution: "storm_total"`. It is neither an hourly measurement nor an observation at the USGS stream gage. No site-specific hourly weather series has been verified.

Rutgers credits the reports collectively to CoCoRaHS, NWS Cooperative Observer, and NWS spotter observations. The table does not identify the individual Princeton reporter, exact observation time, or that reporter's specific measurement procedure. Accordingly, `observedAt` remains `null`; no timestamp or individual method is invented.

The January 25 timeline entry is `DOCUMENTED_NARRATIVE`. January 26 is the case's `EVENT_WINDOW_MARKER`, not an individual weather or chloride observation. The two-day case window must not be presented as a precisely timed measurement interval.

## 3. USGS monitoring station

**Source checked:** [USGS Water Data for the Nation — Stony Brook at Princeton NJ](https://waterdata.usgs.gov/monitoring-location/USGS-01401000/), location metadata.

| Field | Verified published value used in the JSON |
| --- | --- |
| Station ID | `USGS-01401000` (USGS location number `01401000`) |
| Name | Stony Brook at Princeton NJ |
| Latitude | `40.3330555555556` |
| Longitude | `-74.6819444444445` |
| Coordinate datum | WGS84 |
| Drainage area | 44.5 square miles |
| Site type | Stream |
| Administrative location | Mercer County, New Jersey, USA |

USGS describes the coordinates as map-interpolated, accurate to approximately plus or minus one second of latitude/longitude. The long decimal values reproduce the published metadata; they do not imply survey precision at every decimal place.

This supports `station-location-001` as `MAPPED` with `verified: true`. A real station and its metadata do not automatically establish storm-matched chloride readings, drainage connections, or pollutant sources.

The map point `stony-brook-gage-001` uses GeoJSON order: **[longitude, latitude]**, or `[-74.6819444444445, 40.3330555555556]`.

## 4. Chloride data availability

**Current finding:** no January 2026 site-matched chloride observations have been independently verified for this case. `observations: []` means no verified matching records have been incorporated. It does **not** mean zero chloride or prove that no measurements exist.

### Source checks and their limits

| Source reviewed | What the review established | What remains unresolved |
| --- | --- | --- |
| [Water Quality Portal Web Services Guide](https://www.waterqualitydata.us/webservices_documentation/) | Documents separate station, activity, result, and detection-limit downloads, with filters for site, characteristic, and activity dates. | Reading retrieval documentation is not an executed result query. No original chloride export was retrieved or audited here. |
| [WQP summary for USGS-01401000](https://waterqualitydata.us/provider/NWIS/USGS-NJ/USGS-01401000/) | Identifies the stream station and provides historical metadata and grouped periods of record. Its legacy interface excludes USGS data added after March 11, 2024 and directs users to newer WQX 3.0 profiles. | This summary cannot rule out January 2026 samples. Grouped date ranges are not individual chloride records. |
| [NJ Salt Watch](https://njwatershedwatch.org/road-salt/) | Describes community chloride monitoring, test-strip guidance, and links to data maps. | No individual map record or original result matching this station and event was independently validated. Program participation or a nearby point alone is insufficient. |

The WQP summary labels its coordinates NAD83, while the current USGS monitoring-location page explicitly supplies WGS84 coordinates. The case uses the latter. Do not silently substitute the legacy coordinates or relabel their datum. [WQP site metadata](https://waterqualitydata.us/provider/NWIS/USGS-NJ/USGS-01401000/) and [USGS location metadata](https://waterdata.usgs.gov/monitoring-location/USGS-01401000/).

### Requirements before accepting a chloride observation

For each candidate record, validate and retain:

- Original provider, source link, sample/activity identifier, and station identifier; resolve aliases using documented location evidence.
- Actual collection date and, when provided, time and time zone. Distinguish collection from analysis or reporting dates. Do not invent missing times.
- Parameter identity as chloride, sample medium and fraction, numeric value or bound, and original units.
- Collection procedure, laboratory analytical method or field-strip method, and relevant quality-control information. Keep missing method details explicit.
- Detection/reporting limits, estimated or rejected-result flags, censored values, and other qualifiers.
- Whether the sample falls in the January 25–26 case window. Label samples from other dates separately as context; a nearby date does not itself prove a storm response.

NJ Salt Watch explains that out-of-range strip readings may be entered as 0 or 650 mg/L placeholders, depending on the reading and strip range. Such entries must not be assumed to be exact concentrations; inspect the original method, lot-specific range, and qualifier. [NJ Salt Watch FAQs](https://njwatershedwatch.org/road-salt/).

Conductivity cannot automatically be treated as chloride concentration. The [project evidence rules](../plan.md) require a valid site-specific calibration and explicit limitations before any conversion; none has been verified for this case. A conductivity result must not be relabeled as a measured chloride value.

The rows in `data/chloride_template.csv` are synthetic examples and must never appear as real observations. Preserve the empty observations array until suitable original records are verified. Do not interpolate or fabricate a measured chloride graph; if discrete samples are later accepted, display their actual dates and qualifiers without implying a continuous record.

## 5. Geographic evidence

**Sources checked:** [Princeton GIS Maps and Apps](https://princetonnj.gov/1845/GIS-Maps-and-Apps) and [OpenStreetMap copyright and license](https://www.openstreetmap.org/copyright).

Princeton's official directory links a Stormwater Infrastructure Map for drainage features and related assets. This confirms the availability of a published mapping resource. The underlying layers, outfalls, pipe connections, and flow directions were not individually audited in this review. The directory is not evidence of a particular road-to-stream route.

Published maps can support documented geographic features when their source, identity, position, and scope are checked. Proximity to a stream does not prove drainage connectivity. No particular road, outfall, transport route, or road-specific pollution source has been verified for this case.

Before adding any layer, check its jurisdiction, geographic extent, coordinate reference system, datum, units, accuracy, and reuse conditions. Transform coordinates explicitly when needed; do not assume every layer is WGS84. Preserve the case point's GeoJSON coordinate order.

Keep OpenStreetMap contributor attribution visible and provide the required ODbL license information, using the [OpenStreetMap copyright page](https://www.openstreetmap.org/copyright) as the license-information link. Check municipal layer-specific terms separately; availability in a public viewer does not establish unrestricted reuse.

The JSON's `candidate-link-001` remains `INFERRED`, with `geometry: null` and `showAsVerified: false`. It supplies no road or drainage coordinates and must not be rendered as a verified geographic route.

## 6. Hypothetical salt scenario

The values below match `scenarioDefaults` in [case_study.json](case_study.json). Their status is **`ASSUMED`**. They are hypothetical inputs, not Princeton municipal maintenance records or a verified purchase price.

| Input | Assumed value |
| --- | --- |
| Treated lane-miles | 6 |
| Application rate | 250 lb per lane-mile |
| Hypothetical reduction | 20% |
| Material price | $105 per US short ton |

One US short ton is 2,000 lb. The arithmetic follows the existing [calculation engine](../engine.js):

| Output | Calculation | Result |
| --- | --- | --- |
| Baseline salt | 6 × 250 | 1,500 lb |
| Scenario salt | 1,500 × (1 − 20 / 100) | 1,200 lb |
| Salt not applied | 1,500 − 1,200 | 300 lb |
| Material-only cost difference | (300 / 2,000) × $105 | $15.75 |

Calling the existing `SaltEngine.calculate()` with the JSON defaults reproduced all four results during this review. The outputs are calculated hypothetical quantities, not measured environmental outcomes or actual municipal savings. They exclude labor, equipment, and other operational costs. They do not estimate chloride concentration changes, prove road safety, or justify a treatment recommendation.

## 7. Evidence classifications

These meanings follow the [project evidence contract](../plan.md). Verification applies to a specific claim, not to every implication of its source.

| Status | Meaning | When `verified: true` is appropriate |
| --- | --- | --- |
| `MEASURED` | An actual observation with traceable original evidence. | Only after the value or bound, parameter, location, date, units, method, qualifiers, and provenance have been independently checked. No current chloride claim qualifies. |
| `MAPPED` | A documented place or geographic feature. | After its identity and location are independently checked against supporting geographic evidence. This does not verify chemistry or connectivity. |
| `INFERRED` | A hypothesis or proposed explanation requiring further evidence. | Never while the claim remains inferred. Keep `verified: false`. |
| `ASSUMED` | A scenario input or illustrative premise. | Never while the value remains assumed. Correct arithmetic does not turn an input into a measurement. |
| `UNKNOWN` | Information is unresolved, unavailable to the review, or insufficiently checked. | Never while unresolved. Keep `verified: false`. |

A source URL alone is insufficient for verification. If direct evidence cannot be accessed or checked, document the limitation and retain an unverified classification. The scenario's `ASSUMED` status is separate from the `claims[]` array.

| Current claim ID | Classification | Verified | Linked feature |
| --- | --- | --- | --- |
| `station-location-001` | `MAPPED` | `true` | `stony-brook-gage-001` |
| `hypothesis-runoff-001` | `INFERRED` | `false` | `candidate-link-001` |
| `chloride-gap-001` | `UNKNOWN` | `false` | None; `featureIds: []` |

`DOCUMENTED_EVENT`, `DOCUMENTED_NARRATIVE`, and `EVENT_WINDOW_MARKER` describe event/timeline records; they are not additional claim statuses. The reported snowfall is stored in `event.weatherSummary`, not in the empty chloride observations array.

## 8. Recommended next investigation steps

These are proposed actions, not completed research or fieldwork.

1. **Obtain original chloride measurement records.** Use the current USGS/WQP result services and contact the data custodians or NJ Salt Watch as needed. Account for the legacy WQP coverage limitation. Save exact query parameters, retrieval dates, and original result identifiers when retrieval is performed.
2. **Validate sample dates and methods.** Match records to the station and event window; check laboratory or field methods, units, sample fractions, detection limits, and all qualifiers. Preserve missing information explicitly.
3. **Identify suitable sampling locations with local experts.** Ask watershed scientists and municipal staff to assess appropriate upstream/downstream and comparison locations, access, timing, and quality-control needs. No new sampling coordinates or proven upstream/downstream relationships are supplied here.
4. **Review drainage maps and field evidence.** Inspect relevant Princeton layers and original infrastructure records; confirm outfall identity, connected pipes, drainage direction, and where runoff actually reaches the stream before accepting a route.
5. **Request road-salt application logs.** Seek dated treatment locations, quantities, materials, and application records from the responsible road agencies. Keep hypothetical scenario defaults separate from any records obtained.
6. **Compare the evidence before attribution.** Evaluate treatment timing, verified transport routes, chloride observations, background conditions, and alternative explanations together. Do not attribute pollution to a specific road from proximity, a storm date, or an isolated reading alone.

## 9. Team integration

| Owner | Responsibility and data handoff |
| --- | --- |
| Toshit | Owns frontend integration in `app.js`, `index.html`, and `styles.css`; consumes the event, site, observations, sources, and limitations from the case JSON. Preserve the distinction between reported totals, timeline markers, measured observations, and hypothetical scenarios. |
| Rithvik | Owns `evidence.js`, `investigation.js`, and Prove It; consumes `claims[]` and `mapFeatures[]`, including provenance, uncertainty, `nextEvidenceNeeded`, and reciprocal claim/feature IDs. Documented-only filtering must not present inferred, assumed, or unknown features as verified. |
| Rohan | Maintains `engine.js`, calculation tests, and deployment support. Keep `SaltEngine.calculate()` as the shared material-and-cost calculator; do not add unsupported environmental predictions to its results. |
| Hemanth | Maintains environmental data in `data/case_study.json` and these verification notes. Audits sources and proposed observations, preserves limitations, and coordinates any evidence-status or schema changes. |

The current `loadCaseStudy()` accepts an `event` object and `claims` array and displays the event name, record type, and claim count. That loader does not by itself render the station, weather timeline, observation data, or complete Prove It workflow. The responsibilities above describe the integration contract, not proof that every frontend feature is implemented.

Preserve the existing claim and feature IDs listed in section 7. `claims[].featureIds` and `mapFeatures[].claimId` must continue to agree. Retain `geometry: null` for the unsupported connection, and keep source links and evidence gaps visible in future displays and exports. This documentation review does not change the JSON, calculation engine, or frontend.
