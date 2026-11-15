# SaltShadow — Prove It

A static, local integration demo for Rithvik’s evidence-verification workstream. The starting branch and all three inspected remote branches contained only `plan.md`; no teammate application, calculator, tests, or deployment configuration were present. The original plan is unchanged.

## Run

Requires Python 3 for the static server. Production has no package dependencies, build step, API keys, or remote asset requests.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000>. ES modules and JSON loading require HTTP rather than opening `index.html` as a file. The files also work below a GitHub Pages repository path. No hosting settings have been changed and nothing has been deployed.

## What works

- Select a connection, station, data gap, or scenario-assumption claim.
- Inspect evidence classification, original sources, supported conclusions, limitations, and recommended checks.
- Click **Challenge This Connection** to evaluate the selected claim. The conceptual connection returns **NOT PROVEN**; the audited station location returns **SUPPORTED** only for its narrow location statement.
- Enable **Documented Only** to remove the unsupported connection from the diagram and its clickable hit area. The documented station remains. Disable it to restore the hypothesis.
- Change the selected claim to get different deterministic investigation recommendations.
- Export a JSON evidence brief containing the current selection, audit results, active visibility filter, original sources, uncertainty, missing evidence, and recommendations.
- Use keyboard controls and a responsive layout; no external map tiles are needed for the core demo.

## Data and scientific limits

The station identity and published WGS84 coordinates come from [USGS Stony Brook at Princeton NJ](https://waterdata.usgs.gov/monitoring-location/USGS-01401000/). This is a **MAPPED location**, not a chloride measurement.

[NOAA’s Mercer County storm record](https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=1309897) documents the regional January 25 winter storm. Its event interval is January 25, 04:30–23:00 EST. January 25–26 is this demo’s investigation window; the app has no hourly weather replay or site weather series.

`observations: []` is deliberate. No event-matched chloride samples, municipal salt records, verified drainage network, specific road, or causal attribution are included. A **monitoring gap** means these records were not verified for this case, not that no records exist elsewhere or that chloride equals zero.

The central scene is explicitly a **conceptual evidence schematic**, not a geographic map or invented underground pipe. The actual station coordinates and an external geographic-map link are provided separately. Source and map links require a network connection; all core evidence interactions work without one after local files load.

This isolated workstream does not implement teammates’ historical replay, geographic map layer stack, or scenario calculator. Scenario assumptions remain **ASSUMED** and the export explicitly marks the calculator **NOT_INTEGRATED**. The integration API accepts an existing teammate calculator output without recomputing it. Nothing predicts stream chloride changes or guarantees road safety.

Synthetic measurements exist only in `tests/fixtures.js` for automated tests. They are visibly labeled synthetic and are never imported by the demo.

## Tests

Requires Node.js 18+. Unit tests use Node’s standard library and do not require installation:

```sh
npm test
# or
node --test tests/test_*.js
```

This workspace had no Node installation on `PATH`. This session used a portable Node 22.16.0 runtime in `/private/tmp/node-v22.16.0-darwin-arm64/`; it did not change system configuration. Until that temporary directory is removed, prefix npm commands with `PATH=/private/tmp/node-v22.16.0-darwin-arm64/bin:$PATH`.

Browser tests require Node.js 20+ and use the locked Playwright development dependency:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Alternatively use an installed Chrome browser without downloading Chromium:

```sh
SALTSHADOW_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:browser
```

The browser runner starts and stops its own localhost server on port 8000. Stop any manually started server on that port first. It checks the judging sequence, actual SVG visibility, hypothesis restoration, source URLs, selected-claim recommendations, JSON download, error states, events, keyboard controls, and 1280×720 / 390×844 layouts. Screenshots are written to `/private/tmp/saltshadow-1280.png` and `/private/tmp/saltshadow-390.png` on this Mac; test reports are ignored by Git.

Verified November 15, 2026 with the portable Node runtime and installed Chrome: **34 unit tests passed; 8 browser tests passed**. The browser server was stopped by the test runner after completion. This verifies localhost behavior; no deployed URL was tested.

See [TEAM_HANDOFF.md](TEAM_HANDOFF.md) for APIs, schema compatibility, and integration instructions.

## 30–45 second demo

1. **0–8s:** Open the app. Point out the historical investigation window and select the teal Stony Brook station. Explain that its mapped location is verified, but storm-matched chloride data is missing.
2. **8–15s:** Click the amber **UNVERIFIED LINK**. Read the possible road-to-stream relationship and its source limits.
3. **15–23s:** Click **Challenge This Connection**. Show **NOT PROVEN** and explain that insufficient evidence does not mean the hypothesis is false.
4. **23–32s:** Enable **Documented Only**. The connection disappears while the station remains. Point out the next drainage-record and sampling checks in the inspector.
5. **32–45s:** Disable Documented Only to restore the hypothesis, then export the evidence brief. It retains classifications and caveats.

No Git recording or publishing operations are performed by this application or its tooling.
