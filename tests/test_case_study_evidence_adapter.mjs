import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const caseStudyPath = new URL('../data/case_study.json', import.meta.url);
const moduleUrl = (fileUrl) => `data:text/javascript;base64,${Buffer.from(readFileSync(fileUrl, 'utf8')).toString('base64')}`;
const { adaptCaseStudyForEvidence } = await import(moduleUrl(new URL('../case-study-evidence-adapter.mjs', import.meta.url)));
const { createEvidenceEngine, validateCaseStudy } = await import(moduleUrl(new URL('../evidence.js', import.meta.url)));

function loadAuthoritativeCase() {
  return JSON.parse(readFileSync(caseStudyPath, 'utf8'));
}

test('adapter supplies evidence-engine fields without mutating the authoritative case', () => {
  const originalText = readFileSync(caseStudyPath, 'utf8');
  const authoritativeCase = JSON.parse(originalText);
  const originalSnapshot = structuredClone(authoritativeCase);
  const adapted = adaptCaseStudyForEvidence(authoritativeCase);

  assert.deepEqual(validateCaseStudy(adapted), { valid: true, errors: [] });
  assert.deepEqual(authoritativeCase, originalSnapshot);
  assert.equal(readFileSync(caseStudyPath, 'utf8'), originalText);

  const station = adapted.claims.find((claim) => claim.id === 'station-location-001');
  const runoff = adapted.claims.find((claim) => claim.id === 'hypothesis-runoff-001');
  const chlorideGap = adapted.claims.find((claim) => claim.id === 'chloride-gap-001');
  assert.equal(station.claimType, 'LOCATION');
  assert.equal(runoff.claimType, 'CONNECTION');
  assert.equal(chlorideGap.claimType, 'DATA_GAP');
  assert.deepEqual(station.nextEvidenceNeeded, [authoritativeCase.claims[0].nextEvidenceNeeded]);
  assert.deepEqual(runoff.nextEvidenceNeeded, [authoritativeCase.claims[1].nextEvidenceNeeded]);
  assert.deepEqual(chlorideGap.nextEvidenceNeeded, [authoritativeCase.claims[2].nextEvidenceNeeded]);
  assert.equal(adapted.observations.length, 0);
  assert.equal(adapted.mapFeatures.find((feature) => feature.id === 'candidate-link-001').geometry, null);
});

test('adapted evidence preserves documented-only visibility and the unresolved runoff hypothesis', () => {
  const engine = createEvidenceEngine(adaptCaseStudyForEvidence(loadAuthoritativeCase()));
  assert.deepEqual(engine.getVisibleFeatures('documented').map((feature) => feature.id), ['stony-brook-gage-001']);
  assert.ok(!engine.getVisibleFeatures('documented').some((feature) => feature.id === 'candidate-link-001'));
  assert.equal(engine.evaluateClaim('hypothesis-runoff-001').result, 'NOT PROVEN');
  assert.equal(engine.evaluateClaim('hypothesis-runoff-001').supported, false);
});

test('adapter fails closed when a claim cannot be safely recognized', () => {
  const unfamiliar = loadAuthoritativeCase();
  unfamiliar.claims[0].status = 'MEASURED';
  assert.throws(() => adaptCaseStudyForEvidence(unfamiliar), /unsupported status/i);
});
