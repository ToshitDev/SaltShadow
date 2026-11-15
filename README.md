# SaltShadow — The Winter Storm Crime Scene

SaltShadow is a HackPrinceton sustainability project that helps people explore a winter-storm investigation, test transparent road-salt scenarios, and distinguish evidence from assumptions. It is intentionally an investigation aid, not a pollution prediction or road-treatment recommendation.

## Current starter features

- Responsive plain HTML/CSS/JavaScript dashboard with the REWIND → INVESTIGATE → INTERVENE → PROVE IT flow.
- Princeton-area Leaflet/OpenStreetMap view, with a no-station-loaded state and tile-failure fallback.
- Clearly labeled **ILLUSTRATIVE DEMONSTRATION** storm replay with Play, Pause, and Reset controls.
- Deterministic `SaltEngine.calculate()` calculator for hypothetical material quantities and costs.
- Downloadable decision brief that records scenario inputs, outputs, data availability, and limitations.
- Evidence-status overview and documented `claims[]` integration point for the future Prove It engine.
- A synthetic-only CSV template; it is never displayed as environmental data.

## Not yet implemented

- A source-audited historic storm event, weather records, or verified monitoring-station coordinates.
- Event-matched chloride measurements or a chloride trend.
- Prove It claim inspection, documented-only filtering, and map-feature visibility controls (owned by Rithvik).
- Environmental data validation and `data/case_study.json` delivery (owned by Hemanth).
- Hydrology, drainage connectivity, chloride impact, road-safety, and municipal-operations models.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). A server is useful because the app will gracefully attempt to load a future `data/case_study.json` file.

## Run tests

```bash
node tests/test_engine.js
```

To run every unit and integration test (Node.js 22 or later):

```bash
for test in tests/test_*.js tests/test_*.mjs; do node "$test" || exit; done
```

## Intervene additions

The existing calculator now includes selectable **10%, 20%, and 30% Less Salt**
cards. Each calls `SaltEngine.calculate()` with the current lane-miles, rate, and
price. Applied salt is `baseline × (1 − reduction / 100)`; salt not applied is
`baseline × reduction / 100`; material cost difference is `salt not applied / 2000
× price per US short ton`. Currency uses one USD formatter with two decimals in
the calculator, cards, and decision brief. At 6 lane-miles, 250 lb/lane-mile, and
$105/US short ton, the cards show 1,350/1,200/1,050 lb applied,
150/300/450 lb not applied, and $7.88/$15.75/$23.63 in material difference.

Selecting a card synchronizes the existing slider and the scenario snapshot used
by both exports. A custom slider value clears the highlight. Baseline inputs
recalculate every card; invalid inputs clear results instead of preserving stale
values. The existing scenario calculator and Prove It modules remain in place.

**Salt Use Guidance** takes pavement temperature (°F) and road condition. It
shows short FHWA practice summaries and source links, with no numerical rate
because these inputs cannot establish a matching published treatment condition.
An expandable freshwater note distinguishes EPA water-concentration criteria
from salt application. See [source verification and units](data/salt_guidance_sources.md).

For browser checks, serve the site using the local command above and test at
1280px and 390px widths: select each preset, move the slider to 17%, edit each
baseline input, and download both briefs. Confirm the current scenario appears
in both exports. Try blank, below-15°F, above-freezing, and unknown road conditions
in the guidance card. In Prove It, select the runoff hypothesis, challenge it,
toggle Documented evidence only, and confirm the result stays NOT PROVEN.

## Scientific limitations

All scenario inputs are illustrative assumptions, not municipal treatment data. The calculation reports material mass and material-only cost difference only. It does not model roadway safety, stream chloride, runoff, drainage paths, or causation. A Princeton-area map center is not a confirmed monitoring site, and no road is identified as a pollution source. The replay is explicitly illustrative until source-audited records are provided.

## Sources and attribution

- Map tiles and visible map data: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- No weather, station, or chloride source is currently claimed because verified records have not been integrated.
- `data/chloride_template.csv` is explicitly synthetic example data, not a source.

## Team responsibilities

| Team member | Responsibility |
| --- | --- |
| Toshit | Frontend, integration, demo |
| Rithvik | Prove It and evidence verification |
| Hemanth | Environmental data and investigation |
| Rohan | Scenario calculations, tests, deployment support |

## Integration contract

When Hemanth provides `data/case_study.json`, `app.js` expects a structure compatible with the plan: an `event` object and a shared `claims` array. The UI will load it without treating it as verified by default. Rithvik's future Prove It module should own claim rendering, statuses, source review, and documented-only map filtering; this starter deliberately does not duplicate that advanced module.
