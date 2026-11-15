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
