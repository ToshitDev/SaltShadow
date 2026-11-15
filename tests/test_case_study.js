'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Regression checks for the reconciled Princeton case study, whose claim schema is shared
// with the Prove It evidence contract. Identifiers, numbers, URLs, and evidence
// classifications are pinned exactly. Prose is only checked for the scientific caveats it
// must carry, so wording can be edited without widening what the case is allowed to claim.

const RUTGERS_URL = 'https://climate.rutgers.edu/articles/january-2026-report';
const NOAA_URL = 'https://www.ncei.noaa.gov/stormevents/eventdetails.jsp?id=1309897';
const NOAA_SOURCE_ID = 'noaa-ncei-1309897';
const USGS_URL = 'https://waterdata.usgs.gov/monitoring-location/USGS-01401000/';
const STATION_FEATURE_ID = 'station-01401000';
const CANDIDATE_FEATURE_ID = 'candidate-link-001';
const STATUSES = ['MEASURED', 'MAPPED', 'INFERRED', 'ASSUMED', 'UNKNOWN'];
const DOCUMENTED_STATUSES = ['MEASURED', 'MAPPED'];
const UNVERIFIED_STATUSES = ['INFERRED', 'ASSUMED', 'UNKNOWN'];
// Vocabulary of the Prove It evidence contract: claim types, and the evidence-gap codes
// its investigation module can turn into a recommended next check.
const CLAIM_TYPES = ['LOCATION', 'OBSERVATION', 'CONNECTION', 'SCENARIO', 'DATA_GAP'];
const EVIDENCE_GAP_CODES = ['connectivity', 'application', 'chloride', 'sampling', 'method', 'timing', 'safety'];

function assertObject(value, label) {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), label + ' must be an object.');
}

function assertText(value, label) {
  assert.ok(typeof value === 'string' && value.trim().length > 0, label + ' must be a nonempty string.');
}

function assertTextList(value, label, allowEmpty) {
  assert.ok(Array.isArray(value), label + ' must be an array of strings, not a single string.');
  if (!allowEmpty) assert.ok(value.length > 0, label + ' must contain at least one entry.');
  value.forEach((entry, index) => assertText(entry, label + '[' + index + ']'));
  assert.equal(new Set(value).size, value.length, label + ' must not repeat entries.');
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

// Calendar date of an instant in the investigation's own time zone.
function localDate(dateTime, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(dateTime));
  const part = type => parts.find(item => item.type === type).value;
  return part('year') + '-' + part('month') + '-' + part('day');
}

// A. JSON/schema and the event + claims contract used by app.js.
const casePath = path.join(__dirname, '..', 'data', 'case_study.json');
assert.ok(fs.existsSync(casePath), 'data/case_study.json must exist.');
let rawCase;
let data;
assert.doesNotThrow(() => {
  rawCase = fs.readFileSync(casePath, 'utf8');
  data = JSON.parse(rawCase);
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
const isRegisteredSource = url => sources.some(source => source && source.url === url);

// B. Historical storm: Rutgers is the primary source, NOAA an additional event record.
// Neither is an hourly series or a stream-gage reading.
assert.equal(event.startDate, '2026-01-25', 'Investigation window startDate must be 2026-01-25.');
assert.equal(event.endDate, '2026-01-26', 'Investigation window endDate must be 2026-01-26.');
assertText(event.name, 'event.name');
assert.equal(event.recordType, 'DOCUMENTED_EVENT', 'Storm recordType must be DOCUMENTED_EVENT.');
assert.equal(event.timezone, 'America/New_York', 'Event timezone must be the Princeton-area zone used for date matching.');
assert.equal(event.sourceUrl, RUTGERS_URL, 'Rutgers must remain the primary event source.');
assertText(event.sourceName, 'event.sourceName');
assert.match(event.sourceName, /Rutgers/, 'event.sourceName must attribute the primary event source to Rutgers.');
assert.ok(isRegisteredSource(event.sourceUrl), 'The primary event source must be in the source registry.');

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
assertText(snowfall.sourceName, 'Snowfall sourceName');
assert.match(snowfall.sourceName, /Rutgers/, 'Snowfall attribution must name Rutgers.');
assert.match(snowfall.sourceName, /Table 4/, 'Snowfall attribution must identify Rutgers Table 4.');
assertText(snowfall.sourceMethodNote, 'Snowfall sourceMethodNote');
assertText(snowfall.limitation, 'Snowfall limitation');
assert.match(snowfall.limitation, /not\b[^.]*\bhourly/i, 'Snowfall limitation must state that the total is not an hourly series.');

assert.ok(Array.isArray(event.timeline) && event.timeline.length > 0, 'event.timeline must be a nonempty array.');
const timelineTypes = ['DOCUMENTED_NARRATIVE', 'EVENT_WINDOW_MARKER'];
event.timeline.forEach((entry, index) => {
  assertObject(entry, 'Timeline entry ' + index);
  assert.match(String(entry.date), /^\d{4}-\d{2}-\d{2}$/, 'Timeline entries carry calendar dates, not invented times.');
  assert.ok(entry.date >= event.startDate && entry.date <= event.endDate, 'Timeline dates must fall inside the investigation window.');
  if (index > 0) assert.ok(entry.date >= event.timeline[index - 1].date, 'Timeline must be chronological.');
  assert.ok(timelineTypes.includes(entry.recordType), 'Timeline entries are narratives or window markers, never measurements.');
  assert.ok(isRegisteredSource(entry.sourceUrl), 'Timeline attribution must reference a registered source.');
  assertText(entry.title, 'Timeline title');
  assertText(entry.description, 'Timeline description');
});
assert.ok(event.timeline.some(entry => entry.date === event.startDate && entry.recordType === 'DOCUMENTED_NARRATIVE'),
  'The storm date must be backed by a documented narrative entry.');

assert.ok(Array.isArray(event.additionalEventRecords), 'event.additionalEventRecords must be an array.');
for (const record of event.additionalEventRecords) {
  assertObject(record, 'Additional event record');
  assertText(record.sourceId, 'Additional event record sourceId');
  assertHttpsUrl(record.sourceUrl, record.sourceId + '.sourceUrl');
  const registered = sources.find(source => source && source.id === record.sourceId);
  assert.ok(registered, record.sourceId + ' must be listed in the source registry.');
  assert.equal(registered.url, record.sourceUrl, record.sourceId + ' must use its registered source URL.');
  assert.notEqual(record.sourceUrl, event.sourceUrl, record.sourceId + ' is additional context and must not replace the primary event source.');
}
const noaa = event.additionalEventRecords.find(record => record.sourceId === NOAA_SOURCE_ID);
assertObject(noaa, 'NOAA event record ' + NOAA_SOURCE_ID);
assert.equal(noaa.eventId, '1309897', 'NOAA record must be Storm Events Database event 1309897.');
assert.equal(noaa.sourceUrl, NOAA_URL, 'NOAA record must link to event 1309897.');
assertText(noaa.sourceName, 'NOAA sourceName');
assert.match(noaa.sourceName, /NOAA/, 'NOAA record must be attributed to NOAA.');
assert.equal(noaa.recordType, 'DOCUMENTED_REGIONAL_EVENT', 'NOAA record is a regional event record, not the case event itself.');
assert.equal(noaa.eventType, 'Winter Storm', 'NOAA classifies the event as a Winter Storm.');
assertText(noaa.location, 'NOAA location');
assert.match(noaa.location, /Mercer County/, 'NOAA record is county-level (Mercer County), not a site measurement.');
assert.equal(noaa.reportSource, 'CoCoRaHS', 'NOAA lists CoCoRaHS as the report source.');
for (const field of ['beginDateTime', 'endDateTime']) {
  assertText(noaa[field], 'NOAA ' + field);
  assert.match(noaa[field], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/, 'NOAA ' + field + ' needs an explicit UTC offset.');
}
assert.equal(Date.parse(noaa.beginDateTime), Date.parse('2026-01-25T04:30:00-05:00'), 'NOAA event begins January 25, 2026 at 04:30 EST.');
assert.equal(Date.parse(noaa.endDateTime), Date.parse('2026-01-25T23:00:00-05:00'), 'NOAA event ends January 25, 2026 at 23:00 EST.');
assert.equal(noaa.timeResolution, 'event_record_interval', 'NOAA begin/end times bound an event record, not an hourly series.');
// The NOAA record covers January 25 only; the investigation window runs one day longer.
assert.equal(localDate(noaa.beginDateTime, event.timezone), event.startDate, 'NOAA event must begin on the first day of the investigation window.');
assert.equal(localDate(noaa.endDateTime, event.timezone), event.startDate, 'NOAA event record covers January 25 only.');
assert.ok(event.endDate > localDate(noaa.endDateTime, event.timezone),
  'The January 25–26 investigation window must stay distinct from the NOAA event interval.');
const noaaTotal = noaa.highestReportedStormTotal;
assertObject(noaaTotal, 'NOAA highest reported storm total');
assert.equal(noaaTotal.value, 10.0, 'NOAA highest reported storm total must be 10.0 inches.');
assert.equal(noaaTotal.units, 'in', 'NOAA storm total units must be inches (in).');
assert.equal(noaaTotal.measurementType, 'HIGHEST_REPORTED_STORM_TOTAL', 'NOAA total must be labeled as the highest report, not a site measurement.');
assert.equal(noaaTotal.timeResolution, 'storm_total', 'NOAA total must not be represented as an hourly series.');
assert.equal(noaaTotal.observedAt, null, 'NOAA total must not have an invented observation timestamp.');
assertText(noaaTotal.location, 'NOAA storm total location');
assert.match(noaaTotal.location, /^Princeton\b/, 'NOAA highest report is for Princeton, not the stream gage.');
assertText(noaa.sourceMethodNote, 'NOAA sourceMethodNote');
assertText(noaa.limitation, 'NOAA limitation');
// Rutgers and NOAA both list 10.0 in for Princeton and may rest on the same observer report.
assert.match(noaa.limitation, /not\b[^.]*\bindependent/i,
  'The NOAA record must state that its total is not confirmed to be independent of the Rutgers total.');

// C. Independently reviewed USGS metadata. site.verified covers identity and location only.
assert.equal(site.stationId, 'USGS-01401000', 'Station ID must be USGS-01401000.');
assert.equal(site.name, 'Stony Brook at Princeton NJ', 'Station name must match USGS.');
assert.equal(site.siteType, 'Stream', 'USGS site type must be Stream.');
assert.equal(site.latitude, 40.3330555555556, 'Station latitude must match the reviewed USGS value.');
assert.equal(site.longitude, -74.6819444444445, 'Station longitude must match the reviewed USGS value.');
assert.equal(site.coordinateDatum, 'WGS84', 'Station datum must be WGS84, not the legacy WQP datum.');
assertText(site.coordinateAccuracyNote, 'site.coordinateAccuracyNote');
assert.equal(site.drainageAreaSquareMiles, 44.5, 'Station drainage area must be 44.5 square miles.');
assert.equal(site.county, 'Mercer County', 'Station county must be Mercer County.');
assert.equal(site.state, 'New Jersey', 'Station state must be New Jersey.');
assert.equal(site.verified, true, 'site.verified must be true: the station identity and location were source-audited, and the map only shows verified sites.');
assert.equal(site.sourceUrl, USGS_URL, 'Station source must reference USGS-01401000.');
assertText(site.sourceName, 'site.sourceName');
assert.match(site.sourceName, /USGS/, 'site.sourceName must attribute the station to USGS.');
assert.ok(isRegisteredSource(site.sourceUrl), 'The station source must be in the source registry.');

// D. Chloride data: nothing measured, nothing synthetic.
// Observation emptiness is asserted after the measured-claim provenance checks below, so a
// new MEASURED entry must first explain its underlying observation instead of skipping that check.
assert.equal(data.chlorideDataStatus, 'NO_EVENT_MATCHED_CHLORIDE_OBSERVATIONS_VERIFIED',
  'chlorideDataStatus must state that event-matched observations are not verified.');
const templatePath = path.join(__dirname, '..', 'data', 'chloride_template.csv');
if (fs.existsSync(templatePath)) {
  const templateRows = fs.readFileSync(templatePath, 'utf8').split(/\r?\n/)
    .filter(line => line.trim() && !line.startsWith('#')).slice(1);
  for (const row of templateRows) {
    const [sampleId, , siteId] = row.split(',');
    for (const marker of [sampleId, siteId]) {
      assert.ok(!rawCase.includes(marker), 'Synthetic template identifier ' + marker + ' must not appear in the real case study.');
    }
  }
}

// E. Claims: evidence schema, classification rules, and provenance. Claims are looked up
// by ID throughout; nothing here depends on their order in the array.
assert.ok(claims.length > 0, 'claims must contain at least one claim.');
const requiredClaimFields = [
  'id', 'text', 'claimType', 'status', 'verified', 'sourceName', 'sourceUrl', 'observedAt',
  'stationId', 'units', 'method', 'uncertainty', 'supports', 'doesNotEstablish',
  'nextEvidenceNeeded', 'evidenceGaps', 'featureIds', 'relatedFeatureIds'
];
const claimsById = new Map();
for (const claim of claims) {
  assertObject(claim, 'Claim');
  for (const field of requiredClaimFields) {
    assert.ok(Object.prototype.hasOwnProperty.call(claim, field), 'Claim is missing required field: ' + field);
  }
  for (const field of ['id', 'text', 'claimType', 'status', 'uncertainty']) {
    assertText(claim[field], 'Claim ' + claim.id + '.' + field);
  }
  assert.ok(!claimsById.has(claim.id), 'Duplicate claim ID: ' + claim.id);
  claimsById.set(claim.id, claim);
  assert.ok(STATUSES.includes(claim.status), 'Invalid evidence status for ' + claim.id);
  assert.ok(CLAIM_TYPES.includes(claim.claimType), 'Invalid claimType for ' + claim.id);
  assert.equal(typeof claim.verified, 'boolean', claim.id + '.verified must be a boolean.');
  for (const field of ['sourceName', 'sourceUrl', 'observedAt', 'stationId', 'units', 'method']) {
    if (claim[field] !== null) assertText(claim[field], claim.id + '.' + field);
  }
  if (claim.shortLabel !== undefined) assertText(claim.shortLabel, claim.id + '.shortLabel');
  if (claim.sourceUrl !== null) {
    assertHttpsUrl(claim.sourceUrl, claim.id + '.sourceUrl');
    assert.ok(isRegisteredSource(claim.sourceUrl), claim.id + ' must reference the source registry.');
  }
  assert.ok(claim.stationId === null || claim.stationId === site.stationId, claim.id + ' may only reference the case station.');

  // Evidence lists are arrays of strings; a single string is the old schema.
  for (const field of ['supports', 'doesNotEstablish', 'nextEvidenceNeeded', 'evidenceGaps']) {
    assertTextList(claim[field], claim.id + '.' + field, false);
  }
  for (const code of claim.evidenceGaps) {
    assert.ok(EVIDENCE_GAP_CODES.includes(code), claim.id + ' has an unknown evidence gap code: ' + code);
  }
  assertTextList(claim.featureIds, claim.id + '.featureIds', true);
  assertTextList(claim.relatedFeatureIds, claim.id + '.relatedFeatureIds', true);
  assert.deepEqual(claim.relatedFeatureIds, claim.featureIds, claim.id + ': featureIds and relatedFeatureIds must match exactly.');

  // Classification rules shared with the Prove It validator.
  if (UNVERIFIED_STATUSES.includes(claim.status)) {
    assert.equal(claim.verified, false, claim.id + ': inferred, assumed, and unknown claims cannot be verified.');
  }
  if (DOCUMENTED_STATUSES.includes(claim.status)) {
    assert.equal(claim.verified, true, claim.id + ': a documented classification requires a source audit.');
  }
  if (claim.verified) {
    assertText(claim.sourceName, claim.id + '.sourceName for verified evidence');
    assertHttpsUrl(claim.sourceUrl, claim.id + '.sourceUrl for verified evidence');
  }
  if (claim.status === 'MAPPED') {
    assert.equal(claim.claimType, 'LOCATION', claim.id + ': MAPPED supports location claims only, not measurements or connections.');
  }
  if (claim.claimType === 'CONNECTION') {
    assert.ok(UNVERIFIED_STATUSES.includes(claim.status), claim.id + ': a road-to-stream connection cannot be classified as documented.');
  }
  assert.equal(claim.claimType === 'OBSERVATION', claim.status === 'MEASURED', claim.id + ': OBSERVATION and MEASURED must go together.');
  if (claim.status === 'MEASURED') {
    // Fail closed unless an original record supplies a value and matches the claim's provenance.
    const provenanceFields = ['stationId', 'observedAt', 'sourceUrl', 'units', 'method'];
    provenanceFields.forEach(field => assertText(claim[field], claim.id + ' measured ' + field));
    assert.ok(Number.isFinite(Date.parse(claim.observedAt)), claim.id + '.observedAt must be a valid date/time.');
    assertText(claim.observedProperty, claim.id + ' measured observedProperty');
    assert.ok(Number.isFinite(claim.value), claim.id + ' must carry a finite observed value; missing is not zero.');
    const observation = observations.find(record => record && provenanceFields.every(field => record[field] === claim[field]));
    assert.ok(observation, claim.id + ' requires a matching original observation with station, timestamp, source, units, and method.');
    assertObject(observation, claim.id + ' underlying observation');
    assert.ok(Number.isFinite(observation.value), claim.id + ' underlying observation must retain a finite original numeric value.');
  } else {
    assert.equal(claim.observedAt, null, claim.id + ' must not invent a measurement timestamp.');
    assert.equal(claim.units, null, claim.id + ' must not imply an observed concentration.');
    assert.ok(!Object.prototype.hasOwnProperty.call(claim, 'value'), claim.id + ' must not carry an observed value.');
  }
}
for (const claim of claims) {
  if (claim.supportingClaimIds === undefined) continue;
  assertTextList(claim.supportingClaimIds, claim.id + '.supportingClaimIds', false);
  for (const id of claim.supportingClaimIds) {
    assert.notEqual(id, claim.id, claim.id + ' cannot support itself.');
    assert.ok(claimsById.has(id), claim.id + ' references missing supporting claim ' + id);
    assert.equal(claimsById.get(id).verified, true, claim.id + ' may only cite verified claims as supporting facts.');
  }
}
assert.equal(observations.length, 0,
  'Monitoring-gap observations must stay empty: no fabricated, synthetic-template, or zero-placeholder chloride records.');

// The reviewed classification of each claim. Adding, removing, or reclassifying a claim
// needs an evidence review before these expectations change.
const reviewedClaims = {
  'hypothesis-runoff-001': { status: 'INFERRED', verified: false, claimType: 'CONNECTION', stationSpecific: true },
  'station-location-001': { status: 'MAPPED', verified: true, claimType: 'LOCATION', stationSpecific: true },
  'chloride-gap-001': { status: 'UNKNOWN', verified: false, claimType: 'DATA_GAP', stationSpecific: true },
  'scenario-assumption-001': { status: 'ASSUMED', verified: false, claimType: 'SCENARIO', stationSpecific: false }
};
assert.deepEqual([...claimsById.keys()].sort(), Object.keys(reviewedClaims).sort(),
  'The case must contain exactly its four reviewed claims; additional claims require source review.');
for (const [id, expected] of Object.entries(reviewedClaims)) {
  const claim = claimsById.get(id);
  assert.equal(claim.status, expected.status, id + ' has an incorrect evidence classification.');
  assert.equal(claim.verified, expected.verified, id + ' has an incorrect verification flag.');
  assert.equal(claim.claimType, expected.claimType, id + ' has an incorrect claimType.');
  // A scenario assumption is not tied to a station, so stationId may be null there.
  if (expected.stationSpecific) assert.equal(claim.stationId, site.stationId, id + ' must refer to the case station.');
}
const runoffClaim = claimsById.get('hypothesis-runoff-001');
const stationClaim = claimsById.get('station-location-001');
const gapClaim = claimsById.get('chloride-gap-001');
const scenarioClaim = claimsById.get('scenario-assumption-001');
const caveats = claim => [claim.uncertainty, ...claim.doesNotEstablish].join(' ');

assert.equal(stationClaim.sourceUrl, USGS_URL, 'Verified station mapping must use the original USGS source.');
assert.equal(stationClaim.sourceUrl, site.sourceUrl, 'The station claim and the site record must cite the same source.');
assert.equal(site.verified, stationClaim.verified, 'site.verified must rest on the audited station-location claim.');
assert.match(caveats(stationClaim), /chloride/i, 'A mapped station must state that it does not establish chloride data.');

assert.equal(runoffClaim.sourceName, null, 'No source has verified the hypothetical runoff route.');
assert.equal(runoffClaim.sourceUrl, null, 'No source has verified the hypothetical runoff route.');
assert.match(runoffClaim.text, /\b(could|may|might|possibl[ey])\b/i, 'The runoff hypothesis must be worded as a possibility, not a finding.');
for (const code of ['connectivity', 'chloride']) {
  assert.ok(runoffClaim.evidenceGaps.includes(code), 'The runoff hypothesis must keep its open evidence gap: ' + code);
}
assert.match(caveats(runoffClaim), /drainage/i, 'Runoff caveats must say that no drainage connection is established.');
assert.match(caveats(runoffClaim), /caus/i, 'Runoff caveats must say that road-specific causation is not established.');

assert.ok(gapClaim.evidenceGaps.includes('chloride'), 'The chloride gap must remain an open chloride evidence gap.');
assert.match(caveats(gapClaim), /zero/i, 'The chloride gap must not be read as zero chloride.');
assert.match(caveats(gapClaim), /exist/i, 'The chloride gap must not be described as proof that measurements do not exist.');

assert.equal(scenarioClaim.sourceName, null, 'A scenario assumption has no evidentiary source.');
assert.equal(scenarioClaim.sourceUrl, null, 'A scenario assumption has no evidentiary source.');
assert.ok(scenarioClaim.evidenceGaps.includes('safety'), 'The scenario must keep its road-safety review gap.');
assert.match(caveats(scenarioClaim), /chloride/i, 'The scenario must not imply a change in stream chloride.');
assert.match(caveats(scenarioClaim), /safety/i, 'The scenario must not imply a road-safety conclusion.');

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
  if (feature.geometry !== null) {
    assert.ok(claim.verified && DOCUMENTED_STATUSES.includes(claim.status),
      feature.id + ': only documented, verified claims may place geometry on the map.');
  }
  if (feature.kind === 'HYPOTHETICAL_CONNECTION') {
    assert.equal(feature.status, 'INFERRED', feature.id + ' hypothetical connection must be INFERRED.');
    assert.equal(feature.showAsVerified, false, feature.id + ' hypothetical connection cannot appear verified.');
    assert.equal(feature.geometry, null, feature.id + ' must not invent an unsourced road-to-stream route.');
    if (feature.presentation !== undefined) {
      assert.equal(feature.presentation, 'CONCEPTUAL_SCHEMATIC_ONLY', feature.id + ' may only be drawn as a conceptual schematic.');
    }
  }
}
for (const claim of claims) {
  for (const id of claim.featureIds) {
    assert.ok(featuresById.has(id), claim.id + ' references missing map feature ' + id);
    assert.equal(featuresById.get(id).claimId, claim.id, id + ' must point back to the claim that references it.');
  }
}
assert.deepEqual([...featuresById.keys()].sort(), [CANDIDATE_FEATURE_ID, STATION_FEATURE_ID].sort(),
  'Only the reviewed station and hypothetical connection belong in this case.');
const stationFeature = featuresById.get(STATION_FEATURE_ID);
assert.equal(stationFeature.kind, 'MONITORING_STATION', 'Station feature kind must be MONITORING_STATION.');
assert.equal(stationFeature.claimId, stationClaim.id, 'Station feature must reference station-location-001.');
assert.deepEqual(stationClaim.featureIds, [STATION_FEATURE_ID], 'station-location-001 must reference only the station feature.');
assert.equal(stationFeature.status, 'MAPPED', 'Station feature must be MAPPED.');
assert.equal(stationFeature.showAsVerified, true, 'Reviewed station feature must show as verified.');
assertObject(stationFeature.geometry, 'Station geometry');
assert.equal(stationFeature.geometry.type, 'Point', 'Station geometry must be a GeoJSON Point.');
assert.deepEqual(stationFeature.geometry.coordinates, [site.longitude, site.latitude],
  'Station coordinates must use GeoJSON [longitude, latitude] ordering.');
const candidateFeature = featuresById.get(CANDIDATE_FEATURE_ID);
assert.equal(candidateFeature.kind, 'HYPOTHETICAL_CONNECTION', 'Candidate link must remain a hypothetical connection.');
assert.equal(candidateFeature.claimId, runoffClaim.id, 'Candidate link must reference hypothesis-runoff-001.');
assert.deepEqual(runoffClaim.featureIds, [CANDIDATE_FEATURE_ID], 'hypothesis-runoff-001 must reference only the candidate link.');
assert.equal(candidateFeature.status, 'INFERRED', 'Candidate link must remain INFERRED.');
assert.equal(candidateFeature.showAsVerified, false, 'Candidate link must not show as verified.');
assert.equal(candidateFeature.geometry, null, 'Candidate link must not carry drainage geometry.');
assert.deepEqual(gapClaim.featureIds, [], 'The chloride gap must not imply a mapped measurement feature.');
assert.deepEqual(scenarioClaim.featureIds, [], 'A scenario assumption must not place anything on the map.');

// G. Scenario assumptions are not real municipal treatment records.
assert.equal(scenarioDefaults.status, 'ASSUMED', 'Scenario inputs must be labeled ASSUMED.');
assert.equal(scenarioClaim.status, scenarioDefaults.status, 'The scenario claim and the scenario inputs must share the ASSUMED status.');
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
  [NOAA_SOURCE_ID]: NOAA_URL,
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
// Each scientific limit must be stated by at least one entry; exact wording is free.
const requiredLimitations = [
  ['no event-matched chloride measurement has been verified', text => /chloride/i.test(text) && /measurement/i.test(text) && /verified/i.test(text)],
  ['the snowfall is a storm total, not an hourly series', text => /storm total/i.test(text) && /hourly/i.test(text)],
  ['no particular road, outfall, or route has been proven', text => /road/i.test(text) && /proven|established/i.test(text)],
  ['scenario inputs are hypothetical', text => /scenario/i.test(text) && /hypothetical|assum/i.test(text)],
  ['empty observations do not mean zero chloride', text => /observations/i.test(text) && /zero/i.test(text)],
  ['the investigation window is distinct from the NOAA event record', text => /NOAA/.test(text) && /window/i.test(text)]
];
for (const [topic, covers] of requiredLimitations) {
  assert.ok(limitations.some(covers), 'Limitations must state that ' + topic + '.');
}

// Offline regression checks protect the reviewed contract; they cannot authenticate
// measurements or re-audit live sources. Future observations require a schema/source review.
console.log('Case study tests passed (8 categories; ' + claims.length + ' claims, ' + observations.length + ' observations).');
