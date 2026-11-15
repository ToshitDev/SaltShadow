# SaltShadow: Princeton case source verification

- **Maintainer:** Hemanth — Environmental Data and Investigation
- **Review date:** November 15, 2026 (America/New_York)
- **Revision:** updated the same day for the reconciled four-claim schema, the `station-01401000` feature ID, and the NOAA event record.
- **Case:** `princeton-nj-2026-01-storm-stony-brook`
- **Data contract:** [case_study.json](case_study.json), schema version 1
- **Automated check:** [tests/test_case_study.js](../tests/test_case_study.js)
- **Project guidance:** [plan.md](../plan.md), particularly its evidence contract and data-acquisition rules.

This review checks published sources against the case JSON. It verifies the documented storm reports and station metadata; it does not establish a measured chloride response. All seven source pages in the original review were accessible. The NOAA event record added in this revision was checked against NOAA's bulk Storm Events data, as described in section 2. Original chloride result exports, laboratory reports, municipal treatment logs, and individual drainage features were not audited in this review.

## 1. Case overview

The case covers the **January 25–26, 2026 Princeton-area winter storm** and the **Stony Brook at Princeton NJ** monitoring location, `USGS-01401000`.

The investigation classification is **documented storm, mapped monitoring station, unresolved chloride-data gap, and assumed salt-use scenario**. The JSON contains four claims and zero observations. Its chloride status is `NO_EVENT_MATCHED_CHLORIDE_OBSERVATIONS_VERIFIED`.

For judges: this case supports an investigation into missing evidence. It does not demonstrate a storm-caused chloride spike, identify a responsible road, or predict a water-quality improvement from reduced salt use.

### Source registry

The JSON's `sources[]` array lists five sources. Each source URL used by the event, the site, or a claim appears in this registry.

| Source ID | Name in the JSON | What it supports |
| --- | --- | --- |
| `rutgers-jan-2026` | [Rutgers New Jersey State Climate Office January 2026 Report](https://climate.rutgers.edu/articles/january-2026-report) | January 25 storm and Princeton 10.0-inch reported snow/sleet storm total |
| `noaa-ncei-1309897` | [NOAA NCEI Storm Events Database, event 1309897](https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=1309897) | Mercer County winter storm on January 25, 2026 (04:30–23:00 EST) and a highest reported snow and sleet storm total of 10.0 inches in Princeton |
| `usgs-01401000` | [USGS Stony Brook monitoring-location metadata](https://waterdata.usgs.gov/monitoring-location/USGS-01401000/) | USGS station identity, WGS84 coordinates, site type, drainage area |
| `wqp-site-usgs` | [Water Quality Portal monitoring-location summary](https://waterqualitydata.us/provider/NWIS/USGS-NJ/USGS-01401000/) | Historical station information, not verified January 2026 chloride samples |
| `nj-salt-watch` | [NJ Salt Watch](https://njwatershedwatch.org/road-salt/) | Community chloride monitoring program; no exact matching result established |

The Water Quality Portal web-services guide, Princeton's GIS directory, and the OpenStreetMap copyright page were also reviewed and are cited in sections 4 and 5. They are documentation and attribution pages, not entries in `sources[]`.

## 2. Historical storm

### Primary source: Rutgers January 2026 report

**Source checked:** [Rutgers New Jersey State Climate Office, January 2026 Report](https://climate.rutgers.edu/articles/january-2026-report), storm narrative, Figure 13, and Table 4.

Rutgers is the primary event source. `event.sourceUrl` and `event.sourceName` (`Rutgers New Jersey State Climate Office January 2026 Report`) cite it, and `event.recordType` is `DOCUMENTED_EVENT`.

Rutgers describes snow arriving before dawn on January 25. Table 4 lists **Princeton, Mercer County: 10.0 inches**; the accompanying discussion identifies storm totals that include snow and sleet.

The JSON preserves this as `REPORTED_STORM_TOTAL`, with units `in` and `timeResolution: "storm_total"`. It is neither an hourly measurement nor an observation at the USGS stream gage. No site-specific hourly weather series has been verified.

Rutgers credits the reports collectively to CoCoRaHS, NWS Cooperative Observer, and NWS spotter observations. The table does not identify the individual Princeton reporter, exact observation time, or that reporter's specific measurement procedure. Accordingly, `observedAt` remains `null`; no timestamp or individual method is invented.

The January 25 timeline entry is `DOCUMENTED_NARRATIVE`. January 26 is the case's `EVENT_WINDOW_MARKER`, not an individual weather or chloride observation. The two-day case window must not be presented as a precisely timed measurement interval.

### Additional record: NOAA Storm Events Database, event 1309897

**Source checked:** [NOAA NCEI Storm Events Database, event 1309897](https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=1309897).

The event page loads its content in the browser. The record was therefore checked on November 15, 2026 against NOAA's bulk Storm Events details file for 2026 (`StormEvents_details-ftp_v1.0_d2026_c20261026.csv.gz`, from NOAA's [bulk file directory](https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/)). The row for event 1309897 gives:

| NOAA field | Published value | Stored in the JSON as |
| --- | --- | --- |
| Event ID | 1309897 | `eventId: "1309897"`, `sourceId: "noaa-ncei-1309897"` |
| Event type | Winter Storm | `eventType: "Winter Storm"` |
| Area | Mercer, New Jersey (forecast zone) | `location: "Mercer County, New Jersey, USA"` |
| Begin | January 25, 2026, 04:30 | `beginDateTime: "2026-01-25T04:30:00-05:00"` |
| End | January 25, 2026, 23:00 | `endDateTime: "2026-01-25T23:00:00-05:00"` |
| Time zone | EST-5 | `timezoneLabel: "EST-5"` |
| Report source | CoCoRaHS | `reportSource: "CoCoRaHS"` |

NOAA's event narrative reads, as it appears in the bulk file: "Storm total snow and sleet accumulation totals ranged from 7-10. The highest report received was 10.0 in Princeton." The bulk text carries no unit symbol after the figures. The JSON records the Princeton figure as `highestReportedStormTotal`: value `10.0`, units `in`, `measurementType: "HIGHEST_REPORTED_STORM_TOTAL"`, `precipitationType: "snow and sleet"`, `timeResolution: "storm_total"`, and `observedAt: null`. Inches is the unit of the matching Rutgers total; confirm it against the rendered event page if the unit is ever questioned.

The record is stored under `event.additionalEventRecords` with `recordType: "DOCUMENTED_REGIONAL_EVENT"` and `timeResolution: "event_record_interval"`, and it is listed in `sources[]` as `noaa-ncei-1309897`. It is a county-level event record. It is not an hourly weather series, not an observation at the USGS stream gage, and not a replacement for the Rutgers source. Its begin and end times bound NOAA's event record; they are not observation timestamps.

**The two 10.0-inch figures are not treated as independent observations.** Rutgers Table 4 and the NOAA narrative both give 10.0 inches for Princeton. Rutgers credits its table collectively to CoCoRaHS, NWS Cooperative Observer, and NWS spotter reports; NOAA lists CoCoRaHS as its report source. Neither identifies the individual reporter or observation time. The figures may rest on the same observer report, and the JSON's NOAA `limitation` states that they have not been confirmed to be independent.

### Investigation window versus the NOAA event interval

`event.startDate` and `event.endDate` (January 25–26, 2026) define the case-study investigation window, read in `event.timezone` (`America/New_York`). The NOAA event interval is January 25, 2026, 04:30–23:00 EST, and falls entirely on the first day of that window. The window is one day longer than the NOAA interval, and it is not a NOAA or Rutgers measurement interval. `event.uncertainty` and the last entry in `limitations[]` record this distinction.

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

This supports `station-location-001` as `MAPPED` with `verified: true` and `claimType: "LOCATION"`. A real station and its metadata do not automatically establish storm-matched chloride readings, drainage connections, or pollutant sources. The claim's `uncertainty` repeats the USGS accuracy note and that limit.

The map point `station-01401000` uses GeoJSON order: **[longitude, latitude]**, or `[-74.6819444444445, 40.3330555555556]`.

### What `site.verified: true` covers

The JSON sets `site.verified: true` and `site.sourceName: "USGS Water Data for the Nation"`. The flag records that the station's identity and published location were checked against the USGS page. `site.verifiedScope` states its limit: "Station identity and published location only; not chloride data, drainage connectivity, or pollutant sources."

| Item | Status in the JSON |
| --- | --- |
| Station identity and published location | Verified: `site.verified: true`; claim `station-location-001` is `MAPPED`, `verified: true` |
| Water-quality observations at the station | Not verified: `observations: []`; claim `chloride-gap-001` is `UNKNOWN`, `verified: false` |

The frontend maps a monitoring site only when `site.verified` is `true`, so the flag decides whether the station marker appears. It must not be read as verification of any measurement taken at the station.

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

The shared evidence contract adds a structural requirement. The Prove It validator accepts a measurement only as a claim with `status: "MEASURED"`, `claimType: "OBSERVATION"`, and `verified: true` that carries `observedProperty`, a finite `value`, `observedAt`, `stationId`, `units`, `method`, and a named source URL. [tests/test_case_study.js](../tests/test_case_study.js) also requires a matching record in `observations[]`, and it currently requires `observations` to be empty. Accepting a real record therefore takes a source review and a deliberate test update, not a data edit alone.

NJ Salt Watch explains that out-of-range strip readings may be entered as 0 or 650 mg/L placeholders, depending on the reading and strip range. Such entries must not be assumed to be exact concentrations; inspect the original method, lot-specific range, and qualifier. [NJ Salt Watch FAQs](https://njwatershedwatch.org/road-salt/).

Conductivity cannot automatically be treated as chloride concentration. The [project evidence rules](../plan.md) require a valid site-specific calibration and explicit limitations before any conversion; none has been verified for this case. A conductivity result must not be relabeled as a measured chloride value.

The rows in `data/chloride_template.csv` are synthetic examples and must never appear as real observations. Preserve the empty observations array until suitable original records are verified. Do not interpolate or fabricate a measured chloride graph; if discrete samples are later accepted, display their actual dates and qualifiers without implying a continuous record.

## 5. Geographic evidence

**Sources checked:** [Princeton GIS Maps and Apps](https://princetonnj.gov/1845/GIS-Maps-and-Apps) and [OpenStreetMap copyright and license](https://www.openstreetmap.org/copyright).

Princeton's official directory links a Stormwater Infrastructure Map for drainage features and related assets. This confirms the availability of a published mapping resource. The underlying layers, outfalls, pipe connections, and flow directions were not individually audited in this review. The directory is not evidence of a particular road-to-stream route.

Published maps can support documented geographic features when their source, identity, position, and scope are checked. Proximity to a stream does not prove drainage connectivity. No particular road, outfall, transport route, or road-specific pollution source has been verified for this case.

Before adding any layer, check its jurisdiction, geographic extent, coordinate reference system, datum, units, accuracy, and reuse conditions. Transform coordinates explicitly when needed; do not assume every layer is WGS84. Preserve the case point's GeoJSON coordinate order.

Keep OpenStreetMap contributor attribution visible and provide the required ODbL license information, using the [OpenStreetMap copyright page](https://www.openstreetmap.org/copyright) as the license-information link. Check municipal layer-specific terms separately; availability in a public viewer does not establish unrestricted reuse.

The JSON's `candidate-link-001` remains `INFERRED`, with `geometry: null`, `showAsVerified: false`, and `presentation: "CONCEPTUAL_SCHEMATIC_ONLY"`. It supplies no road or drainage coordinates and must not be rendered as a verified geographic route. Prove It draws it only as a labeled conceptual schematic; that drawing's screen position is not a geographic location and must not be passed to the map.

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

The same assumption appears in `claims[]` as `scenario-assumption-001` (`ASSUMED`, `verified: false`, `claimType: "SCENARIO"`). It has no source, no station (`stationId: null`), and no map feature. Its `doesNotEstablish[]` entries rule out actual Princeton treatment quantities, application rates, salt prices, or municipal savings; any change in stream chloride concentration; and roadway safety at any treatment level.

## 7. Evidence classifications

These meanings follow the [project evidence contract](../plan.md). Verification applies to a specific claim, not to every implication of its source.

| Status | Meaning | When `verified: true` is appropriate |
| --- | --- | --- |
| `MEASURED` | An actual observation with traceable original evidence. | Only after the value or bound, parameter, location, date, units, method, qualifiers, and provenance have been independently checked. No current chloride claim qualifies. |
| `MAPPED` | A documented place or geographic feature. | After its identity and location are independently checked against supporting geographic evidence. This does not verify chemistry or connectivity. |
| `INFERRED` | A hypothesis or proposed explanation requiring further evidence. | Never while the claim remains inferred. Keep `verified: false`. |
| `ASSUMED` | A scenario input or illustrative premise. | Never while the value remains assumed. Correct arithmetic does not turn an input into a measurement. |
| `UNKNOWN` | Information is unresolved, unavailable to the review, or insufficiently checked. | Never while unresolved. Keep `verified: false`. |

A source URL alone is insufficient for verification. If direct evidence cannot be accessed or checked, document the limitation and retain an unverified classification. The scenario's `ASSUMED` status appears in two places that must agree: `scenarioDefaults.status` and the claim `scenario-assumption-001`.

### The four claims

| Claim ID | `claimType` | Classification | Verified | Linked feature |
| --- | --- | --- | --- | --- |
| `hypothesis-runoff-001` | `CONNECTION` | `INFERRED` | `false` | `candidate-link-001` |
| `station-location-001` | `LOCATION` | `MAPPED` | `true` | `station-01401000` |
| `chloride-gap-001` | `DATA_GAP` | `UNKNOWN` | `false` | None |
| `scenario-assumption-001` | `SCENARIO` | `ASSUMED` | `false` | None |

- **`hypothesis-runoff-001`** says that road-salt runoff from an unidentified nearby road could reach this stream. It has no source. It cites `station-location-001` in `supportingClaimIds[]` as documented context, which does not make that claim proof of the hypothesis. It supports only that USGS documents the station and that Rutgers and NOAA document a winter storm affecting Princeton and Mercer County on January 25, 2026. It does not establish a connected drainage pathway from any particular road or outfall, road-salt application on any particular road during the event, or a chloride concentration, chloride change, or road-specific causation at the station. Evidence gaps: `connectivity`, `application`, `chloride`, `sampling`, `timing`.
- **`station-location-001`** says that USGS identifies and maps the Stony Brook at Princeton NJ stream monitoring location (01401000). It is the only verified claim; its source is USGS Water Data for the Nation. It supports the station identity, site type, published WGS84 coordinates, and 44.5 square mile drainage area. It does not establish chloride measurements at the station for January 25–26, 2026, drainage connectivity between any road and the stream, or a causal link between road salt and water quality. Evidence gaps: `chloride`, `method`, `timing`.
- **`chloride-gap-001`** says that chloride concentration at this station during the January 2026 storm has not been established by the sources reviewed. Its source name is "USGS, Water Quality Portal, and NJ Salt Watch". It supports only that the case contains no verified event-matched chloride observations and that the sources reviewed did not yield an independently verified result; original result exports were not retrieved or audited. It does not establish that chloride was zero, low, or unchanged, that chloride increased or decreased, or that no measurements exist. Evidence gaps: `chloride`, `method`, `timing`.
- **`scenario-assumption-001`** says that a hypothetical reduction in road-salt application can be explored as an illustrative material-use scenario. It has no source and no station. It supports only deterministic calculation of salt quantities and a material-only cost difference from the stated hypothetical inputs. Section 6 lists what it does not establish. Evidence gaps: `application`, `safety`.

### Evidence contract fields

Each claim keeps the fields from the [project evidence contract](../plan.md) (`id`, `text`, `status`, `verified`, `sourceName`, `sourceUrl`, `observedAt`, `stationId`, `units`, `method`, `uncertainty`) and adds the fields that the Prove It validator (`validateCaseStudy()` in `evidence.js`) requires.

| Field | Meaning | Rule |
| --- | --- | --- |
| `claimType` | The kind of statement: `LOCATION`, `OBSERVATION`, `CONNECTION`, `SCENARIO`, or `DATA_GAP`. | `MAPPED` requires `LOCATION`. `MEASURED` requires `OBSERVATION`. A `CONNECTION` therefore cannot be `MAPPED` or `MEASURED`. |
| `supports[]` | The narrow statements the evidence does establish. | Non-empty array of strings. |
| `doesNotEstablish[]` | What the claim must not be read as showing. | Non-empty array of strings. |
| `nextEvidenceNeeded[]` | Evidence that would test or resolve the claim. | Non-empty array of strings. This was a single string in the earlier schema. |
| `evidenceGaps[]` | Codes for the open gaps. The Prove It investigation module turns each code into a recommended next check. | Non-empty array drawn from `connectivity`, `application`, `chloride`, `sampling`, `method`, `timing`, `safety`. |
| `relatedFeatureIds[]` | The map features linked to the claim, under the name the Prove It module reads first. | Array of feature IDs; may be empty. |
| `featureIds[]` | The same list under the name used in the original plan, kept for compatibility. | Must equal `relatedFeatureIds[]` exactly. |

Two optional fields are also present. `shortLabel` is the display label in Prove It's claim list. `supportingClaimIds[]` names verified claims that give documented context; only `hypothesis-runoff-001` uses it.

`INFERRED`, `ASSUMED`, and `UNKNOWN` claims must have `verified: false`. `MAPPED` and `MEASURED` claims must have `verified: true`, a source name, and a source URL. A claim's `stationId` is either the case station or `null`; only the scenario claim uses `null`.

`DOCUMENTED_EVENT`, `DOCUMENTED_REGIONAL_EVENT`, `DOCUMENTED_NARRATIVE`, and `EVENT_WINDOW_MARKER` describe event/timeline records; they are not additional claim statuses. The Rutgers reported snowfall is stored in `event.weatherSummary` and the NOAA highest report in `event.additionalEventRecords`. Neither is in the empty chloride observations array.

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
| Toshit | Owns frontend integration in `app.js`, `index.html`, and `styles.css`; consumes the event, site, observations, sources, and limitations from the case JSON. The site loader maps only a site with `site.verified: true`. Preserve the distinction between reported totals, the NOAA event record, timeline markers, measured observations, and hypothetical scenarios. |
| Rithvik | Owns `evidence.js`, `investigation.js`, and Prove It; consumes `claims[]` and `mapFeatures[]`, including `claimType`, `supports[]`, `doesNotEstablish[]`, `nextEvidenceNeeded[]`, `evidenceGaps[]`, `supportingClaimIds[]`, and reciprocal claim/feature IDs. Documented-only filtering must not present inferred, assumed, or unknown features as verified. |
| Rohan | Maintains `engine.js`, calculation tests, and deployment support. Keep `SaltEngine.calculate()` as the shared material-and-cost calculator; do not add unsupported environmental predictions to its results. |
| Hemanth | Maintains environmental data in `data/case_study.json`, these verification notes, and `tests/test_case_study.js`. Audits sources and proposed observations, preserves limitations, and coordinates any evidence-status or schema changes. |

**Frontend.** As reviewed on `feature/frontend-demo` on November 15, 2026, `loadCaseStudy()` requires an `event` object and a `claims` array. It shows the event name and record type, applies `scenarioDefaults` to the scenario form, and maps `site` only when `site.verified` is `true` and the site has a name and valid coordinates. Its exported brief cites `event.sourceUrl` (Rutgers) and the site source. That loader does not yet render the NOAA record, weather summary, timeline, source registry, limitations, or `mapFeatures[]`.

**Prove It.** As reviewed on `feature/prove-it` on November 15, 2026, `validateCaseStudy()` accepts this JSON with no errors. `station-location-001` evaluates as `SUPPORTED` for its narrow location statement. The other three claims evaluate as `NOT PROVEN`, which means insufficient evidence, not a disproven hypothesis. Documented-only mode keeps `station-01401000` and removes `candidate-link-001`. The investigation module builds its recommended checks from each claim's `evidenceGaps[]`, lists `supportingClaimIds[]` as documented context, and uses `event.timezone` when matching sample dates to the investigation window. Prove It's event link reads `event.sourceUrl` and `event.sourceName`, so it shows Rutgers; the NOAA record is available from `event.additionalEventRecords` and `sources[]`.

The responsibilities above describe the integration contract, not proof that every frontend feature is implemented.

Preserve the claim and feature IDs listed in section 7. `claims[].featureIds`, `claims[].relatedFeatureIds`, and `mapFeatures[].claimId` must continue to agree. The station feature ID is `station-01401000`; the earlier `stony-brook-gage-001` is retired. Retain `geometry: null` for the unsupported connection, and keep source links and evidence gaps visible in future displays and exports. This documentation review does not change the JSON, calculation engine, or frontend.
