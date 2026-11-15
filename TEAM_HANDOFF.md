# Prove It integration handoff

## Boundaries and starting state

Implemented on `feature/prove-it` without changing branches, staging, committing, or publishing. The initial working tree was clean. `origin/main`, `origin/feature/verified-case`, and `origin/rohan/salt-simulation-testing` were inspected with `git ls-tree`; each contained only `plan.md` at inspection time. No unseen remote updates are assumed.

All application files are additions. `index.html`, `app.js`, and `styles.css` provide an isolated demo shell, not a replacement for a teammate’s existing UI. Integrators may instead import the pure modules into their application and use the event contract below. No new calculator competes with the scenario teammate’s future implementation. The data file is a source-reviewed fallback starter for the evidence lead to review, not a claim of team schema approval.

## Pure evidence API

```js
import { createEvidenceEngine, validateClaim, validateCaseStudy } from './evidence.js';
import { recommendInvestigation } from './investigation.js';

const validation = validateCaseStudy(caseStudy);
if (!validation.valid) throw new Error(validation.errors.join('\n'));
const evidence = createEvidenceEngine(caseStudy);
const selected = evidence.getClaimById('hypothesis-runoff-001');
const audit = evidence.evaluateClaim(selected.id);
const report = recommendInvestigation(caseStudy, selected.id);
const visible = evidence.getVisibleFeatures('documented');
```

An engine captures a private snapshot; recreate it after an evidence-lead-approved data update. Returned values are copies. No module fetches records, performs asynchronous reasoning, or promotes an inference automatically.

| Function | Result |
| --- | --- |
| `validateClaim(claim)` | `{ valid, errors }` including missing fields |
| `validateCaseStudy(caseStudy)` | Schema, classification, ID, and reciprocal feature-reference checks |
| `getClaimById(id)` | Claim copy or `null` |
| `getClaimEvidence(id)` | `{ claim, evaluation }` |
| `evaluateClaim(id)` | Result, support boolean, source, uncertainty, limits, missing evidence, feature IDs |
| `getMissingEvidence(id)` | Actionable missing evidence array |
| `getClaims(mode)` | Claim copies; mode defaults to `hypotheses` |
| `getVisibleFeatures(mode)` | Features to keep; `documented` or `hypotheses` |
| `exportEvidence()` | All claims with classifications, provenance and evaluations |
| `recommendInvestigation(caseStudy, claimId)` | `observed`, `possibleExplanations`, `notEstablished`, `recommendedNextEvidence`, `chlorideData`, `relatedFeatures` |

`NOT PROVEN` always has `disproven: false`. `SUPPORTED` means the source-audited **narrow statement** is supported; it does not erase `doesNotEstablish`. A location source never establishes a measured value or causal connection. Missing IDs fail closed with a next-evidence action. Invalid filters throw rather than silently showing hypotheses.

## v1 data contract

Top-level fields are `schemaVersion: 1`, `caseId`, `event`, `site`, `observations`, `claims`, `mapFeatures`, and `scenarioDefaults`. Optional `sourceAudit` records scope and date of the source review.

Claims use the requested `id`, `text`, `status`, `verified`, `sourceName`, `sourceUrl`, `observedAt`, `stationId`, `units`, `method`, `uncertainty`, `supports`, `doesNotEstablish`, `nextEvidenceNeeded`, and `relatedFeatureIds` fields. Explanatory lists are string arrays. The earlier plan’s `featureIds` alias is also accepted; if both aliases appear they must agree. Use one authoritative case file.

Additional fields prevent overclassification:

- `claimType`: `LOCATION` for `MAPPED`, `OBSERVATION` for `MEASURED`, or `CONNECTION`, `SCENARIO`, `DATA_GAP` for this demo’s other statements.
- `MEASURED` requires a finite `value`, `observedProperty`, date, station, units, method, named source URL, and human-audited `verified: true`. Zero is accepted only when explicitly supplied as an observed value. Missing values stay missing.
- `INFERRED`, `ASSUMED`, and `UNKNOWN` require `verified: false`; adding a source URL cannot promote them.
- `supportingClaimIds` optionally links a hypothesis to documented underlying facts, without treating those facts as proof of the hypothesis.
- `evidenceGaps` drives recommendations: `connectivity`, `application`, `chloride`, `sampling`, `method`, `timing`, `safety`. For other gaps, the original `nextEvidenceNeeded` remains available.

Every map feature has an ID, `claimId`, classification, and reciprocal reference from its claim. Geometry is GeoJSON. The hypothetical connection deliberately has `geometry: null` and `presentation: CONCEPTUAL_SCHEMATIC_ONLY`. **Never pass its schematic screen coordinates to Leaflet as a real road or drainage route.** A documented feature must also have a valid, supported claim; `showAsVerified: true` alone cannot bypass the audit.

Raw `observations` rows are retained for exports but are not automatically trusted. To make an audited sample available to the investigation engine, the evidence owner must create a complete `MEASURED` observation claim. Only chloride claims with the same station and investigation dates can close this demo’s sample-availability gap. Timestamp matching uses `event.timezone` (default `America/New_York`); date-only records retain their reported day. Timestamp strings require an explicit offset or `Z`. Measurements still do not establish causation.

## UI and map adapters

`prove-it.js` exports `mountProveIt(document, caseStudy, options)` for the provided demo markup, returning `{ engine, selectClaim, setMode, exportBrief }`. Its SVG and named controls are demo-specific; the pure engines work with any UI.

Every selection, challenge, or filter change emits a bubbling DOM event:

```js
document.addEventListener('saltshadow:evidence-change', ({ detail }) => {
  // detail: selectedClaimId, mode, visibleFeatureIds, evaluation, investigation
  for (const [id, layer] of featureLayers) {
    if (detail.visibleFeatureIds.includes(id)) {
      if (!map.hasLayer(layer)) map.addLayer(layer);
    } else if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  }
  highlightSelectedClaim(detail.selectedClaimId);
});
```

Register the listener before mounting to receive the initial event. Keep layer references to restore hypotheses. **Remove unsupported layers**; a label or color change is insufficient. Keep the selected claim in the inspector even when its connection is hidden, so its next investigation checks remain readable. A claim ledger can keep unsupported claims available for audit while the map uses documented-only filtering.

## Scenario and export adapter

```js
import { mountProveIt, buildEvidenceBrief } from './prove-it.js';

const ui = mountProveIt(document, caseStudy, {
  getScenario: () => currentScenarioResult // output from teammate-owned SaltEngine.calculate
});
const brief = ui.exportBrief();
// Or use buildEvidenceBrief(caseStudy, { selectedClaimId, mode, challenged, scenario }).
```

The optional scenario object is copied unchanged. The evidence module does not calculate quantities or assert that caller-provided numbers are audited. The scenario owner should validate inputs and retain hypothetical labels. Integration acceptance examples remain **300 lb not applied** and **$15.75 material-only savings** for the plan’s 6 lane-mile, 250 lb/lane-mile, 20%, $105/short-ton inputs. These equations were not reimplemented here; the export test only verifies preserving teammate-supplied output.

Without a calculator, the brief reports `scenario.state: NOT_INTEGRATED` and includes explicitly assumed defaults. The JSON export always includes original sources, observations, claim evaluations, recommendations, uncertainty, filter state, visible feature IDs, current selection, and limitations.

## Release handoff

Run the unit and browser commands in README. This work verifies a **localhost** demo only. Teammates must integrate their replay, map and calculator, perform their own source audit of new records, and test the full two-minute flow on the final deployed URL. Hosting/deployment and all Git recording/publishing operations remain with the user and integration owner.
