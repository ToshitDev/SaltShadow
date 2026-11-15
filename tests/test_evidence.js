import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceEngine, validateClaim, validateCaseStudy, safeSourceUrl } from '../evidence.js';
import { loadCase, syntheticMeasurement } from './fixtures.js';

test('case and all default claims satisfy the shared v1 contract', () => {
  const data = loadCase(); assert.deepEqual(validateCaseStudy(data), { valid: true, errors: [] });
  data.claims.forEach(claim => assert.equal(validateClaim(claim).valid, true));
});
test('invalid and incomplete claim objects fail validation', () => {
  for (const invalid of [null, undefined, [], {}, { id: 'bad', status: 'MADE_UP' }]) assert.equal(validateClaim(invalid).valid, false);
  const claim = syntheticMeasurement({ units: null, method: null, sourceUrl: null, observedAt: 'not-a-date' });
  const result = validateClaim(claim); assert.equal(result.valid, false); assert.ok(result.errors.length >= 4);
});
test('measurement requires observed property, finite value, station, date, source, units and method', () => {
  assert.equal(validateClaim(syntheticMeasurement()).valid, true);
  for (const key of ['observedProperty', 'value', 'stationId', 'observedAt', 'sourceName', 'sourceUrl', 'units', 'method']) assert.equal(validateClaim(syntheticMeasurement({ [key]: null })).valid, false, key);
  for (const value of [NaN, Infinity, '12']) assert.equal(validateClaim(syntheticMeasurement({ value })).valid, false);
  assert.equal(validateClaim(syntheticMeasurement({ value: 0 })).valid, true, 'an explicitly observed zero is valid');
});
test('mapped station cannot masquerade as a measured chloride observation', () => {
  const claim = loadCase().claims[1]; assert.equal(claim.status, 'MAPPED');
  assert.equal(validateClaim({ ...claim, status: 'MEASURED' }).valid, false);
  assert.equal(validateClaim({ ...claim, claimType: 'CONNECTION' }).valid, false);
});
test('verified inference, assumption or unknown is invalid', () => {
  for (const status of ['INFERRED', 'ASSUMED', 'UNKNOWN']) assert.equal(validateClaim({ ...loadCase().claims[0], status, verified: true }).valid, false);
});
test('unsupported connection returns NOT PROVEN and explicitly is not disproven', () => {
  const engine = createEvidenceEngine(loadCase()); const result = engine.evaluateClaim('hypothesis-runoff-001');
  assert.equal(result.result, 'NOT PROVEN'); assert.equal(result.supported, false); assert.equal(result.disproven, false);
  assert.match(result.explanation, /does not mean.*false/); assert.equal(result.missingEvidence.length, 2);
});
test('mapped claim supports only its narrow location statement', () => {
  const result = createEvidenceEngine(loadCase()).evaluateClaim('station-location-001');
  assert.equal(result.result, 'SUPPORTED'); assert.ok(result.doesNotEstablish.some(text => text.includes('Chloride')));
  assert.equal(result.sourceUrl, loadCase().site.sourceUrl); assert.match(result.uncertainty, /accuracy/);
});
test('a source URL alone cannot verify a hypothesis', () => {
  const data = loadCase(); data.claims[0].sourceUrl = data.site.sourceUrl;
  assert.equal(createEvidenceEngine(data).evaluateClaim(data.claims[0].id).supported, false);
});
test('invalid supposedly documented claim fails closed', () => {
  const data = loadCase(); data.claims[1].sourceUrl = null;
  const engine = createEvidenceEngine(data); assert.equal(engine.evaluateClaim('station-location-001').result, 'NOT PROVEN');
  assert.ok(engine.getMissingEvidence('station-location-001').some(item => item.includes('named source and URL')));
  assert.equal(engine.getVisibleFeatures('documented').length, 0);
});
test('unknown claim IDs have an honest missing-evidence result', () => {
  const engine = createEvidenceEngine(loadCase()); assert.equal(engine.getClaimById('missing'), null);
  const result = engine.evaluateClaim('missing'); assert.equal(result.status, 'UNKNOWN'); assert.equal(result.result, 'NOT PROVEN');
  assert.ok(engine.getMissingEvidence('missing').length); assert.equal(result.disproven, false);
});
test('documented-only removes unsupported connection, preserves verified station', () => {
  const engine = createEvidenceEngine(loadCase());
  assert.deepEqual(engine.getVisibleFeatures('documented').map(f => f.id), ['station-01401000']);
  assert.deepEqual(engine.getClaims('documented').map(c => c.id), ['station-location-001']);
});
test('hypotheses restore without mutating data, classifications or geometry', () => {
  const data = loadCase(); const before = structuredClone(data); const engine = createEvidenceEngine(data);
  engine.getVisibleFeatures('documented'); const restored = engine.getVisibleFeatures('hypotheses');
  assert.equal(restored.length, 2); assert.equal(restored[1].geometry, null); assert.deepEqual(data, before);
  assert.equal(engine.evaluateClaim('hypothesis-runoff-001').status, 'INFERRED');
});
test('returned records and original data cannot mutate the engine snapshot', () => {
  const data = loadCase(); const engine = createEvidenceEngine(data); data.claims[1].verified = false;
  const claim = engine.getClaimById('station-location-001'); claim.verified = false;
  const features = engine.getVisibleFeatures(); features[0].id = 'changed';
  assert.equal(engine.evaluateClaim('station-location-001').supported, true);
  assert.equal(engine.getVisibleFeatures()[0].id, 'station-01401000');
});
test('claim-to-feature references are reciprocal and stable', () => {
  const data = loadCase(); data.mapFeatures.forEach(feature => {
    const claim = data.claims.find(item => item.id === feature.claimId); assert.ok(claim.relatedFeatureIds.includes(feature.id));
  });
  data.claims[0].relatedFeatureIds = ['missing']; assert.equal(validateCaseStudy(data).valid, false);
  assert.ok(!createEvidenceEngine(data).getVisibleFeatures().some(f => f.id === 'candidate-link-001'));
});
test('duplicate IDs and orphan features are rejected', () => {
  const data = loadCase(); data.claims.push(structuredClone(data.claims[0]));
  assert.equal(validateCaseStudy(data).valid, false); assert.throws(() => createEvidenceEngine(data), /Duplicate/);
  const orphan = loadCase(); orphan.mapFeatures[0].claimId = 'missing'; assert.equal(validateCaseStudy(orphan).valid, false);
});
test('legacy featureIds alias is compatible and conflicting aliases are rejected', () => {
  const data = loadCase(); data.claims.forEach(c => { c.featureIds = c.relatedFeatureIds; delete c.relatedFeatureIds; });
  assert.equal(validateCaseStudy(data).valid, true);
  assert.equal(createEvidenceEngine(data).getVisibleFeatures('documented').length, 1);
  data.claims[0].relatedFeatureIds = []; assert.equal(validateClaim(data.claims[0]).valid, false);
});
test('feature status alone never bypasses the claim audit', () => {
  const data = loadCase(); data.mapFeatures[1].status = 'MAPPED'; data.mapFeatures[1].showAsVerified = true;
  assert.deepEqual(createEvidenceEngine(data).getVisibleFeatures('documented').map(f => f.id), ['station-01401000']);
});
test('unsafe source schemes are rejected', () => {
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,hello', null]) assert.equal(safeSourceUrl(url), null);
  assert.equal(validateClaim(syntheticMeasurement({ sourceUrl: 'javascript:alert(1)' })).valid, false);
});
test('invalid modes fail explicitly', () => assert.throws(() => createEvidenceEngine(loadCase()).getVisibleFeatures('bogus'), /Mode/));

test('impossible calendar dates and ambiguous measurement timestamps are rejected', () => {
  for (const observedAt of ['2026-02-30', '2026-01-25T12:00:00', '01/25/2026', '2026-13-01']) assert.equal(validateClaim(syntheticMeasurement({ observedAt })).valid, false);
});
test('malformed case entries produce validation errors rather than crashing the validator', () => {
  const data = loadCase(); data.claims.push(null); data.mapFeatures.push(null);
  assert.equal(validateCaseStudy(data).valid, false);
  const invalidRefs = loadCase(); invalidRefs.claims[0].relatedFeatureIds = 42;
  assert.equal(validateCaseStudy(invalidRefs).valid, false);
});
test('invalid event dates, timezones and supporting claim references are reported', () => {
  const data = loadCase(); data.event.startDate = '2026-02-30'; data.event.timezone = 'not-a-zone';
  data.claims[0].supportingClaimIds = ['missing-claim'];
  assert.equal(validateCaseStudy(data).valid, false); assert.ok(validateCaseStudy(data).errors.length >= 3);
});
test('an empty case has a clear validation message', () => {
  const data = loadCase(); data.claims = []; data.mapFeatures = [];
  assert.ok(validateCaseStudy(data).errors.some(error => error.includes('No claims are available')));
});
