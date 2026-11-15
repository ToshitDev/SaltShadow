'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RUTGERS_URL = 'https://climate.rutgers.edu/articles/january-2026-report';
const USGS_URL = 'https://waterdata.usgs.gov/monitoring-location/USGS-01401000/';
const STATUSES = ['MEASURED', 'MAPPED', 'INFERRED', 'ASSUMED', 'UNKNOWN'];
const UNVERIFIED_STATUSES = ['INFERRED', 'ASSUMED', 'UNKNOWN'];

function assertObject(value, label) {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), label + ' must be an object.');
}

function assertText(value, label) {
  assert.ok(typeof value === 'string' && value.trim().length > 0, label + ' must be a nonempty string.');
}

function assertHttpsUrl(value, label) {
  assertText(value, label);
  let url;
  assert.doesNotThrow(() => { url = new URL(value); }, label + ' must be a valid absolute URL.');
  assert.equal(url.protocol, 'https:', label + ' must use HTTPS.');
  assert.ok(url.hostname.includes('.'), label + ' must identify a public source host.');
  assert.equal(url.username, '', label + ' must not contain credentials.');
  assert.equal(url.password, '', label + ' must not contain credentials.');
}

// A. JSON/schema and the event + claims contract used by app.js.
const casePath = path.join(__dirname, '..', 'data', 'case_study.json');
assert.ok(fs.existsSync(casePath), 'data/case_study.json must exist.');
let data;
assert.doesNotThrow(() => {
  data = JSON.parse(fs.readFileSync(casePath, 'utf8'));
}, 'data/case_study.json must be readable, valid JSON.');
assertObject(data, 'Case study');
assert.equal(data.schemaVersion, 1, 'schemaVersion must be 1.');
assertText(data.caseId, 'caseId');
for (const field of ['event', 'site', 'scenarioDefaults']) {
  assertObject(data[field], field);
}
for (const field of ['observations', 'claims', 'mapFeatures', 'sources', 'limitations']) {
  assert.ok(Array.isArray(data[field]), field + ' must be an array.');
}
const { event, site, observations, claims, mapFeatures, scenarioDefaults, sources, limitations } = data;

// B. Historical storm: a reported total, not an invented hourly/gage reading.
assert.equal(event.startDate, '2026-01-25', 'Storm startDate must be 2026-01-25.');
assert.equal(event.endDate, '2026-01-26', 'Storm endDate must be 2026-01-26.');
assertText(event.name, 'event.name');
assert.equal(event.sourceUrl, RUTGERS_URL, 'Storm source must be the Rutgers January 2026 report.');
assert.equal(event.recordType, 'DOCUMENTED_EVENT', 'Storm recordType must be DOCUMENTED_EVENT.');
assertObject(event.weatherSummary, 'event.weatherSummary');
const snowfall = event.weatherSummary.princetonReportedSnowfall;
assertObject(snowfall, 'Princeton reported snowfall');
assert.equal(snowfall.value, 10.0, 'Princeton reported snowfall must be 10.0 inches.');
assert.equal(snowfall.units, 'in', 'Reported snowfall units must be inches (in).');
assert.equal(snowfall.measurementType, 'REPORTED_STORM_TOTAL', 'Snowfall must be labeled REPORTED_STORM_TOTAL.');
assert.equal(snowfall.timeResolution, 'storm_total', 'Snowfall must not be represented as an hourly series.');
assert.equal(snowfall.observedAt, null, 'Snowfall must not have an invented observation timestamp.');
assert.equal(snowfall.location, 'Princeton, Mercer County, New Jersey, USA', 'Snowfall location must be Princeton, not the stream gage.');
assert.equal(snowfall.sourceUrl, RUTGERS_URL, 'Snowfall source must be the Rutgers report.');
assert.equal(snowfall.sourceName, 'Rutgers New Jersey State Climate Office, January 2026 Report, Table 4', 'Snowfall attribution must identify Rutgers Table 4.');
assert.equal(snowfall.sourceMethodNote,
  'Rutgers attributes the observations collectively to CoCoRaHS, NWS Cooperative Observer and NWS spotter reports; the individual Princeton reporter and exact time are not identified in the table.',
  'Preserve the reviewed snowfall method and unknown reporter/time limitations.');
assert.equal(snowfall.limitation, 'A storm-total report for Princeton, not an hourly series or stream-gage measurement.',
  'Snowfall must explicitly distinguish the town storm total from hourly/gage measurements.');
assert.ok(Array.isArray(event.timeline), 'event.timeline must be an array.');
assert.equal(event.timeline.length, 2, 'The reviewed timeline has two narrative/window markers.');
const timelineTypes = ['DOCUMENTED_NARRATIVE', 'EVENT_WINDOW_MARKER'];
event.timeline.forEach((entry, index) => {
  assertObject(entry, 'Timeline entry ' + index);
  assert.equal(entry.date, index === 0 ? event.startDate : event.endDate, 'Timeline dates must match the case window.');
  assert.equal(entry.recordType, timelineTypes[index], 'Timeline markers must not be presented as measurements.');
  assert.equal(entry.sourceUrl, RUTGERS_URL, 'Timeline attribution must reference Rutgers.');
  assertText(entry.title, 'Timeline title');
  assertText(entry.description, 'Timeline description');
});

// C. Independently reviewed USGS metadata.
assert.equal(site.stationId, 'USGS-01401000', 'Station ID must be USGS-01401000.');
assert.equal(site.name, 'Stony Brook at Princeton NJ', 'Station name must match USGS.');
assert.equal(site.latitude, 40.3330555555556, 'Station latitude must match the reviewed USGS value.');
assert.equal(site.longitude, -74.6819444444445, 'Station longitude must match the reviewed USGS value.');
assert.equal(site.coordinateDatum, 'WGS84', 'Station datum must be WGS84, not the legacy WQP datum.');
assert.equal(site.drainageAreaSquareMiles, 44.5, 'Station drainage area must be 44.5 square miles.');
assert.equal(site.siteType, 'Stream', 'USGS site type must be Stream.');
assert.equal(site.sourceUrl, USGS_URL, 'Station source must reference USGS-01401000.');

// D. The current case has no accepted measurements, including synthetic/zero placeholders.
// Check emptiness after measured-claim provenance below, so new MEASURED entries
// must first explain their underlying observation instead of skipping that check.
assert.equal(data.chlorideDataStatus, 'NO_EVENT_MATCHED_CHLORIDE_OBSERVATIONS_VERIFIED',
  'chlorideDataStatus must state that event-matched observations are not verified.');
assert.ok(limitations.includes('An empty observations array means no verified matching records in this case, not zero chloride.'),
  'Limitations must explain that missing observations do not mean zero chloride.');

// E. Claims: validate types, null metadata, evidence status, and provenance.
assert.ok(claims.length > 0, 'claims must contain at least one claim.');
const requiredClaimFields = [
  'id', 'text', 'status', 'verified', 'sourceName', 'sourceUrl', 'observedAt',
  'stationId', 'units', 'method', 'uncertainty', 'nextEvidenceNeeded', 'featureIds'
];
const claimsById = new Map();
for (const claim of claims) {
  assertObject(claim, 'Claim');
  for (const field of requiredClaimFields) {
    assert.ok(Object.prototype.hasOwnProperty.call(claim, field), 'Claim is missing required field: ' + field);
  }
  for (const field of ['id', 'text', 'status', 'uncertainty', 'nextEvidenceNeeded']) {
    assertText(claim[field], 'Claim ' + claim.id + '.' + field);
  }
  assert.ok(!claimsById.has(claim.id), 'Duplicate claim ID: ' + claim.id);
  claimsById.set(claim.id, claim);
  assert.ok(STATUSES.includes(claim.status), 'Invalid evidence status for ' + claim.id);
  assert.equal(typeof claim.verified, 'boolean', claim.id + '.verified must be a boolean.');
  for (const field of ['sourceName', 'sourceUrl', 'observedAt', 'stationId', 'units', 'method']) {
    if (claim[field] !== null) assertText(claim[field], claim.id + '.' + field);
  }
  if (claim.sourceUrl !== null) assertHttpsUrl(claim.sourceUrl, claim.id + '.sourceUrl');
  if (claim.observedAt !== null) {
    assert.ok(Number.isFinite(Date.parse(claim.observedAt)), claim.id + '.observedAt must be a valid date/time.');
  }
  assert.ok(Array.isArray(claim.featureIds), claim.id + '.featureIds must be an array.');
  claim.featureIds.forEach(id => assertText(id, claim.id + ' feature ID'));
  assert.equal(new Set(claim.featureIds).size, claim.featureIds.length, claim.id + ' must not repeat feature IDs.');
  if (UNVERIFIED_STATUSES.includes(claim.status)) {
    assert.equal(claim.verified, false, claim.id + ': inferred, assumed, and unknown claims cannot be verified.');
  }
  if (claim.verified) {
    assertText(claim.sourceName, claim.id + '.sourceName for verified evidence');
    assertHttpsUrl(claim.sourceUrl, claim.id + '.sourceUrl for verified evidence');
    assert.ok(sources.some(source => source && source.url === claim.sourceUrl), claim.id + ' must reference the source registry.');
  }
  if (claim.status === 'MEASURED') {
    assert.equal(claim.verified, true, claim.id + ': unverified evidence cannot be classified as MEASURED.');
    // No observation records/schema are present yet. Fail closed unless a future
    // original record supplies a value and matches the claim's existing provenance fields.
    const provenanceFields = ['stationId', 'observedAt', 'sourceUrl', 'units', 'method'];
    provenanceFields.forEach(field => assertText(claim[field], claim.id + ' measured ' + field));
    const observation = observations.find(record => record && provenanceFields.every(field => record[field] === claim[field]));
    assert.ok(observation, claim.id + ' requires a matching original observation with station, timestamp, source, units, and method.');
    assertObject(observation, claim.id + ' underlying observation');
    assert.ok(Number.isFinite(observation.value), claim.id + ' underlying observation must retain a finite original numeric value.');
  }
}
assert.equal(observations.length, 0,
  'Monitoring-gap observations must stay empty: no fabricated, synthetic-template, or zero-placeholder chloride records.');

// Pin the reviewed prose: keyword matching cannot prove scientific meaning.
// New claims or changed wording need evidence review before updating these expectations.
const reviewedClaims = [
  ['station-location-001', 'MAPPED', true,
    'USGS identifies and maps the Stony Brook at Princeton NJ stream monitoring location (01401000).'],
  ['hypothesis-runoff-001', 'INFERRED', false,
    'Road-salt runoff from an unidentified nearby road could reach this stream.'],
  ['chloride-gap-001', 'UNKNOWN', false,
    'Chloride concentration at this station during the January 2026 storm has not been established by the sources reviewed.']
];
assert.deepEqual([...claimsById.keys()].sort(), reviewedClaims.map(row => row[0]).sort(),
  'The monitoring-gap case must retain its three reviewed claims; additional claims require source review.');
for (const [id, status, verified, text] of reviewedClaims) {
  const claim = claimsById.get(id);
  assert.equal(claim.status, status, id + ' has an incorrect evidence classification.');
  assert.equal(claim.verified, verified, id + ' has an incorrect verification flag.');
  assert.equal(claim.text, text, id + ' must preserve reviewed wording; no verified chloride spike or causation is established.');
  assert.equal(claim.stationId, site.stationId, id + ' must refer to the case station.');
  assert.equal(claim.observedAt, null, id + ' must not invent a measurement timestamp.');
  assert.equal(claim.units, null, id + ' must not imply an observed concentration.');
}
const stationClaim = claimsById.get('station-location-001');
const runoffClaim = claimsById.get('hypothesis-runoff-001');
const gapClaim = claimsById.get('chloride-gap-001');
assert.equal(stationClaim.sourceUrl, USGS_URL, 'Verified station mapping must use the original USGS source.');
assert.equal(runoffClaim.sourceUrl, null, 'No source has verified the hypothetical runoff route.');
assert.equal(gapClaim.uncertainty,
  'Not verified does not mean no measurement exists. Raw event-matched result records have not been fully audited.',
  'The chloride gap must not be described as proof that measurements do not exist.');

// F. Map features and reciprocal evidence links.
const featuresById = new Map();
for (const feature of mapFeatures) {
  assertObject(feature, 'Map feature');
  assertText(feature.id, 'Map feature ID');
  assert.ok(!featuresById.has(feature.id), 'Duplicate map feature ID: ' + feature.id);
  featuresById.set(feature.id, feature);
  assertText(feature.claimId, feature.id + '.claimId');
  assert.ok(claimsById.has(feature.claimId), feature.id + ' must reference an existing claim.');
  const claim = claimsById.get(feature.claimId);
  assert.ok(claim.featureIds.includes(feature.id), feature.id + ' must be linked back from its claim.');
  assert.ok(STATUSES.includes(feature.status), feature.id + ' has an invalid status.');
  assert.equal(feature.status, claim.status, feature.id + ' status must match its claim.');
  assert.equal(typeof feature.showAsVerified, 'boolean', feature.id + '.showAsVerified must be a boolean.');
  assert.equal(feature.showAsVerified, claim.verified, feature.id + ' visibility must respect its verification status.');
  assertText(feature.kind, feature.id + '.kind');
  if (feature.kind === 'HYPOTHETICAL_CONNECTION') {
    assert.equal(feature.status, 'INFERRED', feature.id + ' hypothetical connection must be INFERRED.');
    assert.equal(feature.showAsVerified, false, feature.id + ' hypothetical connection cannot appear verified.');
    assert.equal(feature.geometry, null, feature.id + ' must not invent an unsourced road-to-stream route.');
  }
}
for (const claim of claims) {
  for (const id of claim.featureIds) {
    assert.ok(featuresById.has(id), claim.id + ' references missing map feature ' + id);
    assert.equal(featuresById.get(id).claimId, claim.id, id + ' must point back to the claim that references it.');
  }
}
assert.deepEqual([...featuresById.keys()].sort(), ['candidate-link-001', 'stony-brook-gage-001'],
  'Only the reviewed station and hypothetical connection belong in this case.');
const stationFeature = featuresById.get('stony-brook-gage-001');
assert.equal(stationFeature.kind, 'MONITORING_STATION', 'Station feature kind must be MONITORING_STATION.');
assert.equal(stationFeature.claimId, stationClaim.id, 'Station feature must reference station-location-001.');
assert.equal(stationFeature.status, 'MAPPED', 'Station feature must be MAPPED.');
assert.equal(stationFeature.showAsVerified, true, 'Reviewed station feature must show as verified.');
assertObject(stationFeature.geometry, 'Station geometry');
assert.equal(stationFeature.geometry.type, 'Point', 'Station geometry must be a GeoJSON Point.');
assert.deepEqual(stationFeature.geometry.coordinates, [site.longitude, site.latitude],
  'Station coordinates must use GeoJSON [longitude, latitude] ordering.');
const candidateFeature = featuresById.get('candidate-link-001');
assert.equal(candidateFeature.kind, 'HYPOTHETICAL_CONNECTION', 'Candidate link must remain a hypothetical connection.');
assert.equal(candidateFeature.claimId, runoffClaim.id, 'Candidate link must reference hypothesis-runoff-001.');
assert.deepEqual(gapClaim.featureIds, [], 'The chloride gap must not imply a mapped measurement feature.');

// G. Scenario assumptions are not real municipal treatment records.
assert.equal(scenarioDefaults.status, 'ASSUMED', 'Scenario inputs must be labeled ASSUMED.');
const expectedScenario = { laneMiles: 6, rateLbPerLaneMile: 250, reductionPct: 20, priceUsdPerShortTon: 105 };
for (const [field, expected] of Object.entries(expectedScenario)) {
  assert.ok(Number.isFinite(scenarioDefaults[field]), 'Scenario ' + field + ' must be a finite number.');
  assert.equal(scenarioDefaults[field], expected, 'Scenario ' + field + ' must match the reviewed hypothetical default.');
}
assert.ok(scenarioDefaults.reductionPct >= 0 && scenarioDefaults.reductionPct <= 100,
  'Scenario reductionPct must be between 0 and 100.');

// H. Source registry and explicit scientific limitations.
const sourcesById = new Map();
for (const source of sources) {
  assertObject(source, 'Source');
  for (const field of ['id', 'name', 'url', 'supports']) assertText(source[field], 'Source ' + field);
  assert.ok(!sourcesById.has(source.id), 'Duplicate source ID: ' + source.id);
  sourcesById.set(source.id, source);
  assertHttpsUrl(source.url, source.id + '.url');
}
const expectedSources = {
  'rutgers-jan-2026': RUTGERS_URL,
  'usgs-01401000': USGS_URL,
  'wqp-site-usgs': 'https://waterqualitydata.us/provider/NWIS/USGS-NJ/USGS-01401000/',
  'nj-salt-watch': 'https://njwatershedwatch.org/road-salt/'
};
for (const [id, url] of Object.entries(expectedSources)) {
  assert.ok(sourcesById.has(id), 'Missing reviewed source: ' + id);
  assert.equal(sourcesById.get(id).url, url, id + ' must preserve the reviewed original source URL.');
}
assert.ok(limitations.length > 0, 'limitations must contain meaningful entries.');
limitations.forEach((entry, index) => assertText(entry, 'Limitation ' + index));
const requiredLimitations = [
  'No event-matched chloride measurement has been verified for USGS-01401000.',
  "Princeton's snowfall is a reported storm total, not a station-specific hourly series.",
  'No particular road, outfall, transport route, or road-salt contribution has been proven.',
  'All salt scenario inputs and costs are hypothetical.',
  'An empty observations array means no verified matching records in this case, not zero chloride.'
];
for (const limitation of requiredLimitations) {
  assert.ok(limitations.includes(limitation), 'Missing reviewed evidence limitation: ' + limitation);
}
assert.equal(runoffClaim.uncertainty,
  'No road-specific treatment records, validated drainage connection, matched chloride samples, or causal attribution have been verified.',
  'Runoff uncertainty must preserve the missing drainage, treatment, sample, and causation evidence.');

// Offline regression checks protect the reviewed contract; they cannot authenticate
// measurements or re-audit live sources. Future observations require a schema/source review.
console.log('Case study tests passed (8 categories; ' + claims.length + ' claims, ' + observations.length + ' observations).');
